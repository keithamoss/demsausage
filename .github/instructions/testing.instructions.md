---
applyTo: "django/**"
---

# Running the Django Test Suite

The compose stack (`docker compose up`) is assumed to be already running. Always use `exec` into the running `django` container — never `docker compose run` — to avoid the entrypoint startup delay.

## Commands

Fast suite — parallel, skips slow tests (default for development):
```bash
docker compose exec django bash -c "cd /app && pytest tests/ --tb=short -q"
```

Full suite — includes slow integration tests:
```bash
docker compose exec django bash -c "cd /app && pytest tests/ --tb=short -q -m ''"
```

Slow tests only:
```bash
docker compose exec django bash -c "cd /app && pytest tests/ --tb=short -q -m slow"
```

Single file (faster iteration):
```bash
docker compose exec django bash -c "cd /app && pytest tests/loader/test_write_fields.py -v"
```

Single test:
```bash
docker compose exec django bash -c "cd /app && pytest tests/loader/test_convert.py::test_rename_columns -v"
```

Serial execution (for debugging parallel failures):
```bash
docker compose exec django bash -c "cd /app && pytest tests/ -n0 --tb=short -q"
```

## Parallelism

Tests run in parallel by default via `pytest-xdist` (`-n auto` in `addopts`). This is safe because:
- All tests use savepoint rollback (`@pytest.mark.django_db` without `transaction=True`)
- All fixtures are function-scoped
- No shared mutable state between tests

Use `-n0` to disable parallelism when debugging a specific failure.

## Slow tests

The three tests in `test_data_integrity.py` run a full load pipeline against a real ~1700-row CSV and collectively take ~130s. They are marked `@pytest.mark.slow` and **excluded by default** (`-m 'not slow'` in `addopts`). Run them explicitly in CI or before merging significant loader changes.

The fast suite (no slow tests) completes in under 10 seconds.

## Rules

- Always use `docker compose exec django` (not `docker compose run --rm django`) so the command runs inside the already-running container with no entrypoint overhead.
- Always run foreground (no background terminals) with a generous timeout (≥ 120 000 ms for the fast suite, ≥ 420 000 ms for the full suite). This prevents truncated output.
- If the stack is not running, start it first: `docker compose up -d`
