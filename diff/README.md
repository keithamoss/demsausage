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
uv run ppdiff latest "../scrapers/<election>/data/*.csv" --out-dir ../scrapers/<election>/diffs    # newest two only (scrapers call this)
```

**Run automatically by scrapers.** `scrapers/vic_2026/run.py` calls `ppdiff latest` after writing each CSV. Reports go into `diffs-linkage/`; open the `index.html` in that folder. `--no-linkage-diff` skips the generic diff, and a failed generic diff never fails the scrape. Other scrapers can do the same: see `linkage_diff()` in the VIC runner. Scraper outputs need a timestamp in the file name so same-day scrapes don't overwrite each other.

Options: `--matcher rapidfuzz|splink|both`, `--ignore COLUMN` (repeatable), `--large-move-m`, `--replacement-radius-m`, and `--election LABEL`, which defaults to the out-dir's parent folder.

**Per-election settings:** put a `diff.json` beside the election's `config.json`, so automatic runs pick it up with no flags:

```json
{"ignore": ["est_ordinary_votes", "est_absent_votes"], "large_move_m": 1000, "replacement_radius_m": 500, "matcher": "both"}
```

Every key is optional. Command-line `--ignore` adds to the file's list, and the other options override it. Unknown keys are an error, to catch typos. The settings used are recorded in each diff. `series` skips pairs that already have a report unless you pass `--force`.

VIC 2026 writes to `scrapers/vic_2026/diffs-linkage/`, alongside the existing `diffs/` from its own `diff.py`.

Report rebuilds check source hashes using paths relative to the pair folder, so the
check works from any working directory. For older reports with unresolved relative
paths, run the diff again to record their locations.

## File names

Reports and the index show files by when they were scraped, e.g. "Wed 4 Nov 2026, 8:46 pm" for `20261104_204630 polling places.csv`. `ppdiff/names.py` recognises the date styles our scrapers use (`20261104_204630`, `2026-11-21`, `(20210207)`, `18-08-2026`, `2024_10_14`). Files without one fall back to a tidied file name. To support another style, add a pattern to `ADAPTERS` there.

`series`, `latest`, and the index order files by these dates, using filenames to break ties. If all filenames are undated they use filename order; a mixture of dated and undated filenames is an error because their relative order is unknown. A date without a time sorts at midnight, so use timestamps to distinguish scrapes on the same day.

## What you get

Each pair of files gets a folder `<old>__<new>/` containing:

| File | Contents |
|---|---|
| `link.json` | Both matchers' linkage results (compact JSON), with each input's path and SHA-256 |
| `diff-rapidfuzz.json`, `diff-splink.json` | One diff per matcher |
| `disagreements.json` | Each place the matchers handled differently, with both decisions and their reasoning |
| `report.html` | An HTML report: a tab per matcher's diff, plus a Disagreements tab for verdicts |

The diffs folder also gets an `index.html`, rebuilt after every run. It shows:
- a **matcher comparison**: how many places the matchers disagreed on, in how many pairs, and a tally of the verdicts recorded in `linkage/verdicts/verdicts.jsonl` (who was right, by reason) for this election and for all elections.
- every pair, with each matcher's counts, its disagreements and how many verdicts are recorded. Runs of consecutive pairs with no changes fold into one line. It also has a **history by place**: every place that changed at least once, followed from file to file through each matcher's links (e.g. "Kaniva: added 7 Nov, wheelchair access improved 16 Nov"). A place's history continues while consecutive pairs share a file.

A diff contains:
- **summary:** counts of unchanged, changed, added, removed, possible matches and warnings.
- **changed:** linked places where any column differs. Every shared column is compared, not just the ones used for matching. Each change gives the field and its old and new values. Whitespace-only and number-formatting changes ("-30.3344050" vs "-30.334405") are ignored.
- **location:** given as distance moved, with warnings for moves of 1 km or more. A move where one coordinate stays the same is flagged "likely coordinate typo".
- **possible_matches:** review-band links. They're kept apart from "changed", so a doubtful link is never silently reported as an edit.
- **added and removed:** full rows.
- **columns:** columns added, removed or ignored.
- **replacements:** a removed place and an added place within 500 m are paired as a likely replacement (a venue swap the matcher rightly didn't link). The removed and added entries point at each other.
- **suggested_fixes:** draft `fix_data_issues` entries for the election's `config.json`, using the loader's column names after `rename_columns`. Each one puts back the previous value, for a move of 1 km or more or a field gone blank, selecting the place by its name after existing loader fixes (with a warning if the name isn't unique). Both coordinate and blank-field fixes use old values after loader conversion and existing fixes; they are withheld if those values are unavailable or introduce a loader validation problem. When existing fixes already restore the previous coordinates, no coordinate fix is offered. Ignored fields do not produce newly-blank checks or fixes. For big moves it guesses which side is wrong by how isolated each position is from the other polling places. If the old position was the outlier, it says "no fix needed" instead of offering a fix.
- **cosmetic:** linked places whose only differences are ones the linkage module treats as the same value (`linkage.normalise.equivalent`): case, punctuation, spacing, address abbreviations, noise words in names, number formatting, and how opening hours are written ("8am to 6pm" = "08:00 AM - 06:00 PM"). Each change carries `cosmetic: true/false`. Only linkage decides this; the diff does no matching of its own. Cosmetic-only places aren't counted as changed.
- **nothing_changed:** true when the two files have the same places, with no differences beyond cosmetic ones.
- **quality:** checks on the new file. Different places at identical coordinates, coordinates with 3 or fewer decimal places, missing coordinates, and fields that had a value and are now blank.
- **categories:** each change gets a category (accessibility, entrance, hours, address, name, divisions, votes, other). Wheelchair access changes are marked `improved` or `worse`.
- **context_points:** every place's coordinates in the new file, used as the map's background.
- **provenance:** the matcher and its settings, plus both input files with their hashes.

## Loader checks

If the election has a `config.json` beside its diffs folder, each diff also checks the new file against the polling place loader. It uses the loader's own rules, not a copy: `django/demsausage/app/sausage/loader_rules.py` holds the steps the loader runs (filters, renaming, added columns, extras, dropped columns, cleaning regexes, `fix_data_issues`, address and division merging) and its value rules, with no Django dependency. `loader.py` calls the same functions. Both checks are the same for every matcher.

- **Config fix audit:** each existing `fix_data_issues` entry is checked against the new scrape:
  - *still applies*;
  - *source already has the fixed value* (the entry can probably go);
  - *doesn't match any place* or *stopped matching in this scrape*;
  - *matches more than one place* (fine when the entry translates a value, e.g. every "Assistance" → "Assisted");
  - *overwrites a field that doesn't exist after renaming*, so the loader silently skips it (e.g. `lng` instead of `lon`).
- **Load problems:** rows the loader would reject after applying the config and fixes, as far as can be checked without a database. That covers required fields, allowed wheelchair and state values, blank names or addresses, invalid coordinates, and cleaning regexes that don't match. The loader's serializer and its boundary check can still catch more.
- **Skipped places:** rows with blank or literal `0` coordinates that the loader skips when geocoding is disabled.

If the config references a field missing from either scrape, the raw diff still runs.
The report identifies the incompatible transformation and which loader checks could
not run; suggestions needing unavailable loaded values are withheld.

## The report

- **Summary tiles and an overview map** (OpenLayers 10.11.0). It shows moves as old → new lines (amber for a likely coordinate typo), added and removed places, and dotted lines joining likely replacements, over grey dots for unchanged places. Tapping a marker jumps to its card.
- **"Check on map" on every moved, added, removed and replacement card.** It opens a map inside the card with the old and new positions. "Zoom to old" / "Zoom to new" go to street level, and "old/new in Google Maps" opens each position in Google Maps.
- **Basemap: [OpenFreeMap](https://openfreemap.org) Liberty.** Free, no key, OpenStreetMap data, drawn with `ol-mapbox-style` 13.9.0. It names schools, halls and churches where OpenStreetMap has them, and shows buildings and house numbers when zoomed in. That's what you need to check a polling place's position. Chosen over Positron and CARTO's light basemap (the public site's), which drop venue names, and over Esri's street map. Reports need an internet connection for the map, and the Claude app's file preview blocks the tiles, so open `report.html` in a normal browser.
- **Filter chips** by kind of change (Accessibility, Address, Location…), plus a name filter.
- **Changed text is highlighted word by word.** Short values and near-total rewrites show old → new whole.
- **"Matchers disagree" badges** on any place the other matcher handled differently, linking to the Disagreements tab.
- **Loader sections first:** config fixes to look at, config fixes that still apply (folded), and problems that would stop the load, with tiles counting them.
- **Sections:** warnings, suggested config fixes, possible matches, likely replacements, changed, added, removed, data quality. Changed places come biggest first: warnings, then accessibility getting worse, then the largest moves, then the most fields changed. Possible matches come least confident first.
- **Suggested config fixes**, each with its JSON, a copy button, and a link to the change; "Copy all" copies them as a list. Changed cards show a "suggested fix" badge.
- **Reviewed ticks** on every card, shared by both matchers' tabs. Section headers count how many are reviewed, and "Hide reviewed" hides them. Ticks are kept in the browser. To keep them in the repo, press **Download review**, then run `uv run ppdiff reviewed import FILE --diffs-dir ../scrapers/<election>/diffs`. That writes the pair folder's `reviewed.json` (unticked places are removed too) and rebuilds the report, which then opens with those ticks. An explicitly empty `reviewed` object removes all ticks; files without that object are rejected. The button shows how many ticks aren't saved yet.
- **Older review data:** Browser ticks from reports using the previous hash-only storage key remain in the browser but are not automatically loaded, because identical files can belong to different pairs. Open the older report to download them; older review downloads import only when their hashes identify a single pair. Older saved `pair-<new row>` ticks remain in `reviewed.json` but are not applied to linked cards, because they don't identify the old row. Older `cfgfix-<number>` ticks are not applied to config fixes, since their numbers can change; config-fix ticks are now tied to the fix and the configuration, so a config change requires reviewing them again. Review these items again; no old data is deleted automatically.
- **Keyboard:** `j` / `k` move to the next / previous card, and `x` ticks the current one as reviewed.
- **Accessibility and browser behaviour:**
  - The views are proper tabs: use the arrow keys, Home and End to move between them.
  - Section headers are buttons that fold their section. A folded section still opens when find-in-page (Ctrl/Cmd+F) matches text inside it.
  - Jumps to a card land below the sticky tab bar and move keyboard focus to the card.
  - The report follows the system's light or dark setting for form controls and scrollbars.
  - Animation is turned off when the system asks for reduced motion.
  - "Copy" results are announced to screen readers, and each map has a text summary.
  - Long sections only render the cards on screen.
  - OpenLayers loads deferred from jsDelivr, with Subresource Integrity hashes. When you upgrade it, update the `integrity` attributes in `report_template.html`.
- **Cosmetic changes** are listed in their own folded section, and tagged "cosmetic" where they appear alongside real changes.
- **"No changes"** shown at the top when nothing changed.
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
