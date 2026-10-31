## 3. Target data model
- `IngestRun` and `SourceRecord`: append-only staging of each scrape.
- `Booth`: one row per booth per election, updated in place, with a stable surrogate PK. Noms and stalls attach to it.
- `Venue` (the MPP): the permanent cross-election venue, with `VenueExternalId`.
- `Correction`: scoped to one election and booth, with an expected-source-value guard.
- Rules:
  - A source ID or derived key only proposes a Venue link. Auto-link needs corroboration (premises or geo); the rest goes to the MPP review queue.
  - Absent rows are flagged, not deleted.
  - Keep official IDs as text and reject duplicate selectors and duplicate keys. Collapse and log exact-duplicate rows.
  - Run the early-voting filter before duplicate-key checks.
  - A coordinate jump over about 5 km on a matched row raises a "likely typo" warning.
  - Ingest the federal `Status` field (Current, Abolition, Appointment) as a lifecycle signal.
- Migration: stop cloning rows per load (Draft, Active, Archived), and keep the API shape compatible.

## 4. Matching decision (final)
Use a hand-built matcher: rapidfuzz scoring plus `scipy.optimize.linear_sum_assignment`. Splink was evaluated and is not adopted.

1. **Normalise:** Unicode-fold, lowercase, `&` to "and", strip punctuation. Drop the noise words (polling, place, centre, election, day, early, voting, and, the, district, pre, poll). Sort the divisions.
2. **Exact-key pass first:** `n2(name)` plus sorted divisions, then the matcher on the leftovers.
3. **Candidates:** rows that share a name, premises or address, or sit in a nearby 0.01° grid cell.
4. **Score:** strings use `(fuzz.ratio + fuzz.token_sort_ratio) / 2`.
   - Weights: name 0.28, premises 0.11, address 0.14, geo 0.18, divisions 0.28.
   - Geo is 1.0 within 50 m, falling to 0 at 5 km.
   - A blank premises scores a neutral 0.5.
5. **Assign:** `linear_sum_assignment` per connected component of candidates.
6. **Bands:** auto-accept at 0.75 or above; review between 0.65 and 0.75; below 0.65 is new or absent. Treat these as starting values to recalibrate from real review outcomes.

## 5. Evidence
- Within one election, identity fields drift very little. The real drift seen was typos, wheelchair-access updates, small coordinate corrections, a few venue swaps and some removals.
- Federal 2025 reconstruction (6,966 booths, 16 changed): `name+division` key 16/16, the matcher 16/16, hybrid 100%, 0 wrong links.
- SA 2025 (8 changed): 8/8.
- Splink, trained on real data from a different dataset, tied the hand-built matcher on same-election data. Its lead on synthetic data came from training on drift patterns I generated.
- Rapidfuzz scoring is about 13-20 times faster than difflib at the same accuracy.
- `PPId` is a booth ID, not a venue ID: about 25% of IDs change premises or move over 100 m across elections. That is why booth identity and venue identity are separate.
- Source quirks to handle: duplicate names across divisions, division-order flips (sort them), WA renames, TAS 2021 exact-duplicate rows, federal 2019 duplicate selectors, `ec_id` int in 2019/2022 but string in 2025, and cp1252 overseas files.

## 6. Caveats
- Matcher weights were tuned on synthetic drift and thresholds are uncalibrated against real review outcomes.
- Only 16 real federal swaps, plus a few SA and TAS changes, exist as same-election evidence.
- Cross-election venue-link quality was deprioritised and is weaker.
- Splink's untested strengths: calibrated probabilities and explainability charts. It needs explicit DuckDB memory limits, labelled matches to train, and per-jurisdiction training.
- No production DB access, so real review-queue load is estimated, not measured (roughly 3-13% cross-election per jurisdiction).

## 7. Next steps
1. Port the matcher into a module with unit tests, including the 16 real federal booth cases. Follow `.github/instructions/testing.instructions.md` for any `django/**` changes.
2. Add the duplicate-key and early-voting filters ahead of matching.
3. Log low-confidence links so the review band can be tuned from real outcomes.
4. Build the Booth/Venue/IngestRun schema and migration.
5. Start the scraper framework and loader redesign.

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
