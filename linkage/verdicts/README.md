# Verdicts

`verdicts.jsonl` is the record of human judgements on where the two matchers disagreed. There's one line per place per pair of files. It's evidence for choosing a matcher, and a future source of Splink training labels (see `../SPLINK_NOTES.md`).

- **Recording:** in a diff report's Disagreements tab (see `../../diff/README.md`), then "Download verdicts".
- **Importing:** `uv run linkage verdicts import FILE` (from `linkage/`).
- **Summarising:** `uv run linkage verdicts tally`.

Each line has: the two input files and their SHA-256 hashes, the election, the place in the old file, what each matcher linked it to (or `null`) with score and band, the `verdict` (`rapidfuzz`, `splink`, `neither` or `both`), a `reason` and a `note`. Don't edit the file by hand; re-import to change a verdict.

## Stable place identity (schema version 2)

Each newly exported verdict must include `schema_version: 2` and `left.source_index`, the zero-based position of the CSV data row **before filtering** (the header is not counted). Keep `left.index` as the position after filtering so the report can still locate its displayed row.

For example, if the source has Alpha at row 0 and Beta at row 1, a report containing only Beta has `left.index: 0` but `left.source_index: 1`. Importing Beta's verdict cannot overwrite Alpha's; changing the filter still updates the same Beta verdict.

Exporters can read this position from `Record.source_index`, the linkage report's `left.source_indices[left.index]`, or a disagreement's `left_source_index`. Right-side disagreement decisions also include `right_source_index`.

Already-stored version-1 verdicts remain readable. Their filtered indices are kept in a separate legacy identity namespace, so they never replace verdicts with known source-row identities.

Downloads without original source indices are rejected with a message to regenerate the report. The original positions cannot be recovered from hashes and filtered indices alone, so importing them would risk overwriting another place's judgement. Generate a fresh report from the original CSVs and record its judgements again; regeneration cannot recreate human decisions automatically. Imports with valid source indices are saved in version-2 format.
