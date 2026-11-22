## 3. Target data model
- `IngestRun` and `SourceRecord`: append-only staging of each scrape.
- `Booth`: one row per booth per election, updated in place, with a stable surrogate PK. Noms and stalls attach to it.
- `Venue` (the MPP): the permanent cross-election venue, with `VenueExternalId`.
- `Correction`: scoped to one election and booth, with an expected-source-value guard.
- Rules:
  - A source ID or derived key only proposes a Venue link. Auto-link needs corroboration (premises or geo); the rest goes to the MPP review queue.
  - Commission IDs are optional, source-scoped evidence, not internal identity. Preserve their original text and normalise only according to a known source convention (for example UUID case); never require an ID for every record.
  - Booth continuity and physical Venue continuity are different decisions. A booth can retain its name, electorate and source ID while changing premises; a confident Booth match must not automatically merge the old and new physical Venues.
  - Absent rows are flagged, not deleted.
  - Keep official IDs as text and reject duplicate selectors and duplicate keys. Collapse and log exact-duplicate rows.
  - Filter early-voting and election-office records by explicit source type before duplicate-key checks, matching, validation and diff reporting.
  - A coordinate jump over about 5 km on a matched row raises a "likely typo" warning.
  - Ingest the federal `Status` field (Current, Abolition, Appointment) as a lifecycle signal.
- Migration: stop cloning rows per load (Draft, Active, Archived), and keep the API shape compatible.

## 4. Matching decision (final)
Use a hand-built matcher: rapidfuzz scoring plus `scipy.optimize.linear_sum_assignment`. Splink was evaluated and is not adopted.

1. **Normalise:** Unicode-fold, lowercase, `&` to "and", strip punctuation. Drop the noise words (polling, place, centre, election, day, early, voting, and, the, district, pre, poll). Sort the divisions.
   - These are matching representations, not replacements for the source values or a licence to suppress substantive changes in the diff.
2. **Exact-key pass first:** `n2(name)` plus sorted divisions, then the matcher on the leftovers. Require keys to be populated and unique on both sides; a collision is not an automatic match. Source IDs may supply additional evidence but must not be required.
3. **Candidates:** rows that share a name, premises or address, or sit in a nearby 0.01° grid cell.
4. **Score:** strings use `(fuzz.ratio + fuzz.token_sort_ratio) / 2`.
   - Weights: name 0.28, premises 0.11, address 0.14, geo 0.18, divisions 0.28.
   - Geo is 1.0 within 50 m, falling to 0 at 5 km.
   - A blank premises scores a neutral 0.5.
5. **Assign:** `linear_sum_assignment` per connected component of candidates, with unmatched options so the solver cannot force a link. Evaluate competing candidates on both sides; assignment alone does not establish confidence. Shared coordinates or a nearest-neighbour result alone are insufficient.
6. **Bands:** 0.75 or above is eligible for auto-accept only if uniqueness and ambiguity checks pass; review between 0.65 and 0.75, or whenever strong candidates compete. Below 0.65 remains unmatched; unresolved components are reported for review rather than silently forced into additions/removals. Treat scores and the required margin over alternative candidates as starting values to calibrate from real review outcomes.

### Diff decisions and review
- Separate linkage confidence from change significance. Once a Booth is linked, report changed premises, address and XY even when the name, electorate or ID is unchanged.
- Distinguish confirmed modifications, additions, absences and unresolved possible matches. Flag candidate splits/merges for review rather than forcing one-to-one continuity.
- Retain reviewed links and explicit non-links with source-record references, evidence and reviewer provenance. Apply them only to the intended records; conflicting later evidence requires renewed review.
- Compare normalised fields while retaining raw before/after values. Ignore record order and insignificant XY rounding using a documented, tested distance tolerance; do not alter identity from GeoJSON feature order.
- Separate accessibility sentence reordering and known formatting differences from wording/content changes. Do not treat different descriptions as equivalent merely because the wheelchair rating is unchanged.

## 5. Evidence
- Within one election, identity fields drift very little. The real drift seen was typos, wheelchair-access updates, small coordinate corrections, a few venue swaps and some removals.
- Federal 2025 reconstruction (6,966 booths, 16 changed): `name+division` key 16/16, the matcher 16/16, hybrid 100%, 0 wrong links.
- SA 2025 (8 changed): 8/8.
- Splink, trained on real data from a different dataset, tied the hand-built matcher on same-election data. Its lead on synthetic data came from training on drift patterns I generated.
- Rapidfuzz scoring is about 13-20 times faster than difflib at the same accuracy.
- `PPId` is a booth ID, not a venue ID: about 25% of IDs change premises or move over 100 m across elections. That is why booth identity and venue identity are separate.
- Source quirks to handle: duplicate names across divisions, division-order flips (sort them), WA renames, TAS 2021 exact-duplicate rows, federal 2019 duplicate selectors, `ec_id` int in 2019/2022 but string in 2025, and cp1252 overseas files.

### VIC 2026 observations (November 2026)
- The 18 November GeoJSON has 1,652 election-day voting centres. Host electorate plus voting-location name is populated and unique in that snapshot, but this is evidence for a candidate key, not proof it remains stable across updates.
- `VenueId` is absent entirely for all 277 shared-venue records: 191 election-day centres and 86 early-voting centres. It is populated for the other 1,673 records. Missing IDs must not prevent shared-venue matching.
- Bundalaguah changed from Primary School, 627 Maffra-Sale Road, to Myrtlebank Hall, 795 Maffra-Sale Road, about 1.7 km away. Its voting-location name, host electorate and API ID stayed the same. The 18 November live API spot check and GeoJSON agree on the hall; the spreadsheet downloaded that day still lists the school and is dated 16 November.
- Comparing the 17 November spatial export with the 16 November scraper CSV, the other 1,651 election-day venues agree on address, electorates, voting-location name and wheelchair rating. Two have sub-centimetre coordinate differences; accessibility differences include reordered sentences, wording differences and truncation.

## 6. Caveats
- Matcher weights were tuned on synthetic drift and thresholds are uncalibrated against real review outcomes.
- Only 16 real federal swaps, plus a few SA and TAS changes, exist as same-election evidence.
- Cross-election venue-link quality was deprioritised and is weaker.
- Splink's untested strengths: calibrated probabilities and explainability charts. It needs explicit DuckDB memory limits, labelled matches to train, and per-jurisdiction training.
- No production DB access, so real review-queue load is estimated, not measured (roughly 3-13% cross-election per jurisdiction).

## 7. Next steps
1. Port the matcher into a module with unit tests, including the 16 real federal booth cases and the Victorian regression cases below. Follow `.github/instructions/testing.instructions.md` for any `django/**` changes.
2. Add explicit election-day filtering, duplicate-key checks and ambiguity handling ahead of accepting matches.
3. Log low-confidence links and retain reviewed decisions so the review band can be tuned from real outcomes.
4. Build the Booth/Venue/IngestRun schema and migration.
5. Start the scraper framework and loader redesign.

### Proposed Victorian regression cases (not yet implemented)
- Bundalaguah: a continuing Booth with changed premises, address and coordinates; exercise both with and without its source ID. Report the relocation without assuming physical Venue continuity.
- Shared venue with no `VenueId` property: match unchanged records without manufacturing an official ID.
- Colliding normalised keys or equal candidates, including distinct booths sharing a site: require review rather than arbitrary assignment.
- Rename or host-electorate change, and candidate splits/merges: retain unresolved outcomes and reviewed decisions.
- Reordered features, UUID case, division order and sub-centimetre coordinate rounding: no substantive change; real address and accessibility-content changes must remain visible.

## Where we got to
- The target model (`IngestRun`, `SourceRecord`, `Booth`, `Venue`, `Correction`) is designed but not built.
- The matcher is decided: rapidfuzz scoring plus `scipy` linear-sum assignment, with Splink evaluated and not chosen. It matched 16/16 real federal changes and 8/8 SA changes.
- Weights and thresholds are tuned on synthetic drift and are uncalibrated against real review outcomes.

## Potential next steps
- The numbered list in section 7 above, in order.
- Calibrate thresholds on real review outcomes once the review queue exists.
- Revisit Splink only if calibrated probabilities or explainability become necessary.

## Open questions
- How does MPP review work in practice, and who reviews the 0.65-0.75 band?
- Should a booth ever move between venues automatically, or only by review?
- Is the cross-election venue link needed soon, or is per-election booth identity enough for now?
- Can we get production data to measure the real review-queue load?
