# Data sources

[Commonwealth Electoral Act 1918 (CEA) notices – Expected election day polling places](https://www.aec.gov.au/about_aec/cea-notices/election-pp.htm)
[Voting from overseas](https://www.aec.gov.au/election/overseas.htm)

## Overseas polling places

The AEC's list of overseas polling places contains the country, category, and address of each overseas polling booth.

We then manually geocode each to their coordinates and update `overseas_polling_places_2025.csv`.

# Config notes

- `cleaning_regexes`: For multi-division polling places, the AEC includes the division name in brackets after the polling place name (e.g. "Hurstville (Banks)"). This ensures we remove the division name.
- `geocode`: Handles filling in geocodes for places with missing coordinates (it doesn't geocode any places with coordinates)

## Changes from config vs 2022

- Empty `wheelchair_access` values now get set to `"Unknown"` to reflect our new strict rules around how we represent wheelchair accessibility.

# Usage Instructions

Run `merge_overseas.py` each time we download new polling place data from the AEC. This merges the official AEC data with a quasi-unofficial list of overseas polling booths that we maintain (adding coordinates et cetera) based on the AEC's official list.

Then run the load process with `config.json` as per normal.

# Data Quality Issues

## 5 April 2025 (loaded same day)

Source: `prdelms.gaz.statics.250405.09.00.02`

Note: In the interests of time, overseas polling places were not included in this initial load.

No issues identified.