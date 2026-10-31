## 8. Known bugs (recorded, not fixed)
- `sa_2025/config.json` has `lng` instead of `lon` (the fixture does too), and the loader's `_apply_fix` silently skips unknown fields.
- `migrate_mpps` "no MPP on old active row" branch creates an orphan MPP.
- `RollbackPollingPlaces` doesn't restore MPP links and matches by distance only.
- `tests/loader/test_known_bugs.py` passes for the wrong reason.
- `dedupe_polling_places._merge_and_sum_extras` uses an enclosing-scope loop variable.
- Rows with blank coordinates are silently dropped when geocoding is off.
- `nsw_2019/scrape.py` has committed Incapsula cookies.
- `federal_2025/config.json` fix for `ec_id` 8138 writes `EntrancesDesc`, but the column is renamed to `entrance_desc` before fixes run, so it is silently skipped and has never applied.
- `federal_2019/config.json` has duplicate `ec_id` fixes with conflicting coordinates (`83305`, `8175`); the later entry wins.
- `scrapers/CONFIG_MATRIX.md` claims a `tas_2024` wheelchair fix that doesn't exist.

## 9. Config `fix_data_issues` audit (262 entries)

### Inventory and classification
| Config | Count | Type / selector | Root cause | Provenance |
|---|---|---|---|---|
| federal_2019 | 239 | Coordinate overwrite, `ec_id` | AEC geocoded a nearby wrong building; about 12 gross errors (wrong continent, digit typos, shifts over 50 km) | 234 from bulk manual QA (`electoral_boundaries/federal_2019/data_quality/data/fed2019_updated_locations_for_ingest.json`), 3 hand-added |
| federal_2022 | 15 | Coordinate overwrite, `ec_id` | 12 are AEC copying another booth's coordinates (Blacktown, Seven Hills, Randwick, Blaxland); 3 missing, state-level or off by 3.7 km (Surry Hills is 0,0; Leigh Creek longitude wrong by 5 degrees) | Individually reported |
| sa_2022 | 3 | Vocabulary mapping (wheelchair codes F, A, N) | Source uses codes | Loader-discovered |
| tas_2025 | 1 | Vocabulary (`Assistance` to `Assisted`) | Source vocabulary | Loader-discovered |
| federal_2025 | 1 | Default fill (blank wheelchair to `Unknown`) | Source gaps | Loader-discovered |
| federal_2025 | 1 | Text overwrite, `ec_id` 8138 | User report | Added 1 May 2025 |
| sa_2025 | 1 | Coordinate overwrite, premises | Wrong location | Loader-discovered |
| nsw_lg_2024 | 1 (+2 thresholds) | Coordinate overwrite by name, plus distance-threshold exception | Wrong location, validation exception | Loader-discovered |

About 95% are coordinate overwrites; only the vocabulary and default-fill entries are permanent in nature. `filters`, `cleaning_regexes` and `bbox_validation.ignore` are validation exceptions, not data fixes.

### Loader fixer semantics (`loader.py` ~1036-1075)
Fixes run after column rename, match with `str(row[field]) == str(value)`, hit every matching row, skip unknown overwrite fields silently, run sequentially, and have no check for no-match, no-op or conflict.

### Defects
- Dead fix: federal_2025 `EntrancesDesc` (see section 8).
- Half-applied fix: sa_2025 `lng` (see section 8); only `lat` changes.
- Conflicting duplicates in federal_2019 (see section 8).
- Obsolete fixes: readmes say the AEC corrected Altona North and Muswellbrook and the fixes were removed.
- Federal_2022 readme documents `3678` Altona North and `1994` Duncans Creek as fixed but they are not in the config.
- 8 federal_2019 `ec_id`s have no linked QA record (`83941`, `8520`, `2756`, `7774`, `92007`, `95002`, `82883`, `7468`).
- 2019 readme: sibling booths at the same premises with different `ec_id`s were not fixed.
- 2019 shift distances (229 linked): median 114 m; 51 at 10-50 m, 47 at 50-100 m, 65 at 100-250 m, 28 at 250-500 m, 20 at 500 m-1 km, 11 at 1-5 km, 6 over 5 km (max about 305 km).
- Not verified: the raw 2019 AEC file isn't in the repo, so per-booth 2019 correctness and unfixed siblings are unchecked. Several readme-listed 2019 PPIDs (6131, 6174, 7079, 83735, 3919, 5934, 97559) aren't separate config entries.

### Detection
A "same coordinates, different premises" rule found 13 booths in 2022 (9 already fixed, 4 not) and none in 2025. A "far from division median" rule is too noisy (about 400 hits from rural divisions).

### Recommendation
1. Replace free-form fixes with the `Correction` table: scoped to election and booth, with expected source value, reason, provenance and obsolete flag.
2. Make the loader fail on a fix that matches no row, targets a missing field, changes nothing, or conflicts with another fix.
3. Add the "same coordinates, different premises" check as a standard validator.
4. Optional quick fixes: `EntrancesDesc` ordering, `lng` typo, the two duplicate `ec_id`s, and a linter for existing configs.

## Where we got to
- All 262 `fix_data_issues` entries are classified (about 95% coordinate overwrites). Defects found are listed above and in section 8.
- The `sa_2025` `lng` typo was left unfixed at the maintainer's request. Nothing in this section has been fixed.
- The fixer semantics are known: silent skips for unknown fields, no checks for no-match, no-op or conflict.

## Potential next steps
- Make the fixer strict: fail on no-match, no-op, conflict or unknown field, and require an expected-source-value guard.
- Fix the three config defects and the `CONFIG_MATRIX.md` error.
- Build the config linter.
- Review the fixes that are obsolete because the electoral commission has since corrected its data.

## Open questions
- Should the `lng` typo be fixed after all, or is leaving it intentional?
- Are the Mylor, Blaxland, Roma South and Randwick South fixes still correct? Our fix differs from later official data by 0.4 to 5 km.
- Is the raw 2019 source file available anywhere, so the 239 overwrites can be re-checked?
- Should obsolete fixes be removed or kept for history?
