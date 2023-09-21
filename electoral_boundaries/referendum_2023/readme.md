There's been no redistribution since we ran the 2022 Federal election, so we can re-use the existing boundaries.

```sql
UPDATE "demsausage"."app_electoralboundaries" SET election_ids = election_ids || '[53]'::jsonb WHERE loader_id = 'federal_election_2022';
```