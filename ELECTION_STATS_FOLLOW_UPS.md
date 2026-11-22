# Election stats follow-ups

The admin "How we're tracking" card follows the "Polling places with data" card.
It compares daily cumulative coverage with a previous comparable election,
shading the gap between the lines. The previous election continues through
election day; an active election's line stops at today.

Each distinct follow-up has its own scope:

- [Election event classification](ELECTION_EVENT_CLASSIFICATION.md)
- [Election day and timezones](ELECTION_DAY_AND_TIMEZONES.md)
- [Primary-election constraint](ELECTION_PRIMARY_CONSTRAINT.md)
- [Election geometry editing](ELECTION_GEOMETRY_EDITING.md)
- [Representative synthetic local data](ELECTION_SYNTHETIC_DATA.md)
- [Shared benchmark reliability logic](ELECTION_BENCHMARK_RELIABILITY.md)

## Local handoff

The comparison chart implementation is included in this branch:

- `django/demsausage/app/sausage/election_benchmark.py` selects a completed
  comparable election, applies the targeted VIC/NT legacy fallbacks, estimates
  daily coverage from current noms' `first_report` using Perth calendar days.
  Active election stats are live; inactive stats, including the benchmark,
  are cached for one hour. See [the business rules](ELECTION_BENCHMARK_RELIABILITY.md).
- `ElectionsStatsSerializer` supplies a comparison for eligible active
  elections and the latest completed comparable election until a newer one is
  active. It reuses `Elections.is_active()`; shared timezone behavior is tracked
  in [the election date/timezone follow-up](ELECTION_DAY_AND_TIMEZONES.md).
- `admin-redesign/src/features/elections/ElectionTrackingCard.tsx` renders the
  chart or an unavailable-data note. Selecting a day on the chart marks it and
  shows its values in a bottom notice that does not cover the chart. The
  full series has no screen-reader-accessible alternative. Its SVG click
  listener is a temporary workaround for MUI Charts v7's unreliable mobile
  axis clicks; revisit MUI's native axis-click handling when upgrading.
- Backend coverage is in `django/tests/test_election_benchmark.py`; frontend
  coverage is in the elections feature's `__tests__` directory.

Historical data was reviewed against a local production copy. Noms history
started in February 2025, and the legacy import preserved missing `first_report`
values. VIC 2018 and NT 2016 have missing timestamps; NSW 2019 has complete
`first_report` timestamps despite having no noms history. The obsolete
history-quality diagnostic has been removed; the live benchmark uses the
revised first-report rules and targeted fallbacks.

None of the follow-up model, date-field, geometry or synthetic-data changes have
been implemented. The complete inventory, including hidden elections, is now
approved. Classification model/API/editor changes remain a separate task.
Perth calendar-day handling is used for benchmark day and report-cutoff
calculations. Broader election-date storage and timezone cleanup remains a
separate follow-up.

For Django validation, follow `.github/instructions/testing.instructions.md`
in the local DevContainer. Redis-dependent failures were observed in the cloud
baseline.
Do not rely on temporary cloud test services or paths when continuing locally.
