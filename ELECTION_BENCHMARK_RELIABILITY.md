# Shared benchmark reliability logic

Consolidate the diagnostic command and live benchmark's shared checks and
thresholds so they cannot drift apart. Review differences explicitly: the live
benchmark currently does not include the diagnostic's `first_report` agreement
check. This consolidation is not implemented.

The [production diagnostics](ELECTION_HISTORY_DIAGNOSTICS.md) provide evidence
for tuning these checks. Historical-quality checks are retained; explicit
[event classification](ELECTION_EVENT_CLASSIFICATION.md) replaces only the
50-polling-place heuristic.
