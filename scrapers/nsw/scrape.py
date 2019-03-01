import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

import json
from urllib.parse import parse_qs
import pytz
import time
import csv
from copy import deepcopy

import requests
from haralyzer import HarParser, HarPage
from bs4 import BeautifulSoup

from demsausage.app.models import PollingPlaces
from demsausage.app.serializers import PollingPlacesManagementSerializer
from django.contrib.gis.geos import Point
from demsausage.app.enums import PollingPlaceStatus
from demsausage.util import add_datetime_to_filename


class scraper():
    def __init__(self):
        self.base_dir = "/scrapers/nsw/"
        self.index_url = "http://map.elections.nsw.gov.au/Event.aspx?ID=SG1901&mode=PP"
        self.har_path = os.path.join(self.base_dir, "map.elections.nsw.gov.au.har")
        self.placemark_api = "http://map.elections.nsw.gov.au/PlacemarkApi.ashx?mode=PP&ID={ID}"
        self.cookie_jar = self.__get_cookies()

    def __get_cookies(self):
        # REPLACE THESE
        jar = requests.cookies.RequestsCookieJar()
        jar.set("incap_ses_435_143128", "bpUaFr3YlxS0xTNLem8JBvY8aVwAAAAAo95xhclEwlC22kYeL4t7WQ==", domain=".elections.nsw.gov.au", path="/")
        jar.set("visid_incap_143128", "THkSwroSTxuDEtdyfG3wpzYnaVwAAAAAQUIPAAAAAABCp0HkxzhWw7mIzQ9AXsKZ", domain=".elections.nsw.gov.au", path="/")
        return jar

    def __get_page_content_from_har(self):
        with open(self.har_path, "r") as f:
            har_parser = HarParser(json.loads(f.read()))

        for page in har_parser.pages[:1]:
            for file in page.html_files:
                return file["response"]["content"]["text"]
        raise Exception("Unable to access HAR file.")

    def __get_ids_from_index(self):
        ids = []
        res = BeautifulSoup(self.__get_page_content_from_har(), "html5lib")
        for a in res.select("a[href^=Map\.aspx]"):
            ids.append(parse_qs(a["href"])["ID"][0])
        return ids

    def __get_polling_place_json(self, id):
        print(id)
        r = requests.get(self.placemark_api.format(ID=id), cookies=self.cookie_jar)
        json = r.json()

        if r.status_code == 200 and json is not None:
            return json
        raise Exception("Error getting JSON from Placemark API")

    def scrape_polling_places_json(self):
        polling_places = []
        for id in scraper.__get_ids_from_index():
            polling_places += self.__get_polling_place_json(id)

            # Be nice
            time.sleep(3)

        json_filepath = os.path.join(self.base_dir, add_datetime_to_filename("nsw_polling_places.json"))
        with open(json_filepath, "w") as f:
            f.write(json.dumps(polling_places))

        print("Wrote {} polling places to {}".format(len(polling_places), json_filepath))
        return json_filepath

    def __json_to_model(self, polling_place):
        def __get_wheelchair_access(polling_place):
            if polling_place["Access"] is True:
                return "Wheelchair accessible"
            if polling_place["AssistedAccess"] is True:
                return "Wheelchair accessible with assistance: {}".format("; ".join(polling_place["FeatureValues"]))
            return ""

        def __get_address(polling_place):
            return "{address}, {locality} {postcode}".format(address=polling_place["Address"], locality=polling_place["Locality"], postcode=polling_place["Postcode"])

        return {
            "election": 1,
            "geom": Point(float(polling_place["Lon"]), float(polling_place["Lat"]), srid=4326),
            "name": polling_place["Name"],
            "facility_type": None,
            "premises": polling_place["Premises"],
            "address": __get_address(polling_place),
            "divisions": [polling_place["LgaName"]],
            "state": "NSW",
            "wheelchair_access": __get_wheelchair_access(polling_place),
            "opening_hours": polling_place["OpeningHours"],
            "status": PollingPlaceStatus.DRAFT,
        }

    def __validate_json(self, polling_place):
        # A few checks to validate the JSON to handle fields that look like they'll be used in the future / closer to election day.

        if polling_place["UppnLabel"] != "USVN":
            raise Exception("PP {}: UppnLabel is not USVN".format(polling_place["Name"]))

        if polling_place["Type"] != 1:
            raise Exception("PP {}: Type is not 1".format(polling_place["Name"]))

        if polling_place["Access"] is True and polling_place["AssistedAccess"] is True:
            raise Exception("PP {}: Both Access and AssistedAccess are true".format(polling_place["Name"]))

        if polling_place["AssistedAccess"] is True and len(polling_place["FeatureValues"]) == 0:
            raise Exception("PP {}: Requires assisted access, but no details provided".format(polling_place["Name"]))

        if polling_place["NextAvailable"] is not None:
            raise Exception("PP {}: NextAvailable is not null".format(polling_place["Name"]))

        if polling_place["Ppp"] != 0:
            raise Exception("PP {}: Ppp is not 0".format(polling_place["Name"]))

        if polling_place["RoTelephone"] is not None:
            raise Exception("PP {}: RoTelephone is not null".format(polling_place["Name"]))

        if polling_place["IsVenueTypePPP"] is not False:
            raise Exception("PP {}: IsVenueTypePPP is not false".format(polling_place["Name"]))

        if polling_place["IsVenueTypeMW"] is not False:
            raise Exception("PP {}: IsVenueTypeMW is not false".format(polling_place["Name"]))

        return True

    def convert_to_demsausage_schema(self, filename):
        def __model_to_json(validated_data):
            json = deepcopy(validated_data)

            del json["facility_type"]
            del json["status"]
            del json["election"]

            json["divisions"] = ",".join(json["divisions"])

            json["lon"] = json["geom"].x
            json["lat"] = json["geom"].y
            del json["geom"]

            return json

        polling_place_models = []

        with open(os.path.join(self.base_dir, filename), "r") as f:
            polling_places = json.load(f)

            for polling_place in polling_places:
                self.__validate_json(polling_place)

            for polling_place in polling_places:
                serialiser = PollingPlacesManagementSerializer(data=self.__json_to_model(polling_place))
                if serialiser.is_valid() is True:
                    polling_place_models.append(__model_to_json(serialiser.validated_data))
                else:
                    print(polling_place)
                    raise Exception(serialiser.errors)

        return polling_place_models

    def save_to_csv(self):
        def __get_header(polling_place_models):
            return list(next(iter(polling_place_models)).keys())

        polling_place_models = self.convert_to_demsausage_schema(json_filepath)

        csv_filepath = os.path.join(self.base_dir, add_datetime_to_filename("nsw_polling_places.csv"))
        with open(csv_filepath, "w") as f:
            writer = csv.writer(f)

            writer.writerow(__get_header(polling_place_models))

            for polling_place in polling_place_models:
                writer.writerow(list(polling_place.values()))

        print("Wrote {} polling_places to {}".format(len(polling_place_models), csv_filepath))
        return csv_filepath


scraper = scraper()
json_filepath = scraper.scrape_polling_places_json()
# json_filepath = os.path.join(scraper.base_dir, "nsw_polling_places_2019-02-17T175021.json")
scraper.save_to_csv()
print("Fin.")
