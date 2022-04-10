import os
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from django.db import transaction
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point

from demsausage.app.models import PollingPlaces
from demsausage.app.sausage.polling_places import get_active_polling_place_queryset

queryset = get_active_polling_place_queryset().filter(election_id=27)

with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "fed2019_updated_locations_linked.json")) as f:
    fixed_booths = json.load(f)
    for_fix_data_issues = []

    for fixed_booth in fixed_booths:
        if "distance_shift_m" in fixed_booth and fixed_booth["distance_shift_m"] > 1000:
            print("{} (PPID={})".format(fixed_booth["name"], fixed_booth["ec_id"]))
            print("{}, {}".format(fixed_booth["premises"], fixed_booth["address"]))
            # print("AEC Location: {}, {}".format(fixed_booth["lat_new"], fixed_booth["lon_new"]))
            # print("New Location: {}, {}".format(fixed_booth["lat_new"], fixed_booth["lon_new"]))
            print("{}km shift".format(round(fixed_booth["distance_shift_m"] / 1000, 2)))
            print()
            for_fix_data_issues.append(fixed_booth)

    with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "fed2019_updated_locations_linked_only_with_distance_shift_huge_shifts.json"), "w") as nf:
        nf.write(json.dumps(for_fix_data_issues))


# with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "fed2019_updated_locations_linked.json")) as f:
#     fixed_booths = json.load(f)
#     for_fix_data_issues = []

#     for fixed_booth in fixed_booths:
#         # NB: Norfolk Island was transferred to NSW 01/06/2016, but the AEC still has it under the ACT. Deal with this during ingest.
#         state = fixed_booth["state"] if fixed_booth["name"] != "Norfolk Island" else "ACT"

#         new_geom = Point(float(fixed_booth["lon_new"]), float(fixed_booth["lat_new"]), srid=4326)
#         current_booth = queryset.filter(name=fixed_booth["name"]).filter(state=state).annotate(distance=Distance("geom", new_geom)).all()

#         if current_booth.count() != 1:
#             print(current_booth.count())
#             print(fixed_booth)
#             exit()

#         # Lazy - Skip address changes for now. Too hard to deal with "is this an actual change" or "a fix we made"
#         if current_booth[0].address != fixed_booth["address"]:
#             # print(current_booth[0].address)
#             # print(fixed_booth["address"])
#             # print()
#             continue

#         # And skip TBC addresses
#         if "TBC" in fixed_booth["address"]:
#             continue

#         fixed_booth["ec_id"] = current_booth[0].ec_id
#         fixed_booth["distance_shift_m"] = current_booth[0].distance.m

#         if fixed_booth["distance_shift_m"] > 1:
#             for_fix_data_issues.append({
#                 "field": "ec_id",
#                 "value": fixed_booth["ec_id"],
#                 "overwrite": [{"field": "lat", "value": fixed_booth["lat_new"]}, {"field": "lon", "value": fixed_booth["lon_new"]}]
#             })

#     with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "fed2019_updated_locations_linked.json"), "w") as nf:
#         nf.write(json.dumps(fixed_booths))

#     with open(os.path.join(os.path.dirname(os.path.realpath(__file__)), "data", "fed2019_updated_locations_for_ingest.json"), "w") as nf:
#         nf.write(json.dumps(for_fix_data_issues))
