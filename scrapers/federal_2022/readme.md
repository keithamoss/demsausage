# Data sources

[Commonwealth Electoral Act 1918 (CEA) notices – Expected election day polling places](https://www.aec.gov.au/about_aec/cea-notices/election-pp.htm)
[Voting from overseas](https://www.aec.gov.au/election/overseas.htm)

## Overseas polling places

The AEC's list of overseas polling places contains the country, category, and address of each overseas polling booth.

We then manually geocode each to their coordinates and update `overseas_polling_places_2022.csv`.

# Config notes

- `cleaning_regexes`: For multi-division polling places, the AEC includes the division name in brackets after the polling place name (e.g. "Hurstville (Banks)"). This ensures we remove the division name.
- `geocode`: Handles filling in geocodes for places with missing coordinates (it doesn't geocode any places with coordinates)

## Changes from config vs 2019

None yet.

# Usage Instructions

Run `merge_overseas.py` each time we download new polling place data from the AEC. This merges the official AEC data with a quasi-unofficial list of overseas polling booths that we maintain (adding coordinates et cetera) based on the AEC's official list.

Then run the load process with `config.json` as per normal.

# Data Quality Issues

## May 19th 2022 (loaded May 19th)

Source: `prdelms.gaz.statics.220519.09.00.01.csv`
Source: Overseas polling places retrieved May 19th - No change (number with in-person voting = 19)

### Data file formatting errors (AEC notified; fixed at ingest)

1. Darlinghurst South (PPID=83845): Has unescaped double quotes in the 'EntranceDesc' column. Fixed manually.
   `"71-73 Stanley Street. Where the Noodle Shop has the sign "71", it's the doors to the left of there."`

### Wrong location (AEC notified; fixed at ingest)

Note: Some of these look like additions, but others had the correct location in earlier versions of the dataset. For example, the Seven Hills, Seven Hills Heights, and Marayong West booths all had (seemingly) good location data in the `prdelms.gaz.statics.220515.13.43.51.csv` file, but now they've regressed to duplicating these other booths.

1. Surry Hills (PPID=2887): -33.88694957623772, 151.2124001071115 (had no coordinates).
2. Craigmore North (PPID=46435): -34.68968738737803, 138.7141293913578 (was -34.68888655 138.7132912). Stall submitter advised that only the back gate, where the booth is, will be open on polling day.
3. Blaxland (PPID=1475): -33.755306457346464, 150.6097771238578 (was -33.593131 150.916346). Incorrectly duplicated the coordinates of Maraylya (PPID=1787).
4. Pendle Hill Central (Greenway) (PPID=11978): -33.806824753560676, 150.95353600487007 (was -33.757893 150.943083). Incorrectly duplicated the coordinates of Kings Langley North (PPID=1032).
5. Pendle Hill Central (Parramatta) (PPID=81621): -33.806824753560676, 150.95353600487007 (was -33.757893 150.943083). Incorrectly duplicated the coordinates of Kings Langley North (PPID=1032).
6. Seven Hills (PPID=1051): -33.769365588737415, 150.93716583271913 (was -33.757893 150.943083). Incorrectly duplicated the coordinates of Kings Langley North (PPID=1032).
7. Seven Hills Heights (PPID=1042): -33.77701786927137, 150.9247200383731 (was -33.757893 150.943083). Incorrectly duplicated the coordinates of Kings Langley North (PPID=1032).
8. Marayong West (PPID=1030): -33.74747662545731, 150.89069333206263 (was -33.785393 150.915389). Incorrectly duplicated the coordinates of Blacktown (PPID=11947).
9. Mount Druitt (PPID=402): -33.7673706076731, 150.82192702960785 (was -33.785393 150.915389). Incorrectly duplicated the coordinates of Blacktown (PPID=11947).
10. Rooty Hill West (PPID=83589): -33.77153067607477, 150.83803072773907 (was -33.785393 150.915389). Incorrectly duplicated the coordinates of Blacktown (PPID=11947).
11. Blaxland East (PPID=1476): -33.7465560892024, 150.62407404685226 (was -33.638879 150.285664). Incorrectly duplicated the coordinates of Blackheath (PPID=1749).

## May 15th 2022 (loaded May 15th)

Source: `prdelms.gaz.statics.220515.13.43.51.csv`
Source: Overseas polling places retrieved May 15th - No change (number with in-person voting = 19)

None identified.

## May 7th 2022 (loaded May 8th)

Source: `prdelms.gaz.statics.220507.09.00.01.csv`
Source: Overseas polling places retrieved May 7th - No change (number with in-person voting = 19)

None identified.

- AEC has fixed Altona North, so removed our fix (PPID=3678)
- AEC has fixed Muswellbrook, so removed our fix (PPID=1131)

## May 1st 2022 (loaded May 2nd)

Source: `prdelms.gaz.statics.220501.09.00.02.csv`
Source: Overseas polling places retrieved May 1st - No change (number with in-person voting = 19)

### Data file formatting errors (AEC notified; fixed at ingest)

1. Muswellbrook (PPID=1131): Had one extra empty column included between 'AdvBoothLocation' and 'EntrancesDesc'. Fixed manually.
   `"Hall",""," double door"`

### Wrong location (AEC notified; fixed at ingest)

1. Altona North (PPID=3678): -37.83629165982374, 144.84627682788758 (was -37.87558 144.79174). Incorrectly duplicated the coordinates of Altona Meadows East (PPID=83734).

## April 23rd 2022 (loaded April 23rd)

Source: `prdelms.gaz.statics.220423.09.00.02.csv`
Source: Overseas polling places retrieved April 23rd (number with in-person voting = 19)

None identified.

- Overseas polling places loaded for the first time
- Data file formatting errors are resolved now
- AEC has fixed Wahroonga East, so removed our fix (PPID=144)

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
