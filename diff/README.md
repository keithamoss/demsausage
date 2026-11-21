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
uv run ppdiff index ../scrapers/<election>/diffs                                                   # rebuild index.html only
```

Options: `--matcher rapidfuzz|splink|both` (default `both`), `--ignore COLUMN` (repeatable), and `--election LABEL`, which defaults to the out-dir's parent folder. `series` skips pairs that already have a report unless you pass `--force`.

VIC 2026 writes to `scrapers/vic_2026/diffs-linkage/`, alongside the existing `diffs/` from its own `diff.py`.

## File names

Reports and the index show files by when they were scraped, e.g. "Wed 4 Nov 2026, 8:46 pm" for `20261104_204630 polling places.csv`. `ppdiff/names.py` recognises the date styles our scrapers use (`20261104_204630`, `2026-11-21`, `(20210207)`, `18-08-2026`, `2024_10_14`). Files without one fall back to a tidied file name. To support another style, add a pattern to `ADAPTERS` there.

## What you get

Each pair of files gets a folder `<old>__<new>/` containing:

| File | Contents |
|---|---|
| `link.json` | Both matchers' linkage results (compact JSON), with each input's path and SHA-256 |
| `diff-rapidfuzz.json`, `diff-splink.json` | One diff per matcher |
| `disagreements.json` | Each place the matchers handled differently, with both decisions and their reasoning |
| `report.html` | A self-contained report: a tab per matcher's diff, plus a Disagreements tab for verdicts |

The diffs folder also gets an `index.html`, rebuilt after every run. It lists every pair, with each matcher's counts and how many disagreements there are. It also has a **history by place**: every place that changed at least once, followed from file to file through each matcher's links (e.g. "Kaniva: added 7 Nov, wheelchair access improved 16 Nov"). A place's history continues while consecutive pairs share a file.

A diff contains:
- **summary:** counts of unchanged, changed, added, removed, possible matches and warnings.
- **changed:** linked places where any column differs. Every shared column is compared, not just the ones used for matching. Each change gives the field and its old and new values. Whitespace-only and number-formatting changes ("-30.3344050" vs "-30.334405") are ignored.
- **location:** given as distance moved, with warnings for moves of 1 km or more. A move where one coordinate stays the same is flagged "likely coordinate typo".
- **possible_matches:** review-band links. They're kept apart from "changed", so a doubtful link is never silently reported as an edit.
- **added and removed:** full rows.
- **columns:** columns added, removed or ignored.
- **replacements:** a removed place and an added place within 500 m are paired as a likely replacement (a venue swap the matcher rightly didn't link). The removed and added entries point at each other.
- **quality:** checks on the new file. Different places at identical coordinates, coordinates with 3 or fewer decimal places, missing coordinates, and fields that had a value and are now blank.
- **categories:** each change gets a category (accessibility, entrance, hours, address, name, divisions, votes, other). Wheelchair access changes are marked `improved` or `worse`.
- **context_points:** every place's coordinates in the new file, used as the map's background.
- **provenance:** the matcher and its settings, plus both input files with their hashes.

## The report

- **Summary tiles and an overview map** (OpenLayers 10.11.0). It shows moves as old → new lines (amber for a likely coordinate typo), added and removed places, and dotted lines joining likely replacements, over grey dots for unchanged places. Tapping a marker jumps to its card.
- **"Check on map" on every moved, added, removed and replacement card.** It opens a map inside the card with the old and new positions. "Zoom to old" / "Zoom to new" go to street level, and "old/new in Google Maps" opens each position in Google Maps.
- **Basemaps**, switchable on every map; your choice is remembered:
  - **Map** (default): [OpenFreeMap](https://openfreemap.org) Liberty. Free, no key, OpenStreetMap data, with names of schools, halls and churches, building outlines and house numbers when zoomed in, which is what you need to check a polling place. (Positron and CARTO's light basemap, the public site's, look cleaner but drop venue names.)
  - **Satellite**: Esri World Imagery with Liberty's labels on top, like Google's hybrid view.
  - **CARTO**: the public site's basemap, offered once you paste its API key (`VITE_CARTO_API_KEY`) into the box at the bottom of a diff tab. The key stays in that browser's localStorage and is never written into reports. You can also open a report with `#carto-key=KEY` on the end of its address.

  OpenStreetMap's own tile servers aren't used, because they refuse pages opened from a local file (no Referer). Google's map tiles need a key and can't be used directly, hence the links. Reports need an internet connection for the maps.
- **Filter chips** by kind of change (Accessibility, Address, Location…), plus a name filter.
- **Changed text is highlighted word by word.** Short values and near-total rewrites show old → new whole.
- **"Matchers disagree" badges** on any place the other matcher handled differently, linking to the Disagreements tab.
- **Sections:** warnings, possible matches, likely replacements, changed, added, removed, data quality.
- **Copy summary:** plain text for Slack or a commit message.

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
