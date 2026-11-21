## Electoral boundaries: source and pipeline (flagged, not designed)

### Why this comes up
Two checks need up-to-date boundaries for every election we run, and we only reliably have federal ones:
- **Point-in-polygon at scrape and diff time.** Flag a new or moved polling place that falls outside its own division, district or ward. In section 10's federal 2022 backtest it was half of the best detector combination (with "same coordinates, different premises", which the diff report already checks), and it catches errors that distance checks miss. The diff report (`diff/`) would show it alongside its other quality checks, but it's on hold until boundaries exist for the election being diffed.
- **Loader dedupe and home-division lookup** (`ElectoralBoundaries`, `find_home_division`) already depend on boundaries. Section 15 and doc 10 note the gaps: 2025 federal shapefiles aren't in the repo, and 2022 boundaries mismatched 19 booths.

### What we have today
- `electoral_boundaries/` holds federal only: AEC shapefiles for 2019 and 2022, plus readmes and load scripts for 2025 and the 2023 referendum. The 2025 shapes were downloaded from the AEC and loaded into the database, but aren't in the repo.
- There's nothing for states, territories or local councils, so there's no boundary check for state elections, by-elections like Coffs Harbour (council) or Kiama, or ward-based council elections.
- `ElectoralBoundaries` (models.py) already stores federal and state shapes with `election_ids`, so the storage side exists.
- Loading is manual: download, then run a per-election script against the database.

### What a pipeline needs
1. **A source per jurisdiction and level:** federal divisions (AEC), state and territory districts (each commission), and council areas and wards (state commissions or local government bodies). The ABS publishes Commonwealth and state electoral divisions and local government areas annually as part of its statistical geography, which might be a single starting point. Check how quickly it follows redistributions, and note that it doesn't cover wards.
2. **Versioning against elections:** boundaries change with redistributions, so each set needs an effective date and the elections it applies to (by-elections use the boundaries in force at the time). That's what `election_ids` already models.
3. **A repeatable fetch-and-normalise step,** like the scrapers: download, record provenance (URL, date, file hash), reproject to WGS84, normalise division names to match how scrapers and commissions write them, and store each set somewhere other than the loader's database, so the diff tool and CI can use it without a database.
4. **Coverage reporting:** a table of which elections have boundaries and which don't, so a missing set is obvious before polling day rather than discovered by the loader.

### Uses once it exists
- **Diff report:** flag places outside their own boundary (with the exclusion for out-of-division booths found in section 10).
- **Scrape-time validation:** the same check as section 10's detector 1, run by the shared validator.
- **Loader:** dedupe and home division without manual overrides.

### Open questions
- Which jurisdictions publish machine-readable boundaries, under what licence, and how soon after a redistribution?
- Is the ABS statistical geography timely enough to be the default, with commission data only where it lags?
- Where should boundary files live: in the repo (size), object storage, or fetched on demand and cached?
- Do we need ward boundaries, or are council areas enough for council elections?
