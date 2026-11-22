# Election day and timezones

Treat election day as a calendar day rather than relying on a meaningful stored
time. Audit all date and time consumers before deciding the migration and
timezone rules, including the benchmark, admin status and the public 09:30
early-tip-off warning.

The usual 8am opening and 6pm closing times can be hard-coded where needed,
rather than encoded in `election_day`.

This change is scoped but not implemented.

## Follow-up: simplify election-date storage and timezone handling

Do a focused audit and design before changing shared date behavior:

- Establish what timezone and time-of-day existing `election_day` values
  represent, including admin entry, imports, API serialization and stored rows.
- Trace every date-dependent consumer, including `Elections.is_active()`, the
  stats benchmark, stall submission/triage checks, admin status and the public
  early-tip-off warning.
- Recommend a simpler canonical representation for an election day and one
  consistent timezone-boundary rule. Consider whether a calendar-date field
  is more appropriate than a timestamp; do not assume a migration is required.
- If approved, implement the smallest safe change, including any data migration
  and focused boundary tests for UTC and Perth midnight.

For now, the stats serializer reuses the existing UTC-based
`Elections.is_active()` rule. Benchmark days-out and historical report cutoffs
still use `Australia/Perth`; resolving that difference belongs to this
follow-up.
