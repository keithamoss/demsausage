# Benchmark reference and reporting rules

The benchmark uses `first_report` from current polling-place noms, not
noms history or `latest_report`. The historical denominator is the reference
election's current active polling-place total. Current and reference coverage
both exclude soft-deleted noms.

Select the completed, visible, non-test comparable election from before the
election being shown with the highest final coverage, breaking ties by election
date. If the winner is
Victorian Election 2018 or Northern Territory Election 2016 in its respective
area, use the most recent completed comparable event instead. These targeted
exceptions currently select VIC 2022 and NT 2024. NSW retains best-covered
selection (NSW 2019); sparse NT coverage is accepted without a size threshold.

Benchmark days-out calculations and report cutoffs use `Australia/Perth`. Count
first reports through the end of the matching historical calendar day. Today's
partial-day count is therefore compared with a completed historical day.
Reports after the cutoff do not count; zero before the first report is valid.
The chart shows the active election, or the latest completed comparable
election until a newer comparable election is active. Inactive election stats,
including the benchmark, are cached for one hour, so changes can take up to an
hour to appear. Active election stats are live. The stats serializer uses the
existing `Elections.is_active()` method; its UTC date handling is a separate
follow-up in [the election date/timezone scope](ELECTION_DAY_AND_TIMEZONES.md).

No history-completeness, bulk-import, late-reporting or history-depth thresholds
are applied. Show an unavailable-data note if there is no reference, its active
polling-place total is zero for either election, or any active place with
non-deleted noms in either election lacks `first_report`. Do not fall back for
these errors beyond the two named exceptions.

The estimate uses current records; it does not reconstruct past deletions,
replacements or polling-place totals. The chart plots cumulative daily coverage
through election day, starting at the earliest report or at least 28 days out.
The current election's line stops today, with no projected future values.

Until the classification model/API/editor work is implemented, the benchmark
uses existing level flags, the approved inventory's named exclusions and a
named WA Senate re-run inclusion. The referendum retains its federal flag.
This temporary mapping must be replaced by explicit classification in that
separate task. No classification, date-field or geometry migration is included.
