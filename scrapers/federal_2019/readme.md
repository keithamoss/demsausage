# Data Source

[Commonwealth Electoral Act 1918 (CEA) notices – Expected election day polling places](https://www.aec.gov.au/about_aec/cea-notices/election-pp.htm)

# Usage Instructions

We need to merge the official AEC data with an unofficial list of overseas polling booths.

1. Add a `booth_info` column as the far right most column.
2. Paste the contents of `./data/overseas_polling_places_2019.csv` (minus the header) at the bottom of the file.
3. Load the polling place data per normal whilst applying `config.json`.

# Data Quality Issues

The dates listed in this file reflect the date the data was last refreshed by the AEC, not the date we downloaded it loaded it onto the map.

## May XXXX 2019

### Wrong location (AEC notified; fixed at ingest)

1. Doubleview North (PPID=83305): -31.893911, 115.780173 (was -31.8984508 115.7776616). Incorrectly located at a nearby school.

## May 11th 2019

### Wrong location (AEC notified; fixed at ingest)

1. Millers Point (PPID=2756): -33.858773, 151.204282 (was -33.8589 151.208). Incorrectly located at a nearby pub.

## May 2nd 2019

### Wrong location (AEC notified; fixed at ingest)

1. Taylor (PPID=97559): -35.152135, 149.113586 (was -35.1695542 149.1055413). Incorrectly located in a nearby neighbourhood.

## April 19th 2019

### Wrong location (AEC notified; fixed at ingest)

1. Charleville North (PPID=6131): -26.395960, 146.259221 (was -26.40316, 146.24092). Incorrectly located at Charleville Town Hall.
2. Injune (PPID=6174): -25.84702, 148.56491 (was -25.84702, 158.56491). Incorrectly located in the Coral Sea.

See `config.json` for machine-readable fixes.

### Wrong address (AEC notified; polling places skipped)

1. Tansey (PPID=6625) has an address and premises that doesn't match the location and division provided. "Tansey Hall, 35 Tansey Hall Rd" is in Tansey (Postcode 4601). The location provided is in Tin Can Bay (Postcode 4580) in the division of "Wide Bay". The latitude/longitude provided is close to "Regis Care Queensland" - this may be the correct polling place?

## April 12th 2019

### Wrong location (AEC notified; fixed at ingest)

1. Charleville North (PPID=6131): -26.395960, 146.259221 (was -26.40316, 146.24092). Incorrectly located at Charleville Town Hall.
2. Mile End (PPID=7079): -34.923374, 138.570222 (was -34.91979, 138.53797). Incorrectly located at Lockleys North Primary School.
3. Birchgrove East (PPID=83735): -33.852539, 151.179686 (was -33.8536276, 151.1770286). Incorrectly located at Birchgrove Public School.
4. Burwood West (PPID=3919): -37.850043, 145.064442 (was -37.9084765, 145.076949). Incorrectly located close to Coatesville Uniting Church.
5. Cairns City (PPID=5934): -16.914821, 145.767187 (was 33.9501998, -83.3802341). Incorrectly located in Athens, Georgia, United States.

See `config.json` for machine-readable fixes.

### Wrong address (AEC notified; polling places skipped)

1. Tansey (PPID=6625) has an address and premises that doesn't match the location and division provided. "Tansey Hall, 35 Tansey Hall Rd" is in Tansey (Postcode 4601). The location provided is in Tin Can Bay (Postcode 4580) in the division of "Wide Bay". The latitude/longitude provided is close to "Regis Care Queensland" - this may be the correct polling place?

### Duplicate polling places (temporarily renamed by-hand)

1. [AEC FIXED] Bedfordale North (Burt) (PPID=70737) and Armadale East (PPID=7468) are now known as "Armadale East (Burt)" and "Armadale East (Canning)".

### Missing locations (polling places geocoded)

78 polling booths are missing a location. Automatic geocoding managed to find a good location for 77 of these. The following were skipped:

1. Tansey (PPID=6625) (See `Wrong address` section above)

## April 1st 2019

### Wrong location (AEC notified; fixed by-hand)

1. Charleville High School (PPID=6131): -26.395960, 146.259221 (was -26.40316, 146.24092)
2. Mile End (PPID=7079): -34.923374, 138.570222 (was -34.91979, 138.53797)

### Duplicate polling places (temporarily renamed by-hand)

1. Bedfordale North (Burt) (PPID=70737) and Armadale East (PPID=7468) are the same premises and location - Pioneer Village School. We've temporarily renamed Armadale East to "Bedfordale North (Canning)" so it gets deduplicated by the data loader.

### Missing locations (AEC notified; polling places skipped)

1. Oakleigh (Higgins) (PPID=34017) and Oakleigh (Hotham) (PPID=3906)
2. Wollert South (PPID=83636)
3. Warwick (PPID=7588)
4. Sorrento Beach (PPID=32446)
5. Beverley (PPID=7982)
6. Gingin (PPID=7934)
