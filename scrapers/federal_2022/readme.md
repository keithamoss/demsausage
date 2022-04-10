# Data Source

[Commonwealth Electoral Act 1918 (CEA) notices – Expected election day polling places](https://www.aec.gov.au/about_aec/cea-notices/election-pp.htm)

# Config notes

- cleaning_regexes: For multi-division polling places, the AEC includes the division name in brackets after the polling place name (e.g. "Hurstville (Banks)"). This ensures we remove the division name.
- geocode: Handles filling in geocodes for places with missing coordinates (it doesn't geocode any places with coordinates)

## Changes from config vs 2019

None yet.

# Usage Instructions (Not applied yet)

We need to merge the official AEC data with an unofficial list of overseas polling booths.

1. Add a `booth_info` column as the far right most column.
2. Paste the contents of `./data/overseas_polling_places_2019.csv` (minus the header) at the bottom of the file.
3. Load the polling place data per normal whilst applying `config.json`.

# Data Quality Issues

## April 1st 2022 (loaded April 10th)

Source: `prdelms.gaz.statics.220401.09.00.01.csv`

### Data file formatting errors (AEC notified; fixed at ingest)

1. Berkeley Vale North (PPID=577): Had two extra columns included between 'EntrancesDesc' and 'Lat'. Fixed manually.
   `"","Entrance description Include details of the entrance/s expected be open during polling, details that will be used by candidates"`
2. Wahroonga East (PPID=144): Has unescaped double quotes in the 'EntranceDesc' column. Fixed manually.
   `Two gates "B", one is ramped`

### Wrong location (AEC notified; fixed at ingest)

1. Duncans Creek War Memorial Hall (PPID=1994): -31.302856, 151.149829 (was -31.459785 151.128003). Incorrectly duplicated the coordinates of Nundle Memorial Hall (PPID=1968).
2. Randwick South (PPID=2325): -33.921647, 151.239767 (was -33.92379032 151.2383445). Incorrectly duplicated the coordinates of Randwick Central (PPID=2317). The two polling places are the Randwick Girls' and Boys' High Schools, which appear to share the same parcel of land.
