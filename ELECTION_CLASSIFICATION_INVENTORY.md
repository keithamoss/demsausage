# Public election classification inventory

Source: production public elections API, retrieved 14 November 2026. This is
an inventory for review, not an approved classification. The public API excludes
hidden elections, so it is not a complete inventory of the production database.

## Comparison decisions

- Compare the WA Senate Election 2014 with WA general elections in both
  directions, despite its current `is_state` and `is_federal` flags being false.
- Compare the Referendum 2023 with federal general elections in both directions.
- Local-government elections and by-elections should neither have comparisons
  of their own nor appear in other elections' comparison bars or benchmark pools.
- Election level and election type are separate considerations. The Kiama
  by-election is a local-government by-election despite its current `is_state`
  flag. The precise model and complete classification remain to be agreed.

## Proposed general elections

| ID | Date | Election |
|---:|---|---|
| 1 | 2013-09-07 | Federal Election 2013 |
| 2 | 2014-03-15 | Tasmanian Election 2014 |
| 3 | 2014-03-15 | South Australian Election 2014 |
| 5 | 2014-11-29 | Victorian Election 2014 |
| 6 | 2015-01-31 | Queensland Election 2015 |
| 7 | 2015-03-28 | New South Wales Election 2015 |
| 9 | 2016-07-02 | Federal Election 2016 |
| 11 | 2016-08-27 | Northern Territory Election 2016 |
| 10 | 2016-10-15 | ACT Election 2016 |
| 12 | 2017-03-11 | Western Australian Election 2017 |
| 13 | 2017-11-25 | Queensland Election 2017 |
| 15 | 2018-03-03 | Tasmanian Election 2018 |
| 16 | 2018-03-17 | South Australian Election 2018 |
| 25 | 2018-11-24 | Victorian Election 2018 |
| 26 | 2019-03-23 | New South Wales Election 2019 |
| 27 | 2019-05-18 | Federal Election 2019 |
| 29 | 2020-08-22 | Northern Territory Election 2020 |
| 30 | 2020-10-17 | ACT Election 2020 |
| 31 | 2020-10-31 | Queensland Election 2020 |
| 32 | 2021-03-13 | Western Australian Election 2021 |
| 28 | 2021-05-01 | Tasmanian Election 2021 |
| 33 | 2022-03-19 | South Australian Election 2022 |
| 37 | 2022-05-21 | Federal Election 2022 |
| 34 | 2022-11-26 | Victorian Election 2022 |
| 35 | 2023-03-25 | New South Wales Election 2023 |
| 46 | 2024-03-23 | Tasmanian Election 2024 |
| 38 | 2024-08-25 | Northern Territory Election 2024 |
| 40 | 2024-10-19 | ACT Election 2024 |
| 42 | 2024-10-26 | Queensland Election 2024 |
| 44 | 2025-03-08 | Western Australian Election 2025 |
| 58 | 2025-05-03 | Federal Election 2025 |
| 59 | 2025-07-19 | Tasmanian Election 2025 |
| 47 | 2026-03-21 | South Australian Election 2026 |
| 49 | 2026-11-28 | Victorian Election 2026 |

## Proposed by-elections

| ID | Date | Election |
|---:|---|---|
| 8 | 2015-09-19 | Canning By-election 2015 |
| 17 | 2018-03-17 | Batman By-election 2018 |
| 18 | 2018-03-17 | Cottesloe By-election 2018 |
| 19 | 2018-07-28 | Perth By-election 2018 |
| 20 | 2018-07-28 | Fremantle By-election 2018 |
| 21 | 2018-07-28 | Braddon By-election 2018 |
| 22 | 2018-07-28 | Mayo By-election 2018 |
| 23 | 2018-07-28 | Longman By-election 2018 |
| 24 | 2018-10-20 | Wentworth By-election 2018 |
| 52 | 2023-04-01 | Aston By-election 2023 |
| 54 | 2024-03-02 | Dunkley By-election 2024 |
| 57 | 2024-10-19 | NSW By-Elections 2024 |
| 61 | 2026-08-22 | Kiama By-election 2026 |
| 60 | 2026-08-29 | Secret Harbour By-election 2026 |

## Other events needing classification

These events require more specific classifications than general election or
by-election. Their comparison behaviour is recorded above.

| ID | Date | Election |
|---:|---|---|
| 4 | 2014-04-05 | WA Senate Election 2014 |
| 36 | 2021-12-04 | NSW Local Govt Elections 2021 |
| 53 | 2023-10-14 | Referendum 2023 |
| 55 | 2024-03-16 | QLD Local Govt Elections 2024 |
| 56 | 2024-09-14 | NSW Local Government Elections 2024 |
