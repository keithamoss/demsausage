# VIC 2026 Polling-Place Match Overrides

## Purpose and Rules

During the polling-place load, the loader matches each old polling place to exactly one new polling place within 100m, unless `config.json` has an `overwrite_distance_thresholds` entry for the old polling-place name. Thresholds are in kilometres and match by the old record's exact `name`.

These overrides cover legacy/unofficial polling-place points that are close to, but not exactly on, the VEC's official map pin. They are intended only where the target is identifiable and the configured radius contains exactly one official polling place. Do not increase a radius merely to silence a no-match error: first check which candidates fall inside it.

## Current Overrides

Distances were measured from the archived pre-load polling-place coordinates in DEV to the 7 November 2026 CSV. The buffer is the configured radius minus the measured distance. Current thresholds follow the rule: round the measured distance up to the next 5m, then add 25m. Each threshold was checked against the CSV and selected exactly one polling place.

| Old polling-place name | Old submitted address | Matched polling place (premises / venue name) | Distance | Config threshold | Spare radius |
|---|---|---|---:|---:|---:|
| `11 Fernhill Road` | 11 Fernhill Road, Sandringham Victoria 3191, Australia | Sacred Heart School (Sandringham) / Sandringham | 101.5m | 130m (0.130km) | 28.5m |
| `149 Appin Street` | 149 Appin Street, Wangaratta Victoria 3677, Australia | Appin Park Primary School / Appin | 106.4m | 135m (0.135km) | 28.6m |
| `105 Orchard Road` | 105 Orchard Road, Doreen Victoria 3754, Australia | Ashley Park Primary School / Ashley Park | 133.6m | 160m (0.160km) | 26.4m |
| `358 Cheltenham Road` | 358 Cheltenham Road, Keysborough Victoria 3173, Australia | Keysborough Scout Hall / Keysborough | 145.9m | 175m (0.175km) | 29.1m |
| `44 Murphy Street` | 44 Murphy Street, Brighton Victoria 3186, Australia | Elsternwick Primary School / Elsternwick South | 165.6m | 195m (0.195km) | 29.4m |
| `Black Rock Primary School` | 71 Arkaringa Cres, Melbourne 3193, Australia | Black Rock Primary School / Black Rock | 104.1m | 130m (0.130km) | 25.9m |
| `Banyule Primary School` | 50 Banyule Rd, Melbourne 3084, Australia | Banyule Primary School / Banyule | 116.2m | 145m (0.145km) | 28.8m |
| `Sherbourne Primary School` | 17 Outlook Cres, Melbourne 3088, Australia | Sherbourne Primary School / Sherbourne | 114.5m | 140m (0.140km) | 25.5m |
| `Vermont Secondary College` | 27-63 Morack Rd, Melbourne 3133, Australia | Vermont Secondary College / Morack | 124.9m | 150m (0.150km) | 25.1m |
| `Whittlesea Secondary College` | 55 Laurel St, Whittlesea 3757, Australia | Whittlesea Secondary College / Whittlesea | 139.9m | 165m (0.165km) | 25.1m |
| `Buninyong Primary School` | 202 Simpson St, Ballarat 3357, Australia | Buninyong Primary School / Buninyong | 140.7m | 170m (0.170km) | 29.3m |
| `Sacred Heart College` | 94 High St, Kyneton 3444, Australia | Sacred Heart College (Kyneton) / Kyneton East | 188.4m | 215m (0.215km) | 26.6m |
| `Fairfield Primary School` | 5 Langridge St, Melbourne 3078, Australia | Fairfield Primary School / Fairfield | 136.7m | 165m (0.165km) | 28.3m |
| `Glen Katherine Primary School` | 31-45 Calendonia Dr, Melbourne 3095, Australia | St Helena Secondary College / Glen Katherine | 391.6m | 420m (0.420km) | 28.4m |

## Change History

- **4 November 2026:** The first dry run reported 17 old polling places with noms that did not match within the default 100m. Twelve were clear same-site matches: five saved street-address locations and seven same-named schools/colleges. Initial 250m overrides were added; checks showed each selected one CSV polling place.
- **5 November 2026:** Added Fairfield Primary School after a newly approved stall at the same school/address was 136m from the official pin. Added Glen Katherine Primary School after confirming it shares a large campus with St Helena Secondary College; the next-nearest official polling place was about 953m away. Their initial thresholds were 250m and 450m respectively.
- **5 November 2026:** Replaced the broad initial radii with the measured distance rounded up to the next 5m, plus 25m. This produced the current values above.
- **7 November 2026:** Rechecked all 14 against the refreshed 7 November CSV. Every threshold still selected exactly one official polling place. Coordinate changes in that scrape did not invalidate these matches.
- **14 November 2026:** Removed early-voting-centre matching and the `is_early_voting_centre` output/config field: only election-day voting centres are in scope. Regenerated the 13 November CSV; comparison with the reconstructed previous transform confirmed all 1,652 rows, their remaining fields and order, and all six warnings were unchanged.
- **14 November 2026:** Removed Ringwood Heights Primary School from the API-only allowlist after it appeared in the 12 November spreadsheet. The empty allowlist remains available for explicitly approved future map-only venues; other map-only venues are errors.

## Related Unmatched Cases

These five old places were deliberately not given distance overrides because no unique, supportable match was available. They were put in the holding pen instead.

| Old polling-place name | Why it was not overridden |
|---|---|
| `31 College Road` | The intended 1st Werribee Scout Hall is 335.8m away, but Werribee Secondary College is closer at 216.5m. A radius large enough to reach the Scout Hall would include both candidates. |
| `St Thomas Avenue` | Only a suburb-level location was submitted; there is not enough information to identify a specific venue. |
| `Balwyn Primary School` | The school is not in the 2026 list. The nearest listed place is Balwyn Baptist Church, about 824m away. |
| `Nungurner Primary School` | The school is not in the 2026 list. The nearest listed place is Metung Primary School, about 3.7km away. |
| `Ringwood Heights Primary School` | The school is not in the 2026 list. The nearest listed place is Ringwood Bowls Club, about 1.0km away. |

The holding-pen SQL was applied and verified in DEV. It preserves the submissions and their original details, marks them declined/detached, backs up the affected rows, clears historical links to the deleted temporary polling places, and adds decline-history snapshots. Production application is not confirmed here.

Glen Katherine Primary School is not in the holding pen: the team confirmed it shares a campus with St Helena Secondary College, so the explicit distance override is used.

## Other Matching Exceptions

These are key aliases in `common.py`, not distance overrides:

- The Hellenic Orthodox Community of Geelong was previously called Parish Hall in the spreadsheet and Community Hall on the map. The 12 November spreadsheet agrees with the map, so the alias was removed.
- St Francis Catholic College Melton previously had a suburb mismatch between sources. The 7 November spreadsheet and map both say Melton West, so its now-redundant identity alias was removed on 7 November 2026.

## Maintenance

1. Before adding an override, inspect the old polling-place point and nearby new CSV candidates.
2. Add one only when the intended polling place is identifiable and the chosen radius matches exactly one new polling place.
3. Record the old name/address, official match, measured distance, threshold, rationale and date here.
4. Revalidate every override after VEC changes venue coordinates or names. If an old record is removed from the migration baseline, remove its config entry but retain its dated history above.

Thresholds are specific to this election's archived polling-place points and should not be copied to another election without remeasurement. No stall IDs, contact details or backed-up personal submissions are included in this document.
