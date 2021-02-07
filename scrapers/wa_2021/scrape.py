import re

import pandas as pd
import requests


def get_disabled_access_string(DisabledAccessType):
    if DisabledAccessType == "1":
        return "Wheelchair Access"
    elif DisabledAccessType == "0":
        return ""
    raise Exception(f"Unknown 'DisabledAccessType' of {DisabledAccessType} found.")


electorates_api_url = "https://api.elections.wa.gov.au/sgElections/sg2021/list"
polling_places_api_url_base = "https://api.elections.wa.gov.au/sgElections/sg2021/"

polling_places = {}

electorate_response = requests.get(electorates_api_url)
for electorate in electorate_response.json()["electorates"]:
    polling_places_response = requests.get(f"{polling_places_api_url_base}/{electorate['ElectorateCode']}/pollingPlaces")

    for polling_place in polling_places_response.json()["districtOrdinaryPollingPlaces"]:
        if polling_place["INDICATOR_DA"] not in ["0", "1"]:
            raise Exception("Unnknown 'INDICATOR_DA' found.")

        # if polling_place["VENUE_NAME"] != polling_place["ASSIGNED_NAME"]:
        #     raise Exception(f"{polling_place['VENUE_NAME']} != {polling_place['ASSIGNED_NAME']}")

        if polling_place["IS_REAL"] == "0":
            raise Exception(f"IS_REAL is 0")

        polling_places[polling_place["VENUE_ID"]] = {
            # Can't use their UUID ec_id's because we made that field an int 🤦‍♂️
            # "ec_id": polling_place["VENUE_ID"],
            "ec_id": "",
            "name": polling_place["VENUE_NAME"],
            "premises": None,
            "address": re.sub(r"\r\n", ", ", polling_place["FULL_FORMAT_PHYSICAL_ADDRESS"], flags=re.MULTILINE),
            "lat": polling_place["LATITUDE"],
            "lon": polling_place["LONGITUDE"],
            "state": "WA",
            "wheelchair_access": get_disabled_access_string(polling_place["INDICATOR_DA"])
        }

        # break
    # break

# print(polling_places)

df = pd.DataFrame.from_dict(polling_places, orient='index')
df.to_csv("data/wa_2021.csv", index=False)
