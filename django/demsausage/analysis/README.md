# Victorian submitter email analysis

These scripts list organisation-related email addresses used to submit approved
stalls at Victorian polling places, across state elections, federal elections,
by-elections and referendums. The final spreadsheet shows each address's likely
organisation type, most recent election and total approved submissions.

## 1. Export two JSON files

Run each query in your database GUI. Save the **raw value of `records`** as the
named JSON file in this folder, not a CSV or an object wrapping `records`.
Use the same database snapshot for both exports. Replace `demsausage` if your
database uses a different schema.

**`submitter_emails_20261114.json`** supplies the email categorisation:

```sql
SELECT COALESCE(
    jsonb_agg(
        jsonb_build_object(
            'email', s.email,
            'name', p.name,
            'premises', p.premises,
            'status', s.status,
            'submitter_type', s.submitter_type,
            'website', s.website
        )
        ORDER BY e.election_day, s.id
    ),
    '[]'::jsonb
) AS records
FROM demsausage.app_stalls AS s
JOIN demsausage.app_pollingplaces AS p ON p.id = s.polling_place_id
JOIN demsausage.app_elections AS e ON e.id = s.election_id
WHERE p.state = 'VIC'
  AND e.is_test IS FALSE
  AND s.status = 'Approved'
  AND s.email <> '';
```

**`victorian_elections_submitter_emails_20261114.json`** supplies the election
names and dates:

```sql
SELECT COALESCE(
    jsonb_agg(
        jsonb_build_object(
            'email', s.email,
            'status', s.status,
            'election_name', e.name,
            'election_day', to_char(e.election_day, 'YYYY-MM-DD')
        )
        ORDER BY e.election_day, s.id
    ),
    '[]'::jsonb
) AS records
FROM demsausage.app_stalls AS s
JOIN demsausage.app_pollingplaces AS p ON p.id = s.polling_place_id
JOIN demsausage.app_elections AS e ON e.id = s.election_id
WHERE p.state = 'VIC'
  AND e.is_test IS FALSE
  AND s.status = 'Approved'
  AND s.email <> '';
```

## 2. Run the scripts in order

From the repository root:

```bash
cd django/demsausage/analysis
python submitter_emails.py
python victorian_elections_submitter_emails.py
```

- [submitter_emails.py](./submitter_emails.py) trims spaces, lowercases emails,
  assigns likely organisation categories and counts submissions per email/domain.
  It creates `output_submitter_emails_20261114.csv` and
  `output_submitter_emails_20261114.json`. **This is the third JSON file; the
  script creates it, so you do not export it from the database.**
- [victorian_elections_submitter_emails.py](./victorian_elections_submitter_emails.py)
  combines that categorisation with election dates. Its final output is
  `output_victorian_elections_submitter_emails_20261114.csv`, with one row per
  email: `email`, `category`, `last_election_seen`, `submission_count`.

## What counts (and what does not)

- Two approved submissions in one election count twice. Do not deduplicate the
  exports.
- Latest election means the latest election date, not submission date or year.
- Declined/pending submissions, test elections and submissions without a linked
  Victorian polling place are excluded.
- Ordinary personal emails, unrecognised categories and "Government - Other"
  are excluded from the final report. Organisation-style personal addresses,
  such as fundraising emails, may still qualify.
- Categories are guesses based on email addresses, not verified identities.
  One email does not necessarily mean one person or organisation.
- The exports contain private email addresses: keep them out of Git and do not
  share them publicly.

## Refreshing or adapting it

Re-export both inputs and rerun both scripts. The dated filenames are hard-coded;
if you rename them, update the matching names in both scripts too.

For another state, change `p.state = 'VIC'` in **both** queries. For a single
election, add `AND s.election_id = YOUR_ELECTION_ID` to both queries. Keep their
filters identical and retain `status` and `election_day` in the election export.
