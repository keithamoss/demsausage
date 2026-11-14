# Production historical-data diagnostics

The read-only `diagnose_election_benchmark` management command has been committed
and pushed to staging. Run it against production for federal and state/territory
general elections to assess whether each jurisdiction's best-covered election
has usable history.

Checks cover history coverage, reporting after election day, concentrated
single-day imports, history reaching the comparison cutoff, reconstructed final
coverage matching stored coverage, and agreement with `first_report`. Use the
results to tune the live benchmark's reliability thresholds.

If the best-covered election fails the checks, show an explanatory note rather
than falling back to another election. Polling-place totals cannot be fully
reconstructed over time: `PollingPlaces` has no history, so the comparison uses
the historical election's current active total as its denominator.
