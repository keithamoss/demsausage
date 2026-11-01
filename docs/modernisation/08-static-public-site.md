## 15. Static public site on S3/CDN, local stack and benchmarks

Detail and working notes live in `project_cache/PLAN.md`; this file is the summary.

### Goals
- Make the public site serverless so an election day does not depend on Django or the database.
- Load at least as fast as production.

### Design
- Map loads one points GeoJSON; every other public read comes from static objects, not the API.
- Per-booth objects (`booths/{id}.json`) preferred over a single NDJSON file with byte-range requests, because offsets shift on any edit. Layout: `manifest.json`, `points.geojson`, `booths/`, `lookup/`, `stalls/`, `elections.json`, `stats/`, under a version prefix.
- Nearby search computed client-side from the points file. Stall create/edit/fetch-by-token and Mapbox search stay on the API or third party.
- Fan-out: about 15-20 GETs on a cluster click or nearby search; unbounded for hand-built `/by_ids/` URLs (cap at about 50).
- A static stall lookup should publish Approved stalls only, which changes current behaviour.
- The range-request prototype is in `project_cache/` (`process.py`, `create_index.py`, `test_index.py`) and has two unfixed bugs (text-mode byte offsets; first-feature-without-ID `NameError`).

### Local full stack (this container)
- The Compose stack runs: db, redis, memcached, django, worker, rq_dashboard, both Vite frontends, nginx. `memcached_gui` does not start (old image manifest).
- The Django suite passes: 161 passed, 2 xfailed.
- Workarounds (untracked, local only): `docker-compose.override.yml` (official `redis:6.2`, sandbox Dockerfile), `django/Dockerfile.sandbox` (`pip install poetry`), throwaway `secrets/dev/*` and self-signed `keys/`, raised `fs.inotify.max_user_watches`.
- Repo defects found on a fresh database:
  - The `demsausage` schema must exist before migrating (migration 0028 hard-codes it).
  - Migration 0052 uses the live `PollingPlaces` model, so it fails on an empty database.
  - `bitnami/redis:6.2-debian-10` no longer exists on Docker Hub.
  - The loader requires `GOOGLE_GEOCODING_API_KEY` even when no geocoding is needed.
  - Dedupe fails when a booth's division in the CSV differs from the boundary data.

### Data loaded
- Election 1 (Federal 2025), 6,630 booths, via the admin loader endpoint with the fixture CSV and config. The election was created in a shell and a forged session used, so the admin UI was not driven.
- Boundaries are the 2022 federal divisions (2025 shapefiles are not in the repo). 19 booths needed temporary division overrides.
- Seeded: 35% of booths with random noms, 20 approved stalls, 5 facility types. Synthetic.

### Benchmarks (localhost, medians)
| Request | Current API | Static |
|---|---|---|
| Map points | 52 ms, 318 KB | 20 ms, 290 KB |
| 15 booth cards (curl) | 86 ms | 21 ms |
| Nearby / lookup | 105 / 43 ms | not built |

Playwright (`project_cache/bench/browser_bench.mjs`, 50 ms RTT, 100 Mbps): points 292 ms vs 413 ms; 15 cards 202 ms vs 206 ms. Parity at best. Runs showed multi-second to 80 s outliers on both servers, so tails come from the sandbox or Chrome throttling and are not usable. These numbers do not show the static design is faster.

### AWS design (not tested; from general AWS knowledge)
- One CloudFront distribution on the site's own domain: S3 origin (private, origin access control) for `/data/*` and the legacy read paths; Django stays on `/api/*` write paths only. Same domain avoids a separate connection and CORS.
- Versioned immutable keys (`data/v123/...`, one-year TTL) plus a small `manifest.json` with a 30 s TTL. Publishing writes a new version, then flips the manifest.
- Compression: either CloudFront on-the-fly (objects 1 KB - 10 MB) or pre-compressed brotli-11 stored with `Content-Encoding: br` (186 KB vs about 290 KB gzip for the points file). Pre-compressed objects break clients without brotli support, so third-party consumers need the on-the-fly path.
- HTTP/2 and HTTP/3 on; Origin Shield optional; `preload` the points file in the HTML.
- Avoid direct S3 access (no edge cache, no compression) and Lambda@Edge.

### Third-party API access without Django and the database
- Fixed-shape reads (map, elections, stats, single booth or stall): publish static files and keep the old URLs with a CloudFront Function that rewrites the query string to a path (`/api/0.1/map/?election_id=7` to `/api/0.1/map/7.json`).
- Queries with logic (`nearby`, `lookup`, `search?ids=`): a small Lambda behind CloudFront (function URL) that reads S3, with no database. Not built yet.
- Writes stay on Django. A CloudFront origin group can fall back to Django for unmigrated paths, but that quietly keeps the dependency.
- Use a CloudFront response-headers policy for CORS and AWS WAF rate limiting for third parties.
- First, find out who uses what: `project_cache/aws/analyse_api_usage.py` summarises nginx access logs by endpoint and first-party versus other (smoke-tested on two sample lines only).

### Test stack
`project_cache/aws/` holds `main.tf` (S3, CloudFront, rewrite function; `terraform validate` passes, never applied), `make_testdata.py`, `upload.sh` and a README with the test commands. The test data is gitignored and derived from the local snapshot.

### Benchmark re-run
A second 11-run Playwright pass (50 ms RTT, 100 Mbps) gave points 335 ms (current API) and 277 ms (static), reversing the earlier 292 vs 413 ms. The gap is within run-to-run noise, so no regression or gain is established from the sandbox. A cold connection to a separate static origin costs extra round trips; same-domain CloudFront or `preconnect` avoids it (unverified).

### Where we got to
- Design written and a local stack plus data exist to test against. Localhost numbers favour static; browser numbers show parity with noisy tails.
- The real frontend flows (page load, cluster click, permalink) have not been timed. S3 and CloudFront behaviour is unverified because AWS docs were unreachable.
- Nothing here is committed except this document.

### Potential next steps
- Apply `project_cache/aws/` in a test AWS account, upload the test data, and run `browser_bench.mjs` from a normal machine against production and CloudFront (README has the commands).
- Run `analyse_api_usage.py` against production nginx logs to identify third-party consumers.
- Prototype the publisher (replacing the signals plus `task_regenerate_cached_election_data` path) and verify range, CORS and compression behaviour on S3/CloudFront.
- Time the real frontend flows with a build-based run, not the Vite dev server.
- Decide how publishing works if Django is down when a stall is approved.
- Fix the fresh-database defects listed above.

### Open questions
- Is a fan-out of about 15-20 requests acceptable, or should cards be added to the points file or tiled?
- Should the static stall lookup publish Approved stalls only?
- What is the acceptable p50/p95 budget against production?
- Is it acceptable to cap `/by_ids/` at about 50?

## Frontend database-write audit (public site)

Only two public calls write to the database; everything else is read-only or a cache write.

| Request | DB | Side effects | Static-ready? |
|---|---|---|---|
| `GET map/?election_id` | read | `cache.set` (memcached) | Yes, publish to S3 |
| `GET elections/public`, `upcoming` | read | cache only | Yes |
| `GET elections/{id}/stats` | read (aggregates) | none (no `.save()`) | Yes, publish on a schedule |
| `GET polling_places/{nearby,lookup,search,stall_lookup}` | read | none | Yes / Lambda |
| `GET stalls/{id}?token&signature` | read | none | No, needs a Django or Lambda read (private data) |
| `GET map_image/{id}`, `current_map_image` | read | enqueues an RQ job (Firefox screenshot, then `cache.set`); returns a 2019 placeholder PNG until cached | Replace with a pre-rendered PNG per election in S3 (og:image) |
| `POST stalls/` | WRITE | `Stalls` row, history (IP from `X-Forwarded-For`), Mailgun email, Discord webhook | Stays on Django |
| `PATCH stalls/{id}/update_and_resubmit/` | WRITE | same, status reset to Pending | Stays on Django |

Notes:
- No analytics, beacons or raw `fetch` writes in the frontend. Google Analytics, Sentry, Mapbox, fonts and tiles are third party.
- GETs do not create sessions for anonymous users; `csrftoken` is only needed by the two writes.
- The map-image endpoint is the main hidden Django dependency: a social crawler hit enqueues a job that needs the worker, Redis and the DB.
- Writes also trigger `task_regenerate_cached_election_data` via signals on noms and polling-place changes. A static publisher would hook here.
- Admin-redesign (not public) writes: elections CRUD, set_primary, loader, clear_cache, polling place noms and notes, meta polling place links and tasks, stall approve, decline, match and add, profile view count. All stay on Django.
