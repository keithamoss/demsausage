# Scraper Config Feature Matrix

Every `config.json` across all 20 scraper directories, mapped against the features the loader consumes.

| Election | filters | exclude_columns | rename_columns | add_columns | address_fields / address_format | extras | fix_data_issues | cleaning_regexes | bbox_validation | overwrite_distance_thresholds | geocoding | multiple_division_handling |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `vic_2022` | — | — | — | ✓ (`ec_id: ""`) | — | — | — | — | — | — | off | — |
| `qld_2020` | — | — | — | — | — | — | — | — | — | — | off | — |
| `qld_2024` | — | — | — | — | — | — | — | — | — | — | off | — |
| `act_2020` | — | — | — | — | — | — | — | — | — | — | off | — |
| `act_2024` | — | — | — | — | — | — | — | — | — | — | off | — |
| `wa_2021` | — | — | — | — | — | — | — | — | — | — | off | — |
| `wa_2025` | — | — | — | — | — | — | — | — | — | — | off | — |
| `nt_2024` | — | — | — | — | — | — | — | — | — | — | off | — |
| `nsw_2023` | — | — | — | — | — | — | — | — | — | — | off | — |
| `nsw_by_2024` | — | — | — | — | — | — | — | — | — | — | off | — |
| `sa_2022` | — | ✓ (2 cols) | ✓ (8 cols, SA-proprietary names) | ✓ (`ec_id: ""`, `state: "SA"`) | — (pre-formatted `address` col) | ✓ (empty field list) | ✓ (3 entries: wheelchair code → string) | — | — | — | off | — |
| `sa_2025` | — | ✓ | ✓ | ✓ (`ec_id: ""`, `state: "SA"`) | ✓ (4 fields merged) | — | ✓ | — | — | — | off | — |
| `tas_2021` | — | — | ✓ (AEC state col names) | — | ✓ (3-field merge) | ✓ (non-empty) | — | — | — | — | off | — |
| `tas_2024` | — | — | ✓ (AEC state col names) | — | ✓ (4-field merge) | ✓ (non-empty) | ✓ (wheelchair fix) | — | — | — | off | — |
| `tas_2025` | — | — | ✓ (AEC state col names) | — | ✓ (4-field merge) | ✓ (non-empty) | ✓ (wheelchair fix) | — | — | — | off | — |
| `nsw_lg_2024` | — | — | — | — | — | — | ✓ (lat/lon overwrite by name) | — | — | ✓ (2 named thresholds) | off | — |
| `federal_2019` | ✓ (Status) | ✓ (7 cols) | ✓ (9 cols, AEC names) | — | ✓ (3-field merge) | ✓ | ✓ (large: ec_id-keyed lat/lon fixes) | ✓ | — | — | off | `USE_ELECTORAL_BOUNDARIES` |
| `federal_2022` | ✓ (Status) | ✓ (7 cols) | ✓ (9 cols, AEC names) | — | ✓ (6-field merge) | ✓ | ✓ (large: ec_id-keyed lat/lon fixes) | ✓ | ✓ (LHI, Norfolk Is.) | — | **on** | `USE_ELECTORAL_BOUNDARIES` |
| `federal_2025` | ✓ (Status) | ✓ (7 cols) | ✓ (9 cols, AEC names) | — | ✓ (6-field merge) | ✓ | ✓ (small: 2 entries) | ✓ | ✓ (LHI, Norfolk Is.) | — | **on** | `USE_ELECTORAL_BOUNDARIES` |
| `referendum_2023` | ✓ (Status) | ✓ (9 cols) | ✓ (9 cols) | — | ✓ (6-field merge) | ✓ | ✓ (empty list) | ✓ | ✓ (LHI, Norfolk Is.) | — | **on** | `USE_ELECTORAL_BOUNDARIES` |

---

## Feature notes

**`filters`** — Removes rows from the CSV before any other processing. Used by federal/referendum elections to drop non-`Current`/`Appointment` status rows (e.g. pre-poll declaration booths not yet open).

**`exclude_columns`** — Drops named columns entirely after loading. Used to remove AEC internal IDs (`DivId`, `StateCo` etc.) and status columns that were used for filtering but shouldn't be in the model.

**`rename_columns`** — Maps source CSV column names to demsausage model field names. All non-trivial elections need this; the AEC column naming convention (`PPName`, `PremisesName`, `StateAb`, etc.) differs from the model fields.

**`add_columns`** — Injects constant values into every row. SA elections use `"state": "SA"` (state not present in CSV) and `"ec_id": ""` (AEC election code not applicable).

**`address_fields` / `address_format`** — Merges multiple source columns into a single `address` field using a format string. Federal elections use up to 6 fields (`Address1`–`Address3`, `Locality`, `AddrStateAb`, `Postcode`). SA 2025 uses 4. Some elections (SA 2022) have a pre-formatted address column and don't need this.

**`extras`** — Packs a list of named columns into a JSON `extras` field on the model. Federal elections include AEC operational data (`CCD`, `OrdVoteEst`, etc.). An empty `extras.fields` list (sa_2022) is valid and results in an empty extras dict.

**`fix_data_issues`** — Row-level overwrite rules: if a field matches `value`, overwrite one or more other fields. Used for:
- Wheelchair access code expansion (`F` → `"Fully wheelchair accessible"`)
- ec_id-keyed lat/lon coordinate corrections (federal_2019, federal_2022 — dozens of entries)
- Coordinate fix by name (`nsw_lg_2024`)
- Blank-to-default fills (federal_2025: `wheelchair_access: "" → "Unknown"`)

**`cleaning_regexes`** — Named-group regex applied to a field; the `main` capture group replaces the field value. Federal elections use this on `name` to strip parenthetical suffixes (e.g. `"Acme Hall (Entrance)"` → `"Acme Hall"`).

**`bbox_validation`** — List of polling place names to skip the election boundary check for. Federal and referendum elections use this for offshore territories (Lord Howe Island, Norfolk Island) that lie outside the mainland election boundary polygon.

**`overwrite_distance_thresholds`** — Per-named-polling-place distance threshold overrides used by `migrate_unofficial_pending_stalls`. Only `nsw_lg_2024` uses this.

**`geocoding`** — When `enabled: true`, the loader calls the Google Maps API for polling places missing coordinates. Only federal and referendum elections enable this; state elections always supply complete lat/lon.

**`multiple_division_handling`** — Determines how to assign a single home division to a polling place that appears in multiple divisions. `USE_ELECTORAL_BOUNDARIES` performs a PostGIS point-in-polygon lookup against `ElectoralBoundaries` rows. Only federal and referendum elections use this.

---

## Elections used as test fixtures

| Election | Config shape | Why chosen |
|---|---|---|
| `vic_2022` | Bare minimum | Baseline — loader with almost no config transformation |
| `sa_2022` | SA proprietary (old) | Hardcoded `add_columns`, short-code `fix_data_issues`, empty `extras`, pre-formatted address |
| `sa_2025` | SA proprietary (current) | Adds `address_fields`/`address_format` merge path to the sa_2022 shape |
| `tas_2025` | AEC state format | AEC column naming, multi-field address merge, non-empty `extras`, `fix_data_issues` |
| `nsw_lg_2024` | Distance thresholds + coordinate fix | Only election using `overwrite_distance_thresholds`; `fix_data_issues` by name overwriting lat/lon |
| `federal_2025` | Full federal (small fix_data_issues) | All federal features: filters, cleaning_regexes, 6-field address, bbox_validation; geocoding + multiple_division_handling overridden in tests |
| `federal_2022` | Full federal (large fix_data_issues) | Same shape as federal_2025 but dozens of ec_id-keyed coordinate fixes; exercises the fixer loop at scale |
