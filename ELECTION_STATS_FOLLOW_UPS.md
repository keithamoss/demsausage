# Election stats follow-ups

The chosen design is a pace-delta callout above the admin "Polling places with
data" chart. It compares the active election with the best previous comparable
election at the same number of days before election day. The bullet-chart marker
and separate benchmark bar were explored but dropped in favour of the callout.

Each distinct follow-up has its own scope:

- [Election event classification](ELECTION_EVENT_CLASSIFICATION.md)
- [Election day and timezones](ELECTION_DAY_AND_TIMEZONES.md)
- [Primary-election constraint](ELECTION_PRIMARY_CONSTRAINT.md)
- [Election geometry editing](ELECTION_GEOMETRY_EDITING.md)
- [Representative synthetic local data](ELECTION_SYNTHETIC_DATA.md)
- [Production historical-data diagnostics](ELECTION_HISTORY_DIAGNOSTICS.md)
- [Shared benchmark reliability logic](ELECTION_BENCHMARK_RELIABILITY.md)

## Local handoff

The pace-delta callout implementation is included in this branch:

- `django/demsausage/app/sausage/election_benchmark.py` selects the best-covered
  past comparable election, reconstructs its coverage at the same days out,
  checks history quality and caches the result.
- `ElectionsStatsSerializer` sends a benchmark only for active elections.
- `admin-redesign/src/features/elections/ElectionBenchmarkCallout.tsx` renders
  ahead, behind, level (within 0.5 percentage points), or a historical-data
  error note above the first chart. The old marker and extra bar are not used.
- Backend coverage is in `django/tests/test_election_benchmark.py`; frontend
  coverage is in the elections feature's `__tests__` directory.

The diagnostic management command was already pushed separately to staging.
Its production output has not yet been reviewed. Reliability thresholds are
provisional and duplicated between the diagnostic and live benchmark.

None of the follow-up model, date/time, geometry or synthetic-data changes have
been implemented. Before writing classification code, complete and agree on the
inventory, including hidden elections. The new geographic field name, event
field values, and behaviour at every old boolean-use site remain open.

For Django validation, follow `.github/instructions/testing.instructions.md`
in the local DevContainer. The backend's eight targeted tests passed during
implementation; Redis-dependent failures were observed in the cloud baseline.
Do not rely on temporary cloud test services or paths when continuing locally.
