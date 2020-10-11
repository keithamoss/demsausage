import pandas as pd
import requests


def get_disabled_access_string(DisabledAccessType):
    if DisabledAccessType == 1:
        return "Full Access"
    elif DisabledAccessType == 2:
        return "No Access"
    elif DisabledAccessType == 4:
        return "Assisted Access"
    raise Exception("Unnknown 'DisabledAccessType' found.")


api_url = "https://results.elections.qld.gov.au/API/GetPoint"
payload = {
    "EventID": "597",
    "EventType": "1",
    "ContestType": "0",
    "ContestID": "0",
    "isajax": "1"
}

r = requests.post(api_url, data=payload)

EARLY_VOTING_OR_RETURNING_OFFICER_VENUE_TYPEID = 8192
polling_places = {}
for item in r.json()["features"]:
    props = item["properties"]

    if props["UserFor"] == EARLY_VOTING_OR_RETURNING_OFFICER_VENUE_TYPEID:
        continue
    elif props["UserFor"] != 4096:
        raise Exception("Unknown 'UserFor' found")

    if props["DisabledAccessType"] not in [1, 2, 4]:
        raise Exception("Unnknown 'DisabledAccessType' found.")

    polling_place = {
        "ec_id": "",
        "name": props["VenueName"],
        "premises": props["BuildingName"],
        "address": props["BuildingAddress"],
        "lat": item["geometry"]["coordinates"][1],
        "lon": item["geometry"]["coordinates"][0],
        "state": "QLD",
        "wheelchair_access": get_disabled_access_string(props["DisabledAccessType"])
    }

    polling_places[len(polling_places.keys())] = polling_place


df = pd.DataFrame.from_dict(polling_places, orient='index')
df.to_csv("data/qld_2020.csv", index=False)
