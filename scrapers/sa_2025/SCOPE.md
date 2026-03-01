Under scrapers/sa_2025/ I want to write a minimal Python scrapers that loads https://www.ecsa.sa.gov.au/map and pulls the embedded `App.pollingPlaces` JSON blob from the source and outputs it as CSV.

Output to data/YYYYMMDD_HHMMSS polling_places.csv

Note: `App.prePollPlaces` should be ignored.

Aggregate stats of the number of entries for each unique type_code should be presented.

JSON to CSV field mappings are:

- location_name to name
- district_name to divisions
- suburb to suburb
- postcode to postcode
- address_detail1 to premises
- address_detail2 to address
- address_detail3 to entrance_desc
- lat to lat
- lng to lon

The address_detail fields should be cleaned by replacing "\/" with "/"

A wheelchair_access field should be created from disabled_access_id based on:

- If is "F" then "Full"
- If is "A" then "Assisted"
- If is "N" then "None"

If type_code is "EVC", filter it out.

If archived is not 0, throw an exception.

If any other value, throw an exception.

If availability is not "Sat 21 March, 8am to 6pm", throw an exception.