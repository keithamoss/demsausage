import pandas as pd
import requests
from bs4 import BeautifulSoup

# https://www.google.com/maps/d/u/0/viewer?mid=11Kv83xcMWv-cU458qv75j_TH25wSi_o&femb=1&ll=-35.341899816742135%2C149.06975873980156&z=9

style_url_for_election_day_booths = "#icon-1899-F9A825-labelson"

kml_link = "https://www.google.com/maps/d/u/0/kml?mid=11Kv83xcMWv-cU458qv75j_TH25wSi_o&forcekml=1"
r = requests.get(kml_link)

kml_soup = BeautifulSoup(r.content, "lxml-xml")

polling_places = {}
for placemark in kml_soup.find_all("Placemark"):
    polling_place_type = placemark.find("styleUrl").text
    if polling_place_type != style_url_for_election_day_booths:
        print(f"Skipping {placemark.find('name').text}")
        continue

    d = {
        "state": "ACT",
        "ec_id": "",
        "wheelchair_access": "Unknown"
    }

    
    lng, lat, junk = placemark.find("Point").find("coordinates").text.strip().split(",")
    d["lat"] = lat
    d["lon"] = lng

    d["name"] = placemark.find("name").text.title()

    premises, address, name = placemark.find("description").text.strip().split("<br>")
    d["premises"] = premises
    d["address"] = f"{address}, {name.title()}"

    polling_places[len(polling_places.keys())] = d

df = pd.DataFrame.from_dict(polling_places, orient='index')

df.to_csv("data/act_2024.csv", index=False)
