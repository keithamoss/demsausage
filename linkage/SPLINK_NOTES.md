# Splink: notes and learnings

What we learned building the Splink matcher in `src/linkage/matchers/splink_matcher.py`, the problems we hit, and where to take it next. Written 2026-11-21, against Splink 5.0.0. The results it refers to are in [`README.md`](README.md) and `benchmarks/`.

## Splink 4 vs 5

Splink 5.0.0 was released on 28 Sep 2026. Most of the change is in the API, not the method. This module was written against 5 from the start; the scripts in `docs/modernisation/experiments/` use the Splink 4 style.

**Breaking changes**
- **Inputs:** inputs must be registered with `db_api.register(..., dataset_display_name=...)` before they go to `Linker`. Raw pandas/dict inputs raise a `TypeError`.
- **Output columns:** per-field `bf_*` columns (Bayes factors) are now `mw_*` match weights, on a log2 scale; `2 ** mw` gives the Bayes factor back.
- **Renamed or removed:** `as_record_dict()` → `as_record_list()`; `compare_two_records()` → `score_pair()` / `score_pairs()`. `find_matches_to_new_records()`, implicit caching (`use_cache`) and salting are gone.
- **Platforms:** Python 3.10+ is required, and 3.10 is already marked deprecated. That matters, because Django runs 3.10 (see "Open challenges"). Athena is dropped. PyArrow is required; pandas and the chart libraries are optional extras.
- **Logging:** `set_up_basic_logging` is replaced by `log_level`.

**New**
- Term-frequency tables are joined when predicting rather than computed in advance.
- Prediction can be split into chunks (`num_chunks_left`/`num_chunks_right`, `predict_chunk()`), and intermediate results can be written to Parquet.
- u-estimation has early stopping (`min_count_per_level`), and EM has a `max_pairs` cap.
- Charts are `SplinkChart` objects, and profiling is improved.

**Saved models:** the release blog says Splink 4 JSON models load directly in Splink 5. We haven't tested that.

Sources: [CHANGELOG](https://github.com/moj-analytical-services/splink/blob/master/CHANGELOG.md), [v5.0.0 release notes](https://github.com/moj-analytical-services/splink/releases/tag/v5.0.0), [release blog post](https://github.com/moj-analytical-services/splink/blob/master/docs/blog/posts/2026-09-28-splink-5-release.md), [migration guide gist](https://gist.github.com/RobinL/c6d56a27d8f83c40b6b09643c0fa5d14). The gist is a working document from before the final release, so check details against the changelog.

## Pitfalls we hit

Each of these produced wrong results without any error. Most would apply to any Splink setup with small or near-duplicate files like ours.

1. **SQL keywords as table names.** Registering datasets as `left` and `right` makes Splink generate `... from left`, which fails to parse. We use `left_ds` and `right_ds`.

2. **Labels from within one election teach the model that nothing ever changes.** Between two snapshots of the same election, almost every true match agrees on everything. The learned m-probabilities for "name similar but not equal" and similar levels come out as exactly 0. Splink reads that as "a true match can never look like this", so any renamed place is vetoed. Fix: additive smoothing (`smooth_m_probabilities`, one pseudo-observation per level). The bundled model's training info records the pseudo-count used.

3. **Within-election labels don't carry over to cross-election linking.** A model trained only on SA and VIC snapshots missed 314 of 6,731 federal 2022 → 2025 pairs. Unsupervised EM on the federal files themselves missed 122, about the same as rapidfuzz. More smoothing only partly closed the gap. Lesson: train on the kind of drift you'll be scoring, or use EM when the files are big enough.

4. **Term frequencies must come from the whole files, not the records still to link.** We first sent Splink only the leftovers after the exact pass. In VIC that was sometimes just two records sharing a name, so each premises value looked like it made up half the data. An exact premises match then counted for almost nothing, and Splink swapped two different Whittlesea venues. Fix: give Splink every record, and drop pairs outside the requested set after prediction.

5. **Probabilities saturate at 1.0, so they can't be used to choose between competing pairs.** When two candidate pairings both score 1.0, one-to-one assignment ties and picks arbitrarily. Fix: assign on the match weight (`ScoredPair.rank`), which doesn't saturate, and keep the probability for thresholds and bands. Unmatched records use the review threshold's log odds on the same scale. Never mix probabilities and weights: replacing negative weights with probabilities can make a weaker candidate win.

6. **The prior has to fit each pair of files.** A trained model carries the match rate of its training data. For a 23-place by-election the right prior is about 1 in 23, not whatever the training corpus had. We set `probability_two_random_records_match = min(n) / (n_left × n_right)`, capped at 0.5 for tiny inputs, when constructing prediction settings rather than modifying Splink's private settings after construction.

7. **Unsupervised EM needs volume.** It works on hundreds of records, but not on a 23-place by-election. Small files have to use the trained model. Empty training rules are reported as warnings; unexpected training failures propagate instead of being silently ignored.

8. **The prediction threshold hides scores.** We predicted at a 0.01 floor, so Northam Town Hall (0.0002) didn't appear at all, and we couldn't see why it was missed. The floor now follows the review threshold when that's lower. For diagnosis, run with `review_threshold=0.0`.

## Coordinate typos: the worked example

WA 2021, Northam Town Hall: latitude −32.656 in one file and −31.656 in the other. It's the same place, about 111 km apart on paper.

| Evidence (match weight) | Before | After |
|---|---|---|
| Name, exact match | +9.5 | +9.5 |
| Address ("Northam Town Hall, Cnr Wellington…" vs "Corner Wellington…") | −3.2 | +9.2 |
| Distance, 111 km | −9.1 | −0.5 |
| Prior (1 match among 722 places) | ≈ −9.5 | ≈ −9.5 |
| **Probability** | **0.0002** | **0.9975** |

- **The distance level.** A typo in one coordinate fell into "more than 5 km apart". A model trained on clean data treats that as near-conclusive. We added a level, after the ordinary distance bands, for "one coordinate agrees within ~0.0005° (~50 m) and the other doesn't". Splink learned its weight: true matches show it with probability 2.2e-4 and random pairs 3.2e-4. So it's nearly neutral, and the other fields decide. That's the general Fellegi-Sunter approach: give a known error pattern its own level and let the data decide its weight, rather than special-casing it.
- **The address.** Expanding abbreviations and dropping a leading part that repeats the place's name fixed the rest. That's in the shared normalisation, so it helps rapidfuzz too.
- **Checks.** The change altered no within-election result, and federal moved by a pair or two. The link keeps `distance_m`, so the diff can still flag the place for its coordinates to be fixed.

## Further ways to take Splink

**1. Turn review decisions into training labels.** This is the most valuable next step.
`estimate_m_from_pairwise_labels()` trains from a table of yes/no pairs. Every verdict on a disagreement or a review-band link becomes a label: "Northam: yes", "South West Health Campus → ECU South West Campus: no". Over a few elections that gives:
- labels with real drift, fixing pitfall 3;
- the data to calibrate the auto and review thresholds, which are guesses for both matchers today;
- an honest benchmark for comparing the two matchers.

It needs a small store of decisions (pair, verdict, who, when) that the diff or review UI writes to.

**2. Pin weights where we have a prior belief.**
`configure(m_probability=..., fix_m_probability=True)` on a level stops it being re-estimated. That's useful for rare levels like the coordinate-typo one, where a few training examples could swing the weight a lot. Pin it near neutral until there are enough labels.

**3. Use Splink's explanations in review.**
Waterfall charts show each field's contribution to a pair's score, like the table above. They're a natural fit for the HTML diff view's review-band links. We already store the per-field `mw_*` values in each link's `explain`, so the view can draw them without Splink installed.

**4. Model the venue changes that Splink is too strict on, and rapidfuzz too forgiving on.**
- **Coffs Harbour 2023 → 2026:** Corindi Public School → Corindi Beach Community Hall, Woolgoolga Public School → Woolgoolga Uniting Church. Probably real venue changes: Splink correctly left them unlinked, rapidfuzz linked them.
- **WA 2021:** South West Health Campus → ECU South West Campus. Rapidfuzz auto-linked it, and that's probably wrong.

These are "same area, different venue" cases. For the diff the right output is often "removed X, added Y nearby". So a third outcome alongside link and no-link may be worth having: "replaced by a nearby venue". That could be a post-step on unlinked pairs within a few hundred metres, not a matcher change.

**5. Train for each kind of job.**
- Within an election (diffing re-scrapes): train on snapshot pairs, smoothed.
- Across elections (meta polling places, the loader's history): train on cross-election pairs, or use EM.

One model for both is a compromise. The bundled model is trained on everything, and that's a reasonable default until labels exist.

**6. More comparison levels to try, each checked against the benchmark.**
- Swapped lat/lon (`ColumnsReversedLevel`).
- A "one address contains the other" level.
- Postcode as its own comparison.
- Names with an added or removed qualifier ("Hall" → "Community Hall").

Measure each one: the address change above shows that a sensible-looking change can move results.

## Open challenges

- **Python version.** Splink 5 deprecates Python 3.10, which is what Django runs. Splink is an optional extra here and the rapidfuzz matcher has no such constraint, so this only bites if the loader uses Splink before Django moves to a newer Python.
- **Small, noisy training data.** We have two within-election series (SA 2025, VIC 2026) and one cross-election pair (federal 2022 → 2025). The federal answer key is a booth ID, not a venue ID. The WA, QLD, TAS and ACT scraper outputs have blank `ec_id`s, so they give agreement checks but no labels.
- **Uncalibrated thresholds.** Splink's probabilities sit near 0 or 1, so its review band is nearly empty. Rapidfuzz puts about 400 correct federal links in review. Neither can be tuned without labels (see item 1).
- **Booth vs venue.** The AEC lists a booth per division at the same venue. Several federal "wrong" links are the right venue paired with another division's booth. The target data model in `docs/modernisation/02-data-model-and-matcher.md` separates the two. Until then, expect noise there.
- **Speed.** Splink takes about 5 seconds a run, against rapidfuzz's well under a second. That's fine for scrapes, but would matter if linking ran inside a request.
