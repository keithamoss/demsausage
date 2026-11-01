# Static public data via byte-range requests: plan

Status: proof of concept exists (`process.py`, `create_index.py`, `test_index.py`). No S3 or frontend work has been done, and the scripts have not been changed.

## Idea
Serve the public polling-place data as static files from S3 (or a CDN) instead of building the election-wide GeoJSON in Django. The public map would fetch the index, then use HTTP `Range` requests to read only the features it needs.

## What the proof of concept does
1. `process.py` converts `sausage-full.geojson` to newline-delimited JSON, one compact feature per line.
2. `create_index.py` writes `sausage-full-index.json`, mapping each feature ID to `(start_byte, end_byte)` in that file.
3. `test_index.py` looks up an ID and reads only those bytes. This is the local stand-in for `Range: bytes=start-end`.
4. `.gitignore` excludes `*.json` and `*.geojson`, so the data files are not in the repo.

## Known problems in the scripts (recorded, not fixed)
1. `test_index.py` opens the file in text mode but the offsets are byte counts, so reads break once any non-ASCII character appears (for example a venue name). It should open the file in binary mode and decode the bytes.
2. `create_index.py` uses `feature_bytes` even when a feature has no ID: it raises `NameError` on the first such feature, and otherwise reuses the previous length and corrupts every later offset. The length should be computed for every line, before the ID check.

## Design questions to settle before building
- **Access pattern:** does the map need individual features by ID (the index fits), or all features in the viewport (a spatial format such as PMTiles or FlatGeobuf fits better)? Today the public map loads the whole election GeoJSON in one fetch (`OpenLayersMap.tsx:374-375`).
- **Measure first:** the current GeoJSON size and parse cost are unmeasured (file 05, section 12). If the full file gzips to a few hundred KB, static hosting with a plain file may be enough and range requests are unnecessary.
- **Compression:** S3 range requests apply to the stored bytes, so a gzipped file cannot be sliced by feature. Either store uncompressed, or compress per chunk.
- **Freshness and cache:** the current cache is nginx memcached plus Django signals. Static files need a publish step triggered when polling places or stalls change, and an invalidation or short TTL.
- **Moderation data:** approved stall and noms data changes during an election, so check how often the file would be rebuilt and how stale it may be.
- **Hosting:** S3 plus CloudFront, or the current VM. Needs CORS and `Accept-Ranges` support. Check the cost against the Docker Compose host.
- **Index delivery:** the full index for thousands of features may itself be large; consider sharding it or embedding it in a manifest.

## Potential next steps
1. Measure the current election GeoJSON: raw size, gzip size, and client parse time.
2. Decide the access pattern (by ID versus viewport), then pick the format.
3. Fix the two script problems above, and add a small test using non-ASCII data.
4. Build the publish step in Django that writes the file and the index when data changes.
5. Prototype the public map reading from a static URL with range requests, behind a feature flag.
6. Compare latency and load against the current endpoint.

## Open questions
- Where was this meant to be hosted (S3, CloudFront, another provider)?
- What was the motivation: load on the VM, map speed, cost, or resilience on election day?
- Does the map need only IDs from an index, or spatial queries?
- Is serving stale data for a short window acceptable?
- Should this link to `docs/modernisation/` as a new section 15?

## Intent (clarified)
The map loads only a simple points GeoJSON. Every other public read request is then served purely from S3 using range requests, with no call to the Django API.

## Analysis: public front-end paths that use the API
Source: `public-redesign/src/app/services/*.ts`, `OpenLayersMap.tsx:374-375`, and the Django views and serializers behind them. Written from code reading; nothing was run.

| # | Frontend call | Django endpoint | Used for | What the backend does | Static replacement |
|---|---|---|---|---|---|
| 1 | Map loader (`OpenLayersMap.tsx`) | `GET /map/?election_id=` | All points on the map | Already served from nginx memcached (`django_memcached.conf:17-25`). Properties are only `id, noms, name, premises, state, ec_id` (`PollingPlacesGeoJSONSerializer`). | One points GeoJSON per election. Trivial. Already the intended "simple GeoJSON". |
| 2 | `getPollingPlaceByUniqueDetailsLookup` | `GET /polling_places/lookup/` | Map-click drawer, permalinks, add-stall form, debug view | `find_by_lookup_terms`: matches `ec_id`, else case-insensitive name+state(+premises) with `_` turned into space; returns only if exactly one row. Returns full detail plus `has_approved_subs` (a history query). | Detail records in an NDJSON file plus an index keyed by the normalised name, premises and state key (and `ec_id`). Ambiguous keys must be left out at publish time to keep the "exactly one" rule. |
| 3 | `getPollingPlaceByIdsLookup` | `GET /polling_places/search/?ids=` | Shared and saved lists of polling places | Filter `id IN (...)`. Only `ids` is used by the public app; `search_term` and `polling_place_names` exist but are unused here. | One range request per id. S3 does not serve multiple ranges in one GET, so fetch in parallel or merge adjacent ranges. |
| 4 | `getPollingPlaceByLatLonLookup` | `GET /polling_places/nearby/` | "Search by address or GPS" | The 15 closest within 50 km, else the 15 closest within 1000 km (`filters.py:54-56`). Needs a spatial query. | No spatial index needed: the points are already in the browser from path 1, so compute the 15 nearest in the client, then fetch their details by id (path 3). |
| 5 | `getPollingPlaceByStallIdLookup` | `GET /polling_places/stall_lookup/?stall_id=` | Stall permalink | `find_by_stall` maps any stall id to its polling place regardless of status. | A small `stall_id -> polling_place_id` JSON map. Publish only Approved stalls (a behaviour change: today a Pending stall id also resolves). |
| 6 | `getElections` | `GET /elections/public/` | Election list | Memcached by nginx. | Small JSON. Whole-file fetch. |
| 7 | `getUpcomingElections` | `GET /elections/upcoming/` | "No live election" page | Filters hidden, non-test elections within 12 weeks of now, evaluated per request. | JSON of candidates, with the 12-week filter done in the client (or regenerated daily). |
| 8 | `getElectionStats` | `GET /elections/{id}/stats/` | Sausagelytics | Computed per request; 404 for election ids 1 and 29. | Precompute one JSON per election at publish time. Whole-file fetch. |
| 9 | `getStall`, `addStall`, `updateStallWithCredentials` | `GET/POST /stalls/`, `PATCH /stalls/{id}/update_and_resubmit/` | Submitting and editing stalls | Auth by emailed token and signature; creates and edits data. | Must stay on the API. Not a static candidate. |
| 10 | Mapbox search | Third party | Address search | n/a | Out of scope. |

Also check outside the frontend: the legacy `/map/`, the flat `PollingPlacesJSONViewSet` and the map PNG endpoints may have external consumers that this plan would not cover.

## Analysis: how S3 range requests would work
Unverified: I could not reach the AWS documentation from the sandbox, so these points come from general knowledge and need checking against the AWS docs before building.
- S3 `GET` supports a `Range: bytes=start-end` header and replies `206 Partial Content` with `Content-Range`.
- S3 supports a single range per request. A multi-range request returns the whole object, not parts. Use one request per record, or merge adjacent ones.
- Ranges apply to the stored bytes. If the object is stored gzipped (`Content-Encoding: gzip`), offsets refer to the compressed bytes and slicing by feature fails. Store the record file uncompressed. The index and points GeoJSON are fetched whole, so those can be compressed.
- Browsers: a simple single `Range: bytes=a-b` is, I believe, exempt from CORS preflight, but the response header `Content-Range` is readable cross-origin only if the bucket's CORS config has `ExposeHeaders: Content-Range, Accept-Ranges, ETag`. Allow `GET`, `HEAD` and the `Range` header. Test in a real browser.
- Put CloudFront in front. It supports range requests and caching, and makes the origin bucket private (origin access control). Check how it caches range responses and its compression behaviour for `Range` requests.
- Cost: S3 GET requests are roughly a few cents per 100,000 requests (check the current price for the chosen region), so cost is unlikely to matter at this scale.

## The main design problem: offsets change when any record changes
In a single NDJSON file, editing one booth's noms shifts the offsets of every later record, so the index must be rebuilt and both files replaced together. Noms change often during an election (every approved stall).
- A client holding an old index while the data file changes reads wrong bytes (possibly valid-looking JSON for a different record).
- Mitigations:
  1. **Versioned keys.** Publish `election-26/v123/records.ndjson` and `election-26/v123/index.json`, plus a short-lived `manifest.json` pointing at the current version. Clients read the manifest, then fetch only that version. Old versions stay for a while. Records and index can then be cached forever.
  2. **`If-Match: <etag>`** on every range request, so a changed file returns `412` and the client reloads the manifest.
  3. **Verify on read:** the record must contain the expected id, otherwise refetch.
- Honest alternative: one small object per booth (`details/{id}.json`). It needs no index offsets, no range requests, updates one object on change, caches per record on the CDN, and an election of about 7,000 booths is about 7,000 cheap PUTs. Range requests win only if a single-file, atomic, versioned publish is the goal. Decide this before building.

## Freshness and publishing
- Today signals clear the memcached entries and queue `task_regenerate_cached_election_data` (`pollingplace_views.py:489-520`). The static version needs an equivalent publish job, triggered when noms, stalls or polling places change.
- Define the acceptable staleness window, for example a few seconds to a minute on election day.
- The publish job should write the new version first and switch the manifest last.

## Other effects
- Removes five anonymous endpoints and their load from Django, and shrinks the attack surface from the security review. The static detail serializer must expose only what the public API exposes today (no submitter email or triage data).
- `has_approved_subs` is computed per request from history; it becomes a publish-time field (the serializer notes say it is already "buggy", so decide what it should mean).
- The map's `&s=Date.now()` cache-bust goes away; use the versioned URL instead.
- Frontend: replace the RTK Query base query for these reads with a static-data client, and keep the existing types.

## Updated next steps
1. Measure: record count, bytes per record, size of the points GeoJSON, and the gzipped index for the largest election.
2. Decide per-record objects versus a single versioned NDJSON (see above).
3. Prototype the publisher (Django task that writes the files), then a small static test page that does lookup, nearby (client-side) and by-ids with range requests against a real S3 bucket and CloudFront, in a browser.
4. Verify the S3 and CORS behaviour listed above with real requests.
5. Decide on the stall-lookup behaviour change and the stats and upcoming handling.
6. Fix the two script problems and add a test with non-ASCII data.

## Additional open questions
- Is per-booth objects an acceptable alternative to range requests?
- How stale may data be on election day?
- Are there external consumers of `/map/`, the flat JSON or the lookup endpoints?
- Is a CloudFront and S3 setup acceptable operationally and for cost, given the current Docker Compose VM?
- May stall permalinks resolve only for Approved stalls?

## Revised direction: per-booth objects (goals and fan-out analysis)

### Goals (from the maintainer)
1. Make the public site serverless during an election, so it does not depend on Django or the database being up.
2. Keep the public site loading very fast.

Both goals favour per-booth objects over range requests: every read becomes a plain cacheable GET on S3 behind a CDN, with no offsets to keep in step with the data. Range requests remain a possible later optimisation (a hybrid bundle).

### Proposed layout (per election, under a version prefix)
- `manifest.json`: points to the current version. Short cache (about 5 to 30 seconds).
- `points.geojson`: map points. Versioned, compressed.
- `booths/{id}.json`: full detail for one booth (stall, noms text, `has_approved_subs`, extras).
- `lookup/...`: name, premises and state to id (small alias objects or one small map loaded after the map).
- `stalls/{id}.json`: stall id to booth id, Approved stalls only.
- `elections.json`, `stats/{id}.json`: whole files.

### Where many small GET requests would occur (public-redesign)
Everything else in the public app is one request per user action.

| Flow | Code | Today | With per-booth objects |
|---|---|---|---|
| Click on overlapping pins | `OpenLayersMap.tsx:360` (`features.slice(0, 20)`), `map.tsx:166-175` | One `search?ids=` call, up to 20 ids | Up to 20 GETs |
| Nearby search (address or GPS) | `searchComponent.tsx:138`, `LonLatFilter` (15 results) | One call, 15 results | 15 GETs |
| Shared or saved `/by_ids/` URL | `searchByIdsStackComponent.tsx:44` | One call, any number of ids | N GETs, unbounded |
| Single pin, stall permalink, add-stall form | `pollingPlaceCardDrawer.tsx:84`, `stallPermalink.tsx:18`, `addStallStallCreatorForm.tsx:104` | One lookup | One GET |
| Elections, upcoming, stats | `elections.ts`, `Sausagelytics.tsx:118` | One each | One each |
| Debug view | `debugView*.tsx` | About 15 hard-coded lookups | Development only |

Findings:
- The result cards (`searchResultsPollingPlaceCard.tsx`) read only `address`, `name`, `premises`, `stall` and `wheelchair_access` from the list response, and make no per-card requests, so there is no hidden fan-out.
- The fan-out is capped at about 15 to 20 in the app's own flows. A hand-built `/by_ids/` URL is the one unbounded case, so cap ids per request (for example 50).
- 15 to 20 parallel GETs over HTTP/2 or HTTP/3 to a CDN cost roughly one round trip, so this is probably acceptable. The cost is the cold-cache first hit. Measure it in a browser before optimising.

### If the fan-out proves too slow
- Publish spatial tile objects (geohash or grid): each tile holds the card fields for about 50 to 100 nearby booths. A nearby search or cluster click then needs one to three GETs and no range requests. Full detail stays in `booths/{id}.json`.
- Alternatively add `address` and `wheelchair_access` to `points.geojson` so list cards need no extra request. This enlarges the file loaded on every visit, so it costs map speed.

### Updated next steps
1. Measure: booth count, bytes per booth object, points file size (raw and gzipped) for the largest election.
2. Prototype the publisher (a Django task triggered by the signals that currently clear the memcached entries), writing a new version prefix and switching the manifest last.
3. Build a static test page: map click, nearby (computed client-side from the points), by-ids with parallel GETs and the id cap, against a real S3 bucket and CDN, timed cold and warm in a browser.
4. Decide on tiles versus plain per-booth objects from the timings.
5. Resolve the open questions: staleness window, behaviour change for stall permalinks, external consumers of the old endpoints, and what happens if Django is down when a stall is approved (publishing depends on it).
6. Fix the two script problems if the range-request bundle is kept as a fallback.

## Local benchmark (compose stack, federal 2025 data, 6,630 booths)

Localhost only, so no network latency; medians of 5-7 runs, gzip on. Script: `bench/generate_static.py`, nginx config `bench/nginx-static.conf`.

| Request | Current API via nginx | Static snapshot |
|---|---|---|
| Map points | 52 ms, 318 KB (includes noms) | 20 ms, 290 KB (`points.geojson`, gzip default level) |
| 15 booth cards | 86 ms (`search?ids=`, incl. curl startup) | 21 ms (15 parallel GETs on one HTTP/2 connection) vs 15 ms for one GET |
| Nearby | 105 ms | not built (client-side from points file) |
| Lookup by ec_id | 43 ms | not built |

Caveats: the real result depends on RTT and CloudFront cache hits, which this can't measure. Per-booth objects are about 400 B gzipped, so the cost is request count, not bytes. Seed data is synthetic (35% of booths have random noms, 20 approved stalls, random facility types). Boundaries are the 2022 proxy.

### Browser benchmark (Playwright, `bench/browser_bench.mjs`)

`cd bench && npm i && node browser_bench.mjs --runs 9 --latency 50 --mbps 100` (uses `/usr/bin/google-chrome`; override `--api`/`--static` to point at real hosts). Fresh browser context per run, CDP network throttling, `fetch()` timed in-page.

Sandbox results (50 ms RTT, 100 Mbps, medians): points 292 ms current vs 413 ms static; 15 cards 202 ms (1 API call) vs 206 ms (15 static GETs). Treat as parity at best. Both sides show multi-second to 80 s outliers in a minority of runs, including the static server, so the tail numbers come from the sandbox or CDP throttling and are not usable. The 20 Mbps run gave about 2.7 s medians for both points flows, again dominated by the emulated link. Re-run on a normal machine against real S3/CloudFront and production before drawing conclusions; this does not prove the static design is faster.
