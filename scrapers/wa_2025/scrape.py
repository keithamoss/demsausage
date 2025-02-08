import json
import os.path
import re
from datetime import datetime

import pandas as pd
import requests


def get_disabled_access_string(DisabledAccessType):
    if DisabledAccessType == 1:
        return "Full"
    elif DisabledAccessType == 0:
        return "None"
    raise Exception(f"Unknown 'DisabledAccessType' of {DisabledAccessType} found.")


def transform_polling_place(polling_place):
    return {
        # Can't use their UUID ec_id's because we made that field an int 🤦‍♂️
        # "ec_id": polling_place["VENUE_ID"],
        "ec_id": "",
        "name": polling_place["VENUE_NAME"],
        "premises": None,
        "address": re.sub(
            r"\r\n",
            ", ",
            polling_place["FULL_FORMAT_PHYSICAL_ADDRESS"],
            flags=re.MULTILINE,
        ),
        "lat": polling_place["LATITUDE"],
        "lon": polling_place["LONGITUDE"],
        "divisions": polling_place["ELECTORATE_NAME"],
        "state": "WA",
        "wheelchair_access": get_disabled_access_string(polling_place["INDICATOR_DA"]),
    }


expected_dupes = [
    "Cannington Early Polling Place",
    "Carine Early Polling Place",
    "Hillarys Early Polling Place",
    "Joondalup Early Polling Place",
    "Kingsley Early Polling Place",
    "Victoria Park Early Polling Place",
]

expected_dupes_pairs = {
    "-32.024396,115.941719": {
        "merged_name": "Cannington and Victoria Park Districts - Election Day and Early Polling Place",
        "divisions": "Cannington, Victoria Park",
        "names": [
            "Cannington Early Polling Place",
            "Victoria Park Early Polling Place",
        ],
    },
    "-31.842623,115.808451": {
        "merged_name": "Kingsley and Carine Districts - Election Day and Early Polling Place",
        "divisions": "Kingsley, Carine",
        "names": [
            "Kingsley Early Polling Place",
            "Carine Early Polling Place",
        ],
    },
    "-31.7484606,115.764524": {
        "merged_name": "Joondalup and Hillarys Districts - Election Day and Early Polling Place",
        "divisions": "Joondalup, Hillarys",
        "names": [
            "Joondalup Early Polling Place",
            "Hillarys Early Polling Place",
        ],
    },
}

CACHE = False

if (
    CACHE is True
    and os.path.isfile("cache_polling_places.json")
    and os.path.isfile("cache_polling_places_dupes.json")
):
    with open("cache_polling_places.json", "r") as f:
        polling_places = json.load(f)

    with open("cache_polling_places_dupes.json", "r") as f:
        polling_places_dupes = json.load(f)
else:
    electorates_api_url = "https://eis.waec.wa.gov.au/api/sgElections/sg2025/list"
    polling_places_api_url_base = "https://eis.waec.wa.gov.au/api/sgElections/sg2025/"

    polling_places = {}
    polling_places_dupes = []

    electorate_response = requests.get(electorates_api_url)
    for electorate in electorate_response.json()["electorates"]:
        polling_places_response = requests.get(
            f"{polling_places_api_url_base}/{electorate['ElectorateCode']}/pollingPlaces"
        )

        for polling_place in polling_places_response.json()[
            "districtOrdinaryPollingPlaces"
        ]:
            if polling_place["INDICATOR_DA"] not in [0, 1]:
                raise Exception(
                    f"Unknown 'INDICATOR_DA' found: {polling_place["INDICATOR_DA"]}"
                )

            # if polling_place["VENUE_NAME"] != polling_place["ASSIGNED_NAME"]:
            #     raise Exception(f"{polling_place['VENUE_NAME']} != {polling_place['ASSIGNED_NAME']}")

            if polling_place["IS_REAL"] not in [1]:
                raise Exception(f"Unknown 'IS_REAL' found: {polling_place["IS_REAL"]}")

            # Handle some polling places in the initial releases still being TBC
            if polling_place["LATITUDE"] == None or polling_place["LONGITUDE"] == None:
                print(f"Skipping '{polling_place["VENUE_NAME"]}' due to blank lat/lon")
                continue

            # Handle early polling places with duplicate addresses and lat/lons separately
            if polling_place["VENUE_NAME"] in expected_dupes:
                polling_places_dupes.append(transform_polling_place(polling_place))
                continue

            # Handle adjusting the names on the generic 'Central' Election Day and Early polling places for each district
            if " Early Polling Place" in polling_place["VENUE_NAME"]:
                polling_place["VENUE_NAME"] = polling_place["VENUE_NAME"].replace(
                    " Early Polling Place",
                    " District - Election Day and Early Polling Place",
                )

            polling_places[polling_place["VENUE_ID"]] = transform_polling_place(
                polling_place
            )

    with open("cache_polling_places.json", "w") as f:
        json.dump(polling_places, f)

    with open("cache_polling_places_dupes.json", "w") as f:
        json.dump(polling_places_dupes, f)


# Handle duplicate 'Central' entries for a few districts
polling_places_dupe_pairs = {}
for polling_place in polling_places_dupes:
    latlon = f"{polling_place["lat"]},{polling_place["lon"]}"
    if latlon not in polling_places_dupe_pairs:
        polling_places_dupe_pairs[latlon] = []

    polling_places_dupe_pairs[latlon].append(polling_place)

for dupe_polling_places in polling_places_dupe_pairs.values():
    if len(dupe_polling_places) > 1:
        latlon = f"{dupe_polling_places[0]["lat"]},{dupe_polling_places[0]["lon"]}"

        if latlon not in expected_dupes_pairs:
            raise Exception(
                f"Unexpected set of duplicate polling places found: {", ".join([pp["name"] for pp in dupe_polling_places])}"
            )

        for polling_place in dupe_polling_places:
            if polling_place["name"] not in expected_dupes_pairs[latlon]["names"]:
                raise Exception(
                    f"Unexpected polling place found in a predefined duplicate pair: {polling_place["name"]} found for {latlon}"
                )

        merged_polling_place = dupe_polling_places[0]
        merged_polling_place["name"] = expected_dupes_pairs[latlon]["merged_name"]
        merged_polling_place["divisions"] = expected_dupes_pairs[latlon]["divisions"]

        polling_places[latlon] = merged_polling_place

df = pd.DataFrame.from_dict(polling_places, orient="index")
df.to_csv(f"data/wa_2025 ({datetime.today().strftime("%Y%m%d")}).csv", index=False)
