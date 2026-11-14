# Election day and timezones

Treat election day as a calendar day rather than relying on a meaningful stored
time. Audit all date and time consumers before deciding the migration and
timezone rules, including the benchmark, admin status and the public 09:30
early-tip-off warning.

The usual 8am opening and 6pm closing times can be hard-coded where needed,
rather than encoded in `election_day`.

This change is scoped but not implemented.
