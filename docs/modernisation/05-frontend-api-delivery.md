## 12. Frontend, API and delivery analysis
Source: three read-only code-analysis passes. Claims marked (unverified) were not independently confirmed.

### Frontends
- Four React apps in the repo. Only `public-redesign` and `admin-redesign` are built into the production images (`nginx-prod/Dockerfile:10-14`, `build_production.yml`); `public` and `admin` (react-router v3, Redux) appear dead for deployment (medium confidence; confirm DNS and production nginx server blocks). `public-legacy`/`admin-legacy` are dev-only static fallbacks.
- The two redesigns share no code: each hand-writes `api.ts` and services (public 483 lines, admin 1,132), interfaces (`IPollingPlace` already differs), theme, auth and election helpers. Dependency versions have drifted (RTK 2.2.5 vs 2.5.1).
- No generated API client and no runtime validation (no zod); responses are trusted via TypeScript annotations. Snake_case is kept throughout.
- Routes are eagerly imported (no `lazy()`); OpenLayers, MUI, Victory and date pickers are heavy. Env vars are read unvalidated from `import.meta.env.VITE_*`.
- Public map: one election-wide GeoJSON fetch with `&s=Date.now()` cache-busting (`OpenLayersMap.tsx:374-375`), no clustering, GeoJSON also held in Redux. Size and parse cost unmeasured.
- Public lacks `setupListeners`; RTK tags are inconsistent (public declares only `Election`).
- Tests: 2 admin component tests; none in public; no Playwright.
- Admin hotspots: `ElectionLoaderReport.tsx` ~738 lines, `MetaPollingPlacePollingPlacesReviewList.tsx` ~500, `ElectionStats.tsx` ~450, `PendingStallsPollingPlace.tsx` ~430, `PendingUnofficialStalls.tsx` ~400. Pending-stall and unofficial-stall screens are the best base for a unified review queue.
- Parity gaps in redesign public (unverified): `/sausagelytics_v1`, `/embed-builder`.

### API
- DRF at `/api/0.1/`; ~38 serializer classes in `serializers.py`, many `SerializerMethodField`s. drf-spectacular is configured but has 0 `extend_schema` annotations; `StallsViewSet` has `schema = None`. Estimated 20-30 operations need annotation or overrides (unverified).
- N+1 risk: `MetaPollingPlacesSerializer.get_polling_places()` queries per MPP (`serializers.py:1219-1222`); task serializers run nearby-distance queries (`:1295-1307`).
- No throttling configured; anonymous stall submission is allowed and the serializer is chosen from client-supplied `submitter_type` (`stall_views.py:46-90`). Spam/abuse exposure.
- No pagination configured; error formats are inconsistent (custom `BadRequest`, `HttpResponseBadRequest`, hand-built `Response`).
- Caching: nginx memcached for `/elections/public`, `/map`, `/export`, images, plus Django set/delete and signal-queued regeneration (`pollingplace_views.py:465-540`, `signals.py:20-55`). Keys ignore query params; there are duplicate invalidation paths and stale/race windows.
- `/mail/` is `AllowAny` by design, and both actions are guarded (HMAC on opt-out, Mailgun signature on the webhook). Low severity. Verified small bugs: `mailgun_webhook` raises `UnboundLocalError` (a 500) when `signature` or `event-data` is missing; the opt-out hash comparison uses `!=` instead of a constant-time compare.
- API tests cover MPP/task endpoints and facility types only; none for public map/export, caching, schema, anonymous submission, CORS/CSRF, pagination, mail or users.
- Coupling to the redesign: numeric `PollingPlaces` and `MetaPollingPlaces` ids, nested `polling_places`, `meta_polling_place` and link PKs are exposed. A Booth/Venue migration breaks these clients unless compatibility serializers or a `/v1` are provided.

### Delivery and operations
- CI builds and pushes SHA-tagged images plus a mutable `latest-production`; no visible lint, typecheck or test gates in the production workflow (`prod_cicd.yml`); rollback is implicit.
- `django/Dockerfile:50-57` runs `poetry update` at build time, so images are not reproducible from the lockfile.
- Runtimes: Python 3.10 (security EOL in 2026), nginx 1.23.3, Redis 6.2, Node 20 alpine 3.19.
- No backup automation found. Sentry is in Django and both redesigns. Mapbox keys are browser-exposed by design; quota and referrer restrictions are unverified. The Django image bundles Firefox ESR and geckodriver for map screenshots.
- `ausvotes.withgoogle.com` holds only a README (low confidence orphan).

### Ranked recommendations
1. Annotate the API and publish the OpenAPI schema as the contract; generate TS types and RTK Query endpoints; snapshot-diff the schema in CI.
2. Add throttling and abuse controls for anonymous stall submission.
3. Add stable public identifiers and compatibility serializers (or `/api/v1`) before the Booth/Venue migration.
4. Add CI gates (lint, typecheck, tests) and replace `poetry update` with a locked install.
5. Extract a shared workspace package for types, base API, auth and theme; keep two apps.
6. Fix the map fetch: drop `Date.now()` and use versioned HTTP caching.
7. Lazy-load routes and isolate OpenLayers and charts.
8. Fix serializer N+1s and centralise cache generation and invalidation.
9. Upgrade Python, nginx and Redis; add tested Postgres backups.
10. Retire `public` and `admin` after confirming DNS and access logs; audit legacy-only endpoints from logs first.
11. Add MSW/Vitest service tests and Playwright smoke tests for the public map and the admin approval flow.

See [08-static-public-site.md](08-static-public-site.md) for the static S3/CDN design and benchmarks.

## Where we got to
- The analysis came from three exploration agents and is mostly unverified by direct inspection (the `/mail/` endpoint was checked and is guarded).
- Main themes: duplicated API types across the two redesigns, no generated client, an unannotated OpenAPI schema, no CI test gates, `poetry update` at build time, no backups found.
- No changes made.

## Potential next steps
- Annotate the API with `extend_schema` and generate a shared client, which also enables schema-driven fuzzing (file 07).
- Add CI gates, pin builds to the lockfile, and plan the Python upgrade.
- Confirm the legacy apps are unused, then retire them.
- Add the frontend tests listed above.

## Open questions
- Are `public` and `admin` (legacy) still served in production? Check DNS and nginx.
- Are there database backups, and has a restore been tested?
- Do external clients depend on the current API shape?
- Is a shared package between the two redesigns acceptable, or should they stay separate?
