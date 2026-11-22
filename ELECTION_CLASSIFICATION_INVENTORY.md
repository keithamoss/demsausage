# Election classification inventory

## Approved classifications and comparison rules

The classifications and comparison behavior in this inventory were approved
by the user on 14 November 2026. This approval covers the event classifications,
not implementation or the separate election-day, geometry, synthetic-data, and
benchmark-reliability follow-ups.
The inventory was read from the local development database, which the operator
identified as a copy of production, on 14 November 2026. It includes hidden and
test rows; no production writes were made.

The field names and values below describe the approved classification
dimensions; model/API implementation remains separate:

- `geographic_area` (proposed replacement for `jurisdiction`): `AUS` or the
  relevant state/territory, independent of election level.
- `event_level`: `federal`, `state`, or `local`. For this feature it is the
  comparison/statistics level, not necessarily the constitutional chamber.
- `event_type`: `general`, `by_election`, `referendum`, `senate_rerun`, or
  `local_government`. The 2018 test row is not a real event and remains marked
  by `is_test`, rather than gaining a production event type.

Approved comparison and legacy-use behavior:

- General elections compare within the same level and geographic area.
- The WA Senate re-run compares with WA general elections in both directions;
  its comparison level is therefore `state`.
- The 2023 referendum compares with federal general elections in both
  directions.
- By-elections and local-government events are excluded both as the selected
  event and as comparison candidates.
- Test rows are excluded. Hidden future general elections become comparable
  only when visible; benchmark candidates must also be in the past.
- Overseas-results search and Federal Sausagelytics use the federal level;
  local-government events retain the current non-federal/state-shaped
  Sausagelytics response. The WA Senate re-run therefore stays on the
  state-style path and the referendum on the federal path.
- In the admin chart, by-elections and local-government events show only
  themselves and are omitted from every other event's comparison bars.

Dates below are the stored `election_day` values (UTC, including time where
non-midnight); they are not a decision on local election-day/timezone semantics.
The approved classifications are recorded below.

## Complete inventory

| ID | Stored `election_day` | Election | Area | Approved level | Approved type | Comparison treatment |
|---:|---|---|---|---|---|---|
| 1 | 2013-09-07 00:00Z | Federal Election 2013 | AUS | federal | general | Federal general group |
| 2 | 2014-03-15 00:00Z | Tasmanian Election 2014 | TAS | state | general | TAS state general group |
| 3 | 2014-03-15 00:00Z | South Australian Election 2014 | SA | state | general | SA state general group |
| 4 | 2014-04-05 00:00Z | WA Senate Election 2014 | WA | state | senate_rerun | With WA state general elections, both directions |
| 5 | 2014-11-29 00:00Z | Victorian Election 2014 | VIC | state | general | VIC state general group |
| 6 | 2015-01-31 00:00Z | Queensland Election 2015 | QLD | state | general | QLD state general group |
| 7 | 2015-03-28 00:00Z | New South Wales Election 2015 | NSW | state | general | NSW state general group |
| 8 | 2015-09-19 00:00Z | Canning By-election 2015 | WA | federal | by_election | Excluded |
| 9 | 2016-07-02 00:00Z | Federal Election 2016 | AUS | federal | general | Federal general group |
| 10 | 2016-10-15 00:00Z | ACT Election 2016 | ACT | state | general | ACT state general group |
| 11 | 2016-08-27 00:00Z | Northern Territory Election 2016 | NT | state | general | NT state general group |
| 12 | 2017-03-11 00:00Z | Western Australian Election 2017 | WA | state | general | WA state general group |
| 13 | 2017-11-25 00:00Z | Queensland Election 2017 | QLD | state | general | QLD state general group |
| 14 | 2017-12-28 00:00Z | Test Election 2018 (hidden, test) | QLD | — | — (`is_test`) | Excluded |
| 15 | 2018-03-03 00:00Z | Tasmanian Election 2018 | TAS | state | general | TAS state general group |
| 16 | 2018-03-17 00:00Z | South Australian Election 2018 | SA | state | general | SA state general group |
| 17 | 2018-03-17 00:00Z | Batman By-election 2018 | VIC | federal | by_election | Excluded |
| 18 | 2018-03-17 00:00Z | Cottesloe By-election 2018 | WA | state | by_election | Excluded |
| 19 | 2018-07-28 00:00Z | Perth By-election 2018 | WA | federal | by_election | Excluded |
| 20 | 2018-07-28 00:00Z | Fremantle By-election 2018 | WA | federal | by_election | Excluded |
| 21 | 2018-07-28 00:00Z | Braddon By-election 2018 | TAS | federal | by_election | Excluded |
| 22 | 2018-07-28 00:00Z | Mayo By-election 2018 | SA | federal | by_election | Excluded |
| 23 | 2018-07-28 00:00Z | Longman By-election 2018 | QLD | federal | by_election | Excluded |
| 24 | 2018-10-20 00:00Z | Wentworth By-election 2018 | NSW | federal | by_election | Excluded |
| 25 | 2018-11-24 00:00Z | Victorian Election 2018 | VIC | state | general | VIC state general group |
| 26 | 2019-03-23 00:00Z | New South Wales Election 2019 | NSW | state | general | NSW state general group |
| 27 | 2019-05-18 00:00Z | Federal Election 2019 | AUS | federal | general | Federal general group |
| 28 | 2021-05-01 00:00Z | Tasmanian Election 2021 | TAS | state | general | TAS state general group |
| 29 | 2020-08-22 00:00Z | Northern Territory Election 2020 | NT | state | general | NT state general group |
| 30 | 2020-10-17 00:00Z | ACT Election 2020 | ACT | state | general | ACT state general group |
| 31 | 2020-10-31 00:00Z | Queensland Election 2020 | QLD | state | general | QLD state general group |
| 32 | 2021-03-13 00:00Z | Western Australian Election 2021 | WA | state | general | WA state general group |
| 33 | 2022-03-19 00:00Z | South Australian Election 2022 | SA | state | general | SA state general group |
| 34 | 2022-11-26 00:00Z | Victorian Election 2022 | VIC | state | general | VIC state general group |
| 35 | 2023-03-25 00:00Z | New South Wales Election 2023 | NSW | state | general | NSW state general group |
| 36 | 2021-12-04 00:00Z | NSW Local Govt Elections 2021 | NSW | local | local_government | Excluded |
| 37 | 2022-05-20 16:00Z | Federal Election 2022 | AUS | federal | general | Federal general group |
| 38 | 2024-08-25 00:00Z | Northern Territory Election 2024 | NT | state | general | NT state general group |
| 39 | 2028-08-26 00:00Z | Northern Territory Election 2028 (hidden) | NT | state | general | NT state general group when visible |
| 40 | 2024-10-19 00:00Z | ACT Election 2024 | ACT | state | general | ACT state general group |
| 41 | 2028-10-21 00:00Z | ACT Election 2028 (hidden) | ACT | state | general | ACT state general group when visible |
| 42 | 2024-10-26 00:00Z | Queensland Election 2024 | QLD | state | general | QLD state general group |
| 43 | 2028-10-28 00:00Z | Queensland Election 2028 (hidden) | QLD | state | general | QLD state general group when visible |
| 44 | 2025-03-08 00:00Z | Western Australian Election 2025 | WA | state | general | WA state general group |
| 45 | 2029-03-10 00:00Z | Western Australian Election 2029 (hidden) | WA | state | general | WA state general group when visible |
| 46 | 2024-03-23 00:00Z | Tasmanian Election 2024 | TAS | state | general | TAS state general group |
| 47 | 2026-03-21 00:00Z | South Australian Election 2026 | SA | state | general | SA state general group |
| 48 | 2030-03-16 00:00Z | South Australian Election 2030 (hidden) | SA | state | general | SA state general group when visible |
| 49 | 2026-11-28 00:00Z | Victorian Election 2026 | VIC | state | general | VIC state general group |
| 50 | 2030-11-30 00:00Z | Victorian Election 2030 (hidden) | VIC | state | general | VIC state general group when visible |
| 51 | 2027-03-27 00:00Z | New South Wales Election 2027 (hidden) | NSW | state | general | NSW state general group when visible |
| 52 | 2023-04-01 00:00Z | Aston By-election 2023 | VIC | federal | by_election | Excluded |
| 53 | 2023-10-14 00:00Z | Referendum 2023 | AUS | federal | referendum | With federal general elections, both directions |
| 54 | 2024-03-01 16:00Z | Dunkley By-election 2024 | VIC | federal | by_election | Excluded |
| 55 | 2024-03-16 00:00Z | QLD Local Govt Elections 2024 | QLD | local | local_government | Excluded |
| 56 | 2024-09-14 00:00Z | NSW Local Government Elections 2024 | NSW | local | local_government | Excluded |
| 57 | 2024-10-19 00:00Z | NSW By-Elections 2024 | NSW | state | by_election | Excluded |
| 58 | 2025-05-02 16:00Z | Federal Election 2025 | AUS | federal | general | Federal general group |
| 59 | 2025-07-18 16:00Z | Tasmanian Election 2025 | TAS | state | general | TAS state general group |
| 60 | 2026-08-28 16:00Z | Secret Harbour By-election 2026 | WA | state | by_election | Excluded |
| 61 | 2026-08-21 16:00Z | Kiama By-election 2026 | NSW | local | by_election | Excluded |

## By-election level research

The approved levels below are based on the offices contested, not merely the
database `jurisdiction`. Wikipedia's article text identifies the federal
House of Representatives or the relevant state legislature for the listed
contests. Kiama 2026 is a local-government vacancy, not a federal or state
by-election.

| ID | By-election | Approved level | Research |
|---:|---|---|---|
| 8 | Canning 2015 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2015_Canning_by-election): Australian House of Representatives seat |
| 17 | Batman 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Batman_by-election): Australian House of Representatives seat |
| 18 | Cottesloe 2018 | state | [Wikipedia](https://en.wikipedia.org/wiki/2018_Cottesloe_state_by-election): electoral district in Western Australia's Legislative Assembly |
| 19 | Perth 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Perth_by-election): Australian House of Representatives seat |
| 20 | Fremantle 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Fremantle_by-election): Australian House of Representatives seat |
| 21 | Braddon 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Braddon_by-election): Australian House of Representatives seat |
| 22 | Mayo 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Mayo_by-election): Australian House of Representatives seat |
| 23 | Longman 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Longman_by-election): Australian House of Representatives seat |
| 24 | Wentworth 2018 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2018_Wentworth_by-election): Australian House of Representatives seat |
| 52 | Aston 2023 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2023_Aston_by-election): Australian House of Representatives seat |
| 54 | Dunkley 2024 | federal | [Wikipedia](https://en.wikipedia.org/wiki/2024_Dunkley_by-election): Australian House of Representatives seat |
| 57 | NSW By-Elections 2024 | state | [Wikipedia](https://en.wikipedia.org/wiki/List_of_New_South_Wales_state_by-elections): Epping, Hornsby and Pittwater Legislative Assembly by-elections |
| 60 | Secret Harbour 2026 | state | [Wikipedia](https://en.wikipedia.org/wiki/2026_Secret_Harbour_state_by-election): Western Australian Legislative Assembly district |
| 61 | Kiama 2026 | local government | No matching 2026 Wikipedia article found. [NSW Electoral Commission](https://elections.nsw.gov.au/bulletins/2026-kiama-municipal-council-by-election-election-notice-3) identifies a Kiama Municipal Council councillor vacancy; the [Wikipedia 2025 Kiama state by-election](https://en.wikipedia.org/wiki/2025_Kiama_state_by-election) is a different state-seat event. |
