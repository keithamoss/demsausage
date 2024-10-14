import datetime
import pandas as pd
import requests


def get_disabled_access_string(DisabledAccessType):
    if DisabledAccessType == 1:
        return "Full"
    elif DisabledAccessType == 2:
        return "None"
    elif DisabledAccessType == 4:
        return "Assisted"
    raise Exception("Unnknown 'DisabledAccessType' found.")

# Primary link:
# https://fmpb.elections.qld.gov.au/?EventID=632&EventType=1
# Use for QA:
# https://event.elections.qld.gov.au/Events/EventData?EventID=632&EventType=1

api_url = "https://fmpb-data.elections.qld.gov.au/file-upload/json/SG2024_venues.json"

r = requests.get(api_url)

polling_places = []
for item in r.json()["venues"]:
    if item["VenueType"] != "Polling Booth":
        continue

    # Note: The data also contains "IsAbolished", but all of its values are 1
    if item["IsCancelled"] == True:
        continue

    if item["IsAdjourned"] == True:
        continue

    # "None" captures "Surfers Paradise (The Cosmopolitan)" which mysteriously has no OperatingDates, but does appear in the export from QEC and on the website as an election day booth
    if item["OperatingDates"] != "Saturday, 26/10/2024" and item["OperatingDates"] != None:
        continue

    # Mobile Teams 1 - 3 for the electorate of Cook all have the same coordinates at the time of writing, so we'll manually deduplicate here (ingest can't handle it) by removing them here
    if item["VenueName"] in ["Mobile Team 1", "Mobile Team 2", "Mobile Team 3"] and item["Latitude"] != "-15.9452239" and item["Longitude"] != "145.3186989":
        raise Exception("It looks like Mobile Teams 1 - 3 have different locations now, so we'll need to revise our logic for manually deduplicating mobile teams")
    
    if item["VenueName"] in ["Mobile Team 2", "Mobile Team 3"]:
        continue

    polling_places.append({
        "ec_id": "",
        "name": item["VenueName"],
        "premises": item["BuildingName"],
        "address": item["BuildingAddress"],
        "lat": item["Latitude"],
        "lon": item["Longitude"],
        "state": "QLD",
        "wheelchair_access": get_disabled_access_string(item["DisabledAccessType"]),
        "entrance_desc": item["AccessPoint"],
        "opening_hours": item["OperatingTimes"],
        # Divsions help us collapse duplicate entries down to one booth (during ingest) e.g. the 93 duplicates for "Brisbane City Hall", and the array of booths that services 2 divisions
        "divisions": item["ElectorateName"]
    })

df = pd.DataFrame(polling_places)
df.to_csv(f"data/qld_2024-{datetime.date.today().isoformat()}.csv", index=False)
