# Data sources

[Commonwealth Electoral Act 1918 (CEA) notices – Expected election day polling places](https://www.aec.gov.au/about_aec/cea-notices/election-pp.htm)
[Overseas In-person Voting and Postal Vote Collection Locations](https://www.aec.gov.au/referendums/vote/overseas-voting-locations.html)

## Overseas polling places

The AEC's list of overseas polling places contains the country, category, and address of each overseas polling booth.

We then manually geocode each to their coordinates and update `overseas_polling_places_2023.csv`.

# Config notes

- `cleaning_regexes`: For multi-division polling places, the AEC includes the division name in brackets after the polling place name (e.g. "Hurstville (Banks)"). This ensures we remove the division name.
- `geocode`: Handles filling in geocodes for places with missing coordinates (it doesn't geocode any places with coordinates)

## Changes from config vs 2022

None yet.

# Usage Instructions

Run `merge_overseas.py` each time we download new polling place data from the AEC.

This merges the official AEC data with a quasi-unofficial list of overseas polling booths that we maintain (adding coordinates et cetera) based on the AEC's official list.

Then run the load process with `config.json` as per normal.

# Data Quality Issues

## October 6th 2023 (loaded October 6th)

Source: `prdelms.gaz.statics.231006.09.00.02`

Everything went fine.

## September 21th 2023 (loaded September 21th)

Source: `prdelms.gaz.statics.230921.09.00.09`

### Locations that are now fixed

1. Randwick South (PPID=2325): -33.921647, 151.239767 (was -33.92379032 151.2383445).
2. Krambach Public School (PPID=1604): -32.04629732946641, 152.27194407394296 (was -32.04135 152.53698).

## September 20th 2023 (loaded September 20th)

Source: `prdelms.gaz.statics.230920.09.00.02`

### Wrong location (AEC notified; fixed at ingest)

1. Randwick South (PPID=2325): -33.921647, 151.239767 (was -33.92379032 151.2383445). Incorrectly duplicated the coordinates of Randwick Central (PPID=2317). The two polling places are the Randwick Girls' and Boys' High Schools, which appear to share the same parcel of land.
2. Krambach Public School (PPID=1604): -32.04629732946641, 152.27194407394296 (was -32.04135 152.53698). Incorrectly duplicated the coordinates of Hallidays Point Public School (PPID=32374).
