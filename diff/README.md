# Polling place diffs

Compares two scrapes of polling places and reports what changed. It sits on top of [`linkage/`](../linkage/), which decides which places in the two files are the same place. This module only describes the differences.

Both matchers (rapidfuzz and Splink) produce their own diff, so you can see in practice where they differ, and record which was right. The goal is to choose one matcher eventually, not to combine them.

## Running it

```
cd diff
uv sync
uv run ppdiff run OLD.csv NEW.csv --out-dir ../scrapers/<election>/diffs
uv run ppdiff series "../scrapers/<election>/data/*.csv" --out-dir ../scrapers/<election>/diffs   # every consecutive pair
uv run ppdiff report ../scrapers/<election>/diffs/<pair folder>                                    # rebuild report.html only
```

Options: `--matcher rapidfuzz|splink|both` (default `both`), `--ignore COLUMN` (repeatable), and `--election LABEL`, which defaults to the out-dir's parent folder. `series` skips pairs that already have a report unless you pass `--force`.

VIC 2026 writes to `scrapers/vic_2026/diffs-linkage/`, alongside the existing `diffs/` from its own `diff.py`.

## What you get

Each pair of files gets a folder `<old>__<new>/` containing:

| File | Contents |
|---|---|
| `link.json` | Both matchers' linkage results (compact JSON), with each input's path and SHA-256 |
| `diff-rapidfuzz.json`, `diff-splink.json` | One diff per matcher |
| `disagreements.json` | Each place the matchers handled differently, with both decisions and their reasoning |
| `report.html` | A self-contained report: a tab per matcher's diff, plus a Disagreements tab for verdicts |

A diff contains:
- **summary:** counts of unchanged, changed, added, removed, possible matches and warnings.
- **changed:** linked places where any column differs. Every shared column is compared, not just the ones used for matching. Each change gives the field and its old and new values. Whitespace-only and number-formatting changes ("-30.3344050" vs "-30.334405") are ignored.
- **location:** given as distance moved, with warnings for moves of 1 km or more. A move where one coordinate stays the same is flagged "likely coordinate typo".
- **possible_matches:** review-band links. They're kept apart from "changed", so a doubtful link is never silently reported as an edit.
- **added and removed:** full rows.
- **columns:** columns added, removed or ignored.
- **provenance:** the matcher and its settings, plus both input files with their hashes.

## Recording verdicts

The report's **Disagreements** tab lists every place the matchers handled differently, side by side. For each one you pick who was right (rapidfuzz, Splink, both wrong, or both defensible), a reason, and an optional note. Choices are saved in the browser as you go.

When you're done:
1. Press **Download verdicts**.
2. From `linkage/`, run `uv run linkage verdicts import FILE`. This merges the file into `linkage/verdicts/verdicts.jsonl`; a later verdict on the same place replaces the earlier one.
3. `uv run linkage verdicts tally` shows who was right, by reason.

## Notes

- The report refuses to rebuild if the source CSVs have changed since `link.json` was written. Run the diff again instead.
- Splink needs the bundled model, which ships with `linkage`, so the first `uv sync` installs Splink and DuckDB.
- Python 3.10+.
