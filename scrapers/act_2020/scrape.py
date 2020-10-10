import pandas as pd
import requests
from bs4 import BeautifulSoup

# https://www.google.com/maps/d/u/0/viewer?mid=1HYZeweBbBDjphj2Iltdfhki5E8h5_iGS&ll=-35.33072930453164%2C149.12141745000002&z=10

kml_link = "https://www.google.com/maps/d/u/0/kml?mid=1HYZeweBbBDjphj2Iltdfhki5E8h5_iGS&forcekml=1"
r = requests.get(kml_link)

kml_soup = BeautifulSoup(r.content, "lxml-xml")

polling_places = {}
for placemark in kml_soup.find_all("Placemark"):
    polling_place_type = placemark.find("ExtendedData").find("Data", attrs={"name": "Type"}).find("value").text
    if polling_place_type == "Early Voting Centre":
        continue

    d = {}
    for item in placemark.find("ExtendedData").find_all("Data"):
        if item["name"] == "Coordinates":
            coords = item.find("value").text.replace("Ing", "lng")
            lat, lng = coords.replace("lat: ", "").replace("lng: ", "").split(", ")
            d["lat"] = lat
            d["lng"] = lng

        elif item["name"] == "Name":
            name = item.find("value").text
            # Brandon is misnamed as Ainslie (08/10/2020)
            d["name"] = name if name != "Brandon" else placemark.find("name").text

        else:
            d[item["name"].lower()] = item.find("value").text

    polling_places[len(polling_places.keys())] = d

df = pd.DataFrame.from_dict(polling_places, orient='index')
del df["type"]

df.to_csv("data/act_2020.csv", index=False)
