## 10. Catching data problems at scrape time (design + 2022 backtest)

### Principle
One validator library, used by the scraper CLI (writes `quality_report.json` beside the CSV; errors block output), CI (against fixtures) and the loader (cheap re-check; refuses data without a passing report). The loader stops being where problems are first found.

### Static checks on corrections
- Overwrite field must exist after the column rename (would have caught `EntrancesDesc` and `lng`).
- Selector must match at least one row.
- Record an expected source value; if the source now equals the fix, mark the correction obsolete (the "AEC fixed it" cases).
- Reject duplicate or conflicting selectors; require reason and provenance.
- Re-evaluate every correction on every scrape: applied / no-op / orphan / superseded.

### Data detectors
1. Point-in-polygon against the booth's division boundary (boundaries are already in the repo).
2. Identical coordinates with different premises.
3. Same premises with different coordinates (the 2019 unfixed-sibling gap).
4. Cross-election drift: link booths with the matcher and flag premises that moved with no address change; also flags redundant corrections.
5. Address-vs-coordinate check: geocode only flagged or low-precision rows and compare.
6. Cheap signals: low decimal precision, distance from postcode centroid, unknown vocabulary values, new blank counts per column, column-set changes versus the previous election.

Detectors propose a candidate correction (a geocode or the prior election's location); a human approves it into the `Correction` table. Severity tiers decide what blocks a run and what warns.

### Backtest: federal 2022 (7,047 rows, 15 known fixes as ground truth)
Boundaries: `2021_ELB_region.shp`. Run on the raw fixture, before fixes.

| Detector | Flagged | Known fixes caught | Other flagged |
|---|---|---|---|
| Point-in-polygon, outside own division by >1 km | 97 | 6/15 | 91 |
| Same, excluding "Name (Division)" booths (out-of-division centres) | 8 | 5/15 | 3 |
| Same coordinates, different premises | 13 | 9/15 | 4 |
| Union of the two | 18 | 11/15 | 7 |
| Low precision (3 dp or fewer) | 1,124 | 2/15 | too noisy |

- Naive point-in-polygon is noisy because interstate and out-of-division centres (for example "Adelaide (Barker)") legitimately sit outside the listed division. Excluding names ending in a parenthesised division removes most of that.
- The union flags 18 of 7,047 rows (0.26%), a reviewable volume.
- Missed: 1476 Blaxland East (the "fix" is a sub-metre change, effectively a no-op, so it needs no detector), 46435 Craigmore North (an entrance note, 117 m), 6208 Roma South (567 m) and 7212 Mylor (3.7 km, inside the division). Small in-division errors need the geocode or cross-election detectors.
- Newly surfaced unfixed candidates: 83845 Darlinghurst South (blank lat, lon 0; status Appointment, so likely filtered), 949 Murringo (9.5 km outside Riverina), 3444 Mount Waverley Upper (3.5 km outside Chisholm), 2743 Glebe East (2.2 km outside Sydney), plus the 4 unfixed same-coordinate booths. These are not yet reviewed.
- Not backtested: detectors 3-6, and 2019 (the raw AEC file isn't in the repo). Recall on the 15 fixes is a small sample, and these fixes were themselves reported by people, so they skew towards what is visible.

## 11. Backtests on other historical data

### Cross-election drift, federal 2022 vs 2025 (the "same booth moved" detector)
Linked 6,308 booths by id+name, then name+division.
- Of the 12 linkable known 2022 fixes, 8 shifted more than 1 km between the raw 2022 and raw 2025 files, so they are caught.
- The cost is volume: more than 1 km flags 209 booths, more than 5 km flags 14 (4 known fixes). Venues really do change between elections, so this detector needs the matcher's premises/address agreement to avoid flagging genuine moves.
- 2025 AEC coordinates are within about 40-160 m of our 2022 fix for Seven Hills, Seven Hills Heights, Marayong West, Mount Druitt, Rooty Hill West and Craigmore North, and within 259 m for Leigh Creek. The AEC has since corrected these, so those fixes are obsolete for any rerun and the 2025 data independently validates them.
- Possible fix-quality problems, now measurable: our fix is 4,960 m from the 2025 value for Mylor, 2,135 m for Blaxland, 551 m for Roma South and 406 m for Randwick South. Either the venue changed or our fix is off. Not yet resolved.
- 5 known fixes (2887, 11978, 81621 and others) could not be linked automatically; the tuned matcher would likely link them.
- Unreviewed outlier: Kowanyama (id 5971) moved about 23 km between 2022 and 2025 with the same premises name.

### Federal 2019 manual fixes validated against later AEC data
Linked the 407 QA'd 2019 corrected coordinates to 2022 (253 linked by name+premises) and 2025 (176 linked).
- Median distance from our 2019 corrected coordinate to the later AEC coordinate: 22 m (2022) and 27 m (2025); 90th percentile about 140 m.
- Over 250 m: 4 booths against 2022 and 2 against 2025. Over 1 km: 1 against 2022 and none against 2025.
- Conclusion: the 2019 bulk QA was accurate. Later AEC releases converged on the same locations.
- Limit: the raw 2019 AEC file isn't in the repo, so detector recall on 2019 can't be measured.

### Duplicate-coordinates detector across all datasets
Same coordinates on different premises: 4 groups (13 booths) in federal 2022; 1 group (2 booths) in the federal 2016 dump; none in federal 2025, SA 2022/2025, TAS 2025, NSW LG 2024, VIC 2022/2018, ACT 2016 or NT 2016. The failure it targets (the AEC copying another booth's coordinates) is specific to the AEC federal files, so it is cheap and quiet elsewhere.

### State drift, SA 2022 vs 2025
413 booths linked; median 16 m, none over 250 m. SA coordinates are stable and need only a basic bounds check.

### Not tested
- Point-in-polygon on 2025 (2025 boundaries aren't in the repo) and on non-federal sets.
- Federal 2016 to 2022 and VIC 2018 to 2022 drift: automatic linking failed (the column mappings and venue names differ); needs the matcher.
- Address-vs-geocode (needs live geocoding).

## Where we got to
- The design is one validator library used at scrape time, in CI and in the loader.
- The federal 2022 backtest caught 11 of 15 known fixes with the union of the two best detectors (point-in-polygon with the out-of-division-centre exclusion, plus same coordinates at different premises).
- Backtests on other historical data show the same-coordinates detector rarely fires outside federal 2022, and that linking older elections needs the matcher. Nothing is built.

## Potential next steps
- Build the validator library with the two detectors and a report format.
- Review the unreviewed candidates (for example Darlinghurst South `83845`).
- Use the matcher to compare consecutive elections and flag unexplained movement.
- Add address-vs-geocode checks if live geocoding is acceptable.

## Open questions
- Should validation failures block a load, or only warn?
- Are boundary shapefiles available for every election and state?
- Is live geocoding acceptable in scrapers (cost, terms, determinism)?
- Which known fixes should become permanent regression tests?
