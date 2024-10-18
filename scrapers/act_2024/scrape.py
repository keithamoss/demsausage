import pandas as pd
import requests
from bs4 import BeautifulSoup

# https://www.google.com/maps/d/u/0/viewer?mid=11Kv83xcMWv-cU458qv75j_TH25wSi_o&femb=1&ll=-35.341899816742135%2C149.06975873980156&z=9

kml_link = "https://www.google.com/maps/d/u/0/kml?mid=11Kv83xcMWv-cU458qv75j_TH25wSi_o&forcekml=1"
r = requests.get(kml_link)

kml_soup = BeautifulSoup(r.content, "lxml-xml")

polling_places = {}
for placemark in kml_soup.find_all("Placemark"):
    d = {
        "state": "ACT",
        "ec_id": "",
        "wheelchair_access": "Unknown"
    }

    
    lng, lat, junk = placemark.find("Point").find("coordinates").text.strip().split(",")
    d["lat"] = lat
    d["lon"] = lng

    d["name"] = placemark.find("name").text.title()

    parts = placemark.find("description").text.strip().split("<br>")

    # Handle two of the pre-polls that don't actually have a premises name component in their location description
    if d["name"] == "Lanyon" or d["name"] == "Woden":
        d["address"] = parts[0]
    else:
        d["premises"] = parts[0]
        d["address"] = parts[1].title()

    polling_places[len(polling_places.keys())] = d

df = pd.DataFrame.from_dict(polling_places, orient='index')

df.to_csv("data/act_2024.csv", index=False)
