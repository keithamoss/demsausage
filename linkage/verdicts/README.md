# Verdicts

`verdicts.jsonl` is the record of human judgements on where the two matchers disagreed. There's one line per place per pair of files. It's evidence for choosing a matcher, and a future source of Splink training labels (see `../SPLINK_NOTES.md`).

- **Recording:** in a diff report's Disagreements tab (see `../../diff/README.md`), then "Download verdicts".
- **Importing:** `uv run linkage verdicts import FILE` (from `linkage/`).
- **Summarising:** `uv run linkage verdicts tally`.

Each line has: the two input files and their SHA-256 hashes, the election, the place in the old file, what each matcher linked it to (or `null`) with score and band, the `verdict` (`rapidfuzz`, `splink`, `neither` or `both`), a `reason` and a `note`. Don't edit the file by hand; re-import to change a verdict.
