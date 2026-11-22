# PR #4625 review follow-up

These findings were reproduced on 22 November 2026 against commit `eb1dce10`.
They are not fixed yet. Priorities are operational, not security ratings.

## High: stale reports after input files change

[`latest` and `series` skip existing reports without checking input hashes](https://github.com/keithamoss/demsausage/pull/4625#discussion_r4657684364).
If a scrape is rewritten at the same path, the report can silently show old
changes and loader checks. Re-running with `--force` is a workaround.

Check the current inputs against the recorded hashes before skipping, and
regenerate when they differ. Test both commands with unchanged and changed
inputs.

## High: a suggestion can undo a loader correction

[A newly blank field can already have a value after existing loader fixes](https://github.com/keithamoss/demsausage/pull/4625#discussion_r4657684386).
For example, a fix that fills a blank address with `2 Verified St` can be
followed by a suggested fix that restores `1 Old St` instead.

Check the new loaded value before offering a blank-field overwrite. Test both
corrected and still-blank values, including unavailable loaded rows.

## Medium: suggestions stop at 50 places

[The quality-list display limit also limits fix generation](https://github.com/keithamoss/demsausage/pull/4625#discussion_r4657684379).
With 51 linked places whose addresses become blank, the quality count is 51
but only 50 suggestions are generated.

Generate suggestions from the complete issue list while retaining the display
limit. Test a case with more than 50 affected places.

## Medium: missing configured fields go unreported

[Loader checks can miss absent address or division fields](https://github.com/keithamoss/demsausage/pull/4625#discussion_r4657684392).
The report can show no load problems even though the loader rejects the missing
configured fields.

Validate configured `address_fields` and `division_fields` against the
loader's effective header, including when an `address` field already exists.
Test both missing-field cases and valid configurations.
