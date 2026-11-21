# Polling place record linkage

Decides which polling places in one file are the same places as in another. That's the first step for anything that compares datasets: diffing scrapes, the loader, meta polling places. This module only does linkage. The downstream tools use its output.

It has two matchers behind one interface so they can run side by side on real data and be judged on the results. Learnings, pitfalls and next steps for the Splink side are in [`SPLINK_NOTES.md`](SPLINK_NOTES.md). The background is in [`docs/modernisation/02-data-model-and-matcher.md`](../docs/modernisation/02-data-model-and-matcher.md), section 4 and "How fair was the Splink comparison?".

## How a link is made

1. **Load.** `ColumnMap.detect()` finds the name, premises, address, coordinate, division and ID columns in our loader CSVs, AEC files and the SA, VIC, TAS, WA and QLD scraper outputs. Other formats take an explicit `ColumnMap`. IDs are carried through for evaluation but never used for matching.
2. **Normalise.** Fold accents, lowercase, `&` → "and", strip punctuation, drop noise words from names ("polling", "centre", …). Drop a trailing "(Division)" when it names one of the record's own divisions, as in the AEC's "Allawah (Barton)". In addresses, expand common abbreviations ("Cnr" → "corner", "St" → "street") and drop a leading part that just repeats the place's name ("Northam Town Hall, Cnr Wellington…").
3. **Exact-key pass (shared).** Normalised name + sorted divisions, when unique in both files and corroborated: within 1 km, or the same address or premises.
4. **Matcher.** Scores the remaining pairs:
   - `rapidfuzz`: hand-built weighted string similarity plus distance, ported from the experiments. Weights are spread over only the fields both files have.
   - `splink`: a Fellegi-Sunter model with term-frequency adjustments, trained from labelled pairs (`src/linkage/models/splink_default.json`). The prior is set from the input sizes. `SplinkMatcher(unsupervised=True)` fits by EM on the inputs instead, which needs a few hundred records. Its distance comparison has a level for "one coordinate agrees, the other is far off", so a one-coordinate typo isn't treated as "far apart" (see "Coordinate typos" below).
5. **Assign one-to-one** with the Hungarian algorithm per connected component. Splink assigns on match weight, because its probabilities saturate at 1.0.
6. **Band.** `auto` (confident) or `review` (plausible, needs a human). Unlinked records are added or removed.

## Running it

```
cd linkage
uv sync --all-extras            # --all-extras pulls in Splink
uv run pytest
uv run linkage link OLD.csv NEW.csv --out link.json          # both matchers + their disagreements
uv run linkage evaluate OLD.csv NEW.csv --id-column id       # score against a trusted ID column
uv run python benchmarks/run_benchmark.py                    # labelled real data -> benchmarks/results.json
uv run python benchmarks/run_agreement.py                    # unlabelled real data -> benchmarks/agreement.json
uv run python benchmarks/train_default_model.py              # retrain the bundled Splink model
uv run linkage verdicts tally                                # who was right where they disagreed
```

Python 3.10+ (Django runs 3.10). The rapidfuzz matcher only needs `rapidfuzz`, `scipy` and `numpy`.

## Downstream: diffs and verdicts

[`../diff/`](../diff/) turns linkage results into one diff per matcher, with an HTML report. Its Disagreements tab records which matcher was right. Those verdicts are imported into [`verdicts/verdicts.jsonl`](verdicts/) with `uv run linkage verdicts import FILE` and summarised with `uv run linkage verdicts tally`.

## Results so far (2026-11-21)

### Labelled data: the files share a trusted ID

For each test case, the Splink model is trained only on the other cases, so it never sees its answers. `splink-em` is unsupervised on the test pair itself.

| Case | Truth pairs | Changed | rapidfuzz correct / wrong / missed | splink | splink-em |
|---|---|---|---|---|---|
| SA 2025 snapshots (`id`) | 685 | 8 | 685 / 0 / 0 | 685 / 0 / 0 | 685 / 0 / 0 |
| VIC 2026 snapshots (`vec_venue_id`) | 1,650 | 8 | 1,650 / 0 / 0 | 1,650 / 0 / 0 | 1,650 / 0 / 0 |
| VIC 2026, each consecutive snapshot pair (4 pairs) | 1,650–1,652 each | 4, 2, 3, 0 | all correct | all correct | all correct |
| SA 2025, each consecutive snapshot pair (4 pairs) | 685–688 each | 4, 3, 0, 1 | all correct | all correct | all correct |
| Federal 2022 → 2025 (`PPId`) | 6,731 | 3,153 | 6,542 / 74 / 115 | 6,349 / 68 / 314 | 6,532 / 77 / 122 |

These figures are with the exact pass on. With it off, every matcher is still perfect within an election. Full detail is in `benchmarks/results.json`.

- **Within an election, both matchers are perfect.** Nearly everything goes through the exact pass, and every changed place was linked.
- **Across elections, they tie** when Splink is trained fairly (`splink-em`). Splink with labels from the within-election snapshots misses more (316). Those labels show almost no drift, so the model learns to be strict.
- **Federal "wrong" is partly noise in the answer key.** `PPId` identifies a booth, not a venue. Many "wrong" links are the right venue paired with a different division's booth, after the boundaries changed.
- **The review bands behave very differently.** Rapidfuzz puts about 400 correct federal links in review. Splink's probabilities sit near 0 or 1, so it puts almost nothing there. Neither matcher's thresholds are calibrated yet.

### Unlabelled data: agreement only

| Pair | Agree | Disagreements |
|---|---|---|
| WA 2025, QLD 2024, QLD 2020, TAS 2025, TAS 2021, ACT 2024 (first → last snapshot) | all | 0 |
| WA 2021 | 721 / 722 | 1 |
| Coffs Harbour 2023 state → 2026 council | 20 / 23 | 3 |

The disagreements, with my reading of them:
- **WA 2021, Northam Town Hall:** the old file's latitude was a typo, 111 km off. Originally only rapidfuzz linked it. Both matchers now link it, after the changes under "Coordinate typos".
- **WA 2021, South West Health Campus → ECU South West Campus:** different names and addresses, 500 m apart. Rapidfuzz auto-linked it, and Splink didn't. This looks like a venue swap, so rapidfuzz is probably wrong.
- **Coffs Harbour:** rapidfuzz also linked Corindi Public School → Corindi Beach Community Hall (review), Dance Centre → Exhibition Halls at the Showground (auto), and Woolgoolga Public School → Woolgoolga Uniting Church (review). Splink linked none of them. Two look like real venue changes, and the showground one is arguable.

So rapidfuzz is more forgiving and Splink stricter. Each has been right in a different case.

## Coordinate typos

Northam Town Hall (WA 2021) has latitude −32.656 in one file and −31.656 in the other: the same place, with one wrong digit. Splink originally scored it at a probability of 0.0002:

| Evidence (match weight) | Before | After |
|---|---|---|
| Name, exact match | +9.5 | +9.5 |
| Address ("Northam Town Hall, Cnr Wellington…" vs "Corner Wellington…") | −3.2 | +9.2 |
| Distance, 111 km | −9.1 | −0.5 |
| Prior (1 match among 722 places) | ≈ −9.5 | ≈ −9.5 |
| **Probability** | **0.0002** | **0.9975** |

Two changes fixed it, and neither is special-cased:
- **A distance level for "one coordinate agrees within ~50 m, the other doesn't".** It comes after the ordinary distance levels, so it only catches far-apart pairs with one axis agreeing. Splink learns its weight. In the bundled model, true matches show this pattern with probability 2.2e-4 and random pairs 3.2e-4, so it's nearly neutral and the other fields decide. Before, it fell into "more than 5 km", which a model trained on clean data treats as near-conclusive.
- **Address normalisation**, as described in step 2 above. This helps both matchers.

Neither change altered any within-election result, and federal moved by a pair or two. The link still records `distance_m`, so a diff can flag "moved 111 km, likely coordinate typo" for a human. The link is right, but the coordinates still need fixing.

## Known gaps

- Thresholds are uncalibrated for both matchers. Disagreements and review-band decisions are where the labels to fix that will come from.
- Splink training data is small: two within-election series plus one noisy cross-election pair.
- Unsupervised EM can't be used on small files like by-elections. Those rely on the bundled model.
- There's no venue/booth distinction yet: a booth per division at the same venue is treated as a separate place.
