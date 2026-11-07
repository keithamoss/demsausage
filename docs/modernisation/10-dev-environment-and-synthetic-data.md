# 10. Agent-friendly dev environment and synthetic data (plan)

Goal: an agent (or a new contributor) gets a working full stack with realistic synthetic data in one command, with no manual steps. Today it took many manual steps (see file 08, section on the local stack).

## 1. Problems seen (evidence from the local build)

| # | Problem | Where |
|---|---|---|
| 1 | Fresh database cannot migrate: 0028 hard-codes the `demsausage` schema, 0052 is a data migration using the live model | `django/demsausage/app/migrations` |
| 2 | `bitnami/redis:6.2-debian-10` image no longer pullable; `memcached_gui` image manifest is old | `docker-compose.yml` |
| 3 | `install.python-poetry.org` blocked in restricted networks | `django/Dockerfile` |
| 4 | Vite crashed on low `fs.inotify.max_user_watches` | host setting |
| 5 | Loader needs `GOOGLE_GEOCODING_API_KEY`, even for data that already has coordinates | loader |
| 6 | Loader dedupe needs electoral boundaries covering the election id; 2025 shapefiles unavailable, 2022 mismatched 19 booths | loader and `electoral_boundaries/` |
| 7 | Calling the API needed a forged session, `AllowedUsers` row, 32-char CSRF cookie and Referer | auth and CSRF |
| 8 | nginx held a stale upstream IP after django was recreated (502) | `nginx` config |
| 9 | No local sink for Mailgun and Discord | settings |
| 10 | Throwaway secrets and self-signed certs created by hand | `secrets/dev`, `keys/` |

## 2. Target developer experience

One entry point, `scripts/dev-env.sh`:

| Command | Effect |
|---|---|
| `up` | Generate dev secrets and certs if missing, start the stack, wait for health |
| `seed [--size small\|medium\|full]` | Load synthetic data, idempotent |
| `reset` | Drop and recreate the database, then `seed` |
| `login` | Print a working session cookie, CSRF token and a curl example |
| `status` | Container health, row counts, key URLs |
| `test` | The documented pytest command from `testing.instructions.md` |

Documented in `AGENTS.md` and used by `.github/workflows/copilot-setup-steps.yml` so the cloud agent gets the same environment.

## 3. Workstreams

### A. Bootstrap fixes (no data yet)
- Make migrations apply on an empty database (0028 creates the schema if missing; 0052 uses historical models or is guarded).
- CI job: migrate an empty Postgres and run the test suite.
- Committed `docker-compose.dev.yml` override: pinned `redis:6.2`, optional `memcached_gui` profile, pip-based poetry Dockerfile target, Mailpit.
- Health checks and `depends_on: condition: service_healthy`; nginx resolves upstreams dynamically so a recreated django does not 502.
- Script generates secrets and self-signed certs.
- Optional preflight check for `max_user_watches`.

### B. Seed data (`manage.py seed_dev_data`)
- Deterministic: fixed random seed and a `--seed` flag, so two runs give identical data.
- Sizes: `small` (about 200 booths, a few seconds, for agents and tests), `medium` (about 2,000), `full` (the 6,630-booth federal_2025 fixture).
- Creates: superuser, `AllowedUsers` row, facility types, elections (one active primary, one past with stats data, one future), synthetic boundaries, polling places through the real loader pipeline, noms, stalls in every status, meta polling places and tasks.
- Reuse `django/tests/fixtures/elections/federal_2025/` as the base input.
- Idempotent: running twice does not duplicate rows.

### C. Synthetic boundaries and offline geocoding
- Generate division polygons (for example a Voronoi or grid partition of the booths' bounding box) so dedupe and `find_home_division` always succeed, with no AEC download.
- Dev-only setting to bypass or stub the geocoder when coordinates are already present, so the geocoding key is not needed.
- Keep the real boundary path covered by existing tests.

### D. Shared factories
- Move test data creation into one factory module (factory_boy or plain functions) used by both pytest and `seed_dev_data`.
- Rule: if a model changes, one place changes.

### E. Auth helper
- `manage.py dev_login` creates or reuses the dev user and prints a session cookie and CSRF token (dev settings only, refuses to run when `DEBUG` is off).

### F. Mail and webhook sinks
- Mailpit container for email, and a tiny stub webhook container (or Mailpit-style logger) for Discord. Settings point at them in the dev profile.

### G. Snapshot for speed (later)
- `pg_dump` of the seeded `medium` database, built in CI as an artifact, restored in seconds by `dev-env.sh up --from-snapshot`.
- Rebuild automatically when migrations change. Skip the pre-seeded image until the snapshot proves too slow.

### H. Agent affordances
- `AGENTS.md`: commands, ports, URLs, known limits.
- `.github/workflows/copilot-setup-steps.yml` starts the stack and seeds `small`.
- A smoke-test script that checks: both sites 200, `/map/?election_id=` returns features, a stall can be submitted, and the loader dry-run works.

## 4. Order and sizing

1. A (bootstrap) is a prerequisite for everything else. Small to medium.
2. D then B then C. Medium to large, and the biggest value.
3. E, F, H. Small each.
4. G only if setup time matters after the above.

## 5. Acceptance criteria

- On a clean machine with Docker: `scripts/dev-env.sh up && scripts/dev-env.sh seed --size small` gives a working admin and public site in under 5 minutes, with no manual steps.
- The same command works in the cloud agent environment.
- Running seed twice gives identical row counts.
- CI proves an empty database migrates and that the seed runs.
- The existing pytest suite still passes (161 passed, 2 xfailed at the last run).

## 6. Risks and open questions

- Migration changes touch production history. Fixes must be safe for databases that have already applied them (no renumbering).
- Should `seed_dev_data` run in production settings at all? Proposed: refuse unless a dev flag is set.
- Synthetic stats data for old elections (stats return 404 for elections 1 and 29), so stats testing needs a second election.
- Where to keep the large `full` fixture: the repo already holds the federal_2025 CSV; confirm size and licence of anything new.
- Whether to use the real boundaries when present and synthetic otherwise.
- Decide on factory_boy vs plain functions.
- Restricted-network builds (blocked hosts): keep the pip-based Dockerfile path as a documented option.

## 7. Appendix: sandbox workarounds to fold into workstream A

These two local files were used to build the stack in a restricted sandbox. They were not committed, because `docker-compose.override.yml` loads automatically and would change everyone's `docker compose up`. Move their content into an opt-in `docker-compose.dev.yml` and a Dockerfile build target.

`docker-compose.override.yml`:

```yaml
# bitnami/redis:6.2-debian-10 no longer exists on Docker Hub.
services:
  django:
    build:
      context: django/
      dockerfile: Dockerfile.sandbox
  python_rq_worker:
    build:
      context: django/
      dockerfile: Dockerfile.sandbox
  redis:
    image: redis:6.2
    command: ["sh", "-c", "exec redis-server --requirepass \"$$REDIS_PASSWORD\""]
    volumes: !override []
```

`django/Dockerfile.sandbox` is a copy of `django/Dockerfile` with one change: poetry is installed with `RUN pip install poetry` instead of the `install.python-poetry.org` script (which is blocked in restricted networks). Make this a build argument or a separate stage in the real Dockerfile rather than a copy.

Other local-only steps: `docker compose` v2 plugin installed manually, `fs.inotify.max_user_watches=524288`, the `demsausage` schema created by hand, and migration 0052 temporarily no-oped (see workstream A).
