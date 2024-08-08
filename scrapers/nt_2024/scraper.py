import csv
import datetime
import json

import requests

JSON_API_URL = 'https://ntec.nt.gov.au/maps/voting-centre.json/_nocache'
JSON_MANUAL_REVERSE_GEOCODING = "manual_reverse_geocoding.json"
OUTPUT_FILE = f'nt-{datetime.date.today().isoformat()}.csv'
ELECTION_DAY = "24-Aug-24"

def _map_wheelchair_acccess_and_description(data):
  if data == "Full wheelchair access":
    return {
      "summary": "Full",
      "description": ""
    }
  elif data.startswith("Assisted wheelchair access: "):
    return {
      "summary": "Assisted",
      "description": data.replace("Assisted wheelchair access: ", "")
    }
  
  raise Exception(f"Unhandled wheelchair access mode: {data}")

def _get_name_premises_and_address(location):
  with open(JSON_MANUAL_REVERSE_GEOCODING) as f:
    data = json.load(f)
    if location in data:
      return data[location]
    raise Exception(f"No manual reverse geocoding results found for '{location}'")

def _pollingPlace(data):
  nPA = _get_name_premises_and_address(pp["location"])
  wheelchair = _map_wheelchair_acccess_and_description(pp["wheelchair_accessible_notes"])

  return {
      "ec_id": "",
      "name": nPA["name"],
      "premises": nPA["premises"],
      "address": nPA["address"],
      "divisions": pp["division"],
      "lat": pp["latitude"],
      "lon": pp["longitude"],
      "state": "NT",
      "wheelchair_access": wheelchair["summary"],
      "wheelchair_access_description": wheelchair["description"]
    }

r = requests.get(JSON_API_URL)

pollingPlaces = []
skipped = 0

for pp in r.json():
  if ELECTION_DAY in pp["all_times"]:
    pollingPlaces.append(_pollingPlace(pp))
  else:
    skipped = skipped + 1

# print(pollingPlaces[0])
print(f"Skipped due to not open on polling day = {skipped}")
print(f"Found open on polling day = {len(pollingPlaces)}")

with open(f'data/{OUTPUT_FILE}', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, fieldnames=list(pollingPlaces[0].keys()))
    dict_writer.writeheader()
    dict_writer.writerows(pollingPlaces)