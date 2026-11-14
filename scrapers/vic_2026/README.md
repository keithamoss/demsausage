# VIC 2026 state election scraper

Builds a polling places CSV for the 2026 Victorian state election (election day 28 November) from two VEC sources:

- **Venues spreadsheet** (source of truth): linked as "view our venues spreadsheet" on the [state election candidate resources](https://www.vec.vic.gov.au/candidates-and-parties/become-a-state-election-candidate/state-election-candidate-resources) page. It lists every election day voting centre, with one row per district at joint venues, but has no coordinates.
- **VEC map API** (`maps.vec.vic.gov.au/api`), used by the [election venue locator](https://maps.vec.vic.gov.au/elections). It supplies lat/lon, the VEC venue ID and the host district. It's undocumented and returns only the 100 election day venues nearest a point, so the scraper keeps querying near spreadsheet venues it hasn't found yet until every one is matched (usually 35-45 requests).

Requests are sent at most one every 2 seconds with an identifying User-Agent. The scraper backs off on errors and stops after 3 failures in a row.

## Running

From the Dev Container, in this directory:

```
uv sync --locked
uv run python run.py            # scrape -> transform -> diff against the previous output
uv run python run.py --fresh    # don't resume an unfinished scrape
```

`uv sync` creates this scraper's Linux `.venv` from `pyproject.toml` and `uv.lock`.
Run `uv sync` again after changing dependencies.

Or run the steps on their own:

| Script | Network? | What it does |
|---|---|---|
| `uv run python scrape.py` | Yes | Downloads the spreadsheet and queries the map. Writes `data/cache/<stamp> scrape.json` and `<stamp> venues.xlsx`, saving after every request. An unfinished scrape less than 24 hours old is resumed. |
| `uv run python transform.py [cache]` | No | Reads a scrape cache and writes `data/<stamp> polling places.csv` plus `data/<stamp> warnings.txt`. |
| `uv run python diff.py [old new]` | No | Compares two outputs by VEC venue ID, including new and resolved warnings. Saves the report to `diffs/`. |

Load the CSV via the admin elections page using `config.json` (dry run first).

## Errors vs warnings

**Errors** stop the transform and no CSV is written:

- a spreadsheet venue that isn't on the map, or a map venue that isn't in the spreadsheet
- a venue at more than one location on the map, or two venues sharing coordinates
- a stale entry in `VENUE_KEY_ALIASES`
- changed spreadsheet headers or map fields

Confirmed map-only venues can be explicitly added by VEC venue ID to `API_ONLY_VENUE_IDS` in `common.py`. The allowlist is currently empty. For an approved map-only venue, the label and wheelchair classification come from the API; vote estimates and spreadsheet-only accessibility/entrance descriptions are unavailable. Remove its ID once it appears in the spreadsheet.

**Warnings** are written to `warnings.txt` but don't stop the run; the spreadsheet value is used. They cover:

- venues with no election day hours on the map, or hours other than 8am-6pm
- wheelchair ratings that differ between the spreadsheet and the map

The diff groups warnings by issue and shows which are still present, new, or resolved since the previous output.

## When a venue doesn't match

Venues are matched on name + address line 1 + suburb. If the scrape or transform reports the same venue as both NOT FOUND IN API and NOT IN SPREADSHEET with slightly different details, add an entry to `VENUE_KEY_ALIASES` in `common.py`, mapping the map's key to the spreadsheet's key. Remove the alias once VEC makes the two sources agree; the transform will flag it as stale.

## Output notes

- `name` is the host district's Voting Location Name, without the (JVC)/(HJVC) marker (e.g. "Bridport"). `premises` is the Venue Name (e.g. "Albert Park Primary School"). This matches the 2022 convention.
- `divisions` lists the host district first, then any guest districts at joint venues.
- `entrance_desc` comes from bracketed Address Line 2 values, e.g. "(access via X)".
- Wheelchair codes map to LNWA -> None, AWA -> Assisted, IWA -> Full, blank -> Unknown.
- Dashes, curly quotes and non-breaking spaces are converted to plain ASCII.
- The loader packs these columns into `extras`:
  - `vec_venue_id`
  - `host_district`
  - `est_ordinary_votes`
  - `est_absent_votes`
  
  A vote total is left blank if any district's estimate is missing.
