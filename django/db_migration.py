import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

# Connect to legacy SQLite database
import sqlite3
conn = sqlite3.connect("demsausage.sqlite3")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Migrate Mailgun Events
from demsausage.app.models import MailgunEvents
from demsausage.app.enums import PollingPlaceStatus

import json
from datetime import datetime
import pytz


def get_payload(payload):
    if payload is None or payload == "Array":
        return {}
    return json.loads(payload)


# print(MailgunEvents.objects.all())

# cursor.execute("SELECT * FROM mailgun_events WHERE timestamp != 1")
# for event in cursor.fetchall():
#     e = MailgunEvents(timestamp=datetime.fromtimestamp(int(event["timestamp"]), tz=pytz.utc), event_type=event["type"], payload=get_payload(event["json"]))
#     e.save()
#     print(e.id)

# Migrate elections
from demsausage.app.models import Elections
from django.contrib.gis.geos import Point

# print(Elections.objects.all())

# cursor.execute("SELECT * FROM elections")
# for election in cursor.fetchall():
#     e = Elections(old_id=election["id"], geom=Point(election["lon"], election["lat"], srid=4326), default_zoom_level=int(election["default_zoom_level"]), name=election["name"], short_name=election["short_name"], is_hidden=bool(election["hidden"]), is_primary=bool(election["is_primary"]), polling_places_loaded=bool(election["polling_places_loaded"]), election_day=election["election_day"])
#     e.save()
#     print(e.id)

# Migrate polling places
from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaceFacilityType, PollingPlaces
from django.contrib.gis.geos import Point
import json

# print(PollingPlaces.objects.all())


def get_polling_place_facility_type(polling_place_type):
    if polling_place_type != "" and polling_place_type is not None:
        polling_place_type_clean = polling_place_type
        if polling_place_type == "Government School" or polling_place_type == "State School":
            polling_place_type_clean = "Public School"
        elif polling_place_type == "Hall":
            polling_place_type_clean = "Community Hall"
        elif polling_place_type == "Kindergarten":
            polling_place_type_clean = "Pre-School"

        facility_type = PollingPlaceFacilityType.objects.filter(name=polling_place_type_clean).first()
        if facility_type is None:
            raise Exception("'{}' not found".format(polling_place_type))
        else:
            return facility_type

    return None


def get_polling_place_divisions(division):
    return [d.strip() for d in division.split(",")] if division is not None else []


def noms_has_value(noms):
    for key, value in noms.items():
        if key != "free_text":
            if value is True:
                return True
        else:
            if value != "":
                return True
    return False


def get_other(has_other):
    if has_other == "" or has_other == "0" or has_other == "{}" or has_other is None:
        return {}

    other = {}
    for key, val in json.loads(has_other).items():
        if key.startswith("has_") is False:
            raise Exception("'{}' does not start with has_".format(key))

        key_clean = key.split("has_")[1]
        if key_clean != "free_text":
            other[key_clean] = bool(val)
        else:
            other[key_clean] = val
    return other


def get_value_or_empty_string(value):
    return value if value is not None else ""


# cursor.execute("SELECT * FROM elections")
# for election in cursor.fetchall():
#     print("=========================")
#     print(election["name"])

#     e = Elections.objects.filter(old_id=election["id"]).first()

#     cursor.execute("SELECT * FROM {}".format(election["db_table_name"]))
#     for polling_place in cursor.fetchall():
#         print(polling_place["id"])

#         noms = {**{
#             "bbq": bool(polling_place["has_bbq"]),
#             "cake": bool(polling_place["has_caek"]),
#             "nothing": bool(polling_place["has_nothing"]),
#             "run_out": bool(polling_place["has_run_out"])
#         },
#             **get_other(polling_place["has_other"])
#         }

#         # Polling Place Noms
#         pn = None
#         if noms_has_value(noms) is True:
#             # Provide defaults for first and lastest report to migrate the older elections where we didn't track that
#             first_report = polling_place["first_report"]
#             if first_report == "":
#                 first_report = None

#             latest_report = polling_place["latest_report"]
#             if latest_report == "":
#                 latest_report = None

#             chance_of_sausage = float(polling_place["chance_of_sausage"]) if polling_place["chance_of_sausage"] is not None and polling_place["chance_of_sausage"] != "" else None

#             pn = PollingPlaceNoms(noms=noms, stall_name=get_value_or_empty_string(polling_place["stall_name"]), stall_description=get_value_or_empty_string(polling_place["stall_description"]), stall_website=get_value_or_empty_string(polling_place["stall_website"]), stall_extra_info=get_value_or_empty_string(polling_place["extra_info"]), chance_of_sausage=chance_of_sausage, source=get_value_or_empty_string(polling_place["source"]))
#             pn.save()

#             # print(pn.id)
#             PollingPlaceNoms.objects.filter(id=pn.id).update(first_report=first_report, latest_report=latest_report)

#         # Polling Place
#         polling_place_type_facility_type = get_polling_place_facility_type(polling_place["polling_place_type"])
#         divisions = get_polling_place_divisions(polling_place["division"])

#         p = PollingPlaces(old_id=polling_place["id"], election=e, noms=pn, geom=Point(polling_place["lon"], polling_place["lat"], srid=4326), name=polling_place["polling_place_name"], facility_type=polling_place_type_facility_type, premises=get_value_or_empty_string(polling_place["premises"]), address=polling_place["address"], divisions=divisions, state=polling_place["state"], wheelchair_access=get_value_or_empty_string(polling_place["wheelchairaccess"]), entrance_desc=get_value_or_empty_string(polling_place["entrancesdesc"]), opening_hours=get_value_or_empty_string(polling_place["opening_hours"]), booth_info=get_value_or_empty_string(polling_place["booth_info"]), status=PollingPlaceStatus.ACTIVE)
#         p.save()
#         print(p.id)


# Migrate stalls
from demsausage.app.models import Elections, Stalls, PollingPlaces
from demsausage.app.enums import StallStatus
import json


def get_status(status):
    if str(status) == "0":
        return StallStatus.PENDING
    elif str(status) == "1":
        return StallStatus.APPROVED
    elif str(status) == "2":
        return StallStatus.DECLINED
    return None


print(Stalls.objects.all())

cursor.execute("SELECT * FROM pending_stalls WHERE contact_email != '' AND polling_place_id IS NOT NULL AND status != 2")
for stall in cursor.fetchall():
    noms = {
        "bbq": bool(stall["has_bbq"]),
        "cake": bool(stall["has_caek"]),
        "vego": bool(stall["has_vego"]),
        "halal": bool(stall["has_halal"]),
        "coffee": bool(stall["has_coffee"]),
        "bacon_and_eggs": bool(stall["has_bacon_and_eggs"]),
        "free_text": str(stall["has_free_text"]),
    }

    e = Elections.objects.filter(old_id=stall["elections_id"]).first()
    polling_place = PollingPlaces.objects.filter(old_id=stall["polling_place_id"]).filter(election=e).first()

    if noms_has_value(noms) is True:
        if polling_place.noms is not None:
            s = Stalls(old_id=stall["id"], election=e, name=get_value_or_empty_string(stall["stall_name"]), description=get_value_or_empty_string(stall["stall_description"]), website=get_value_or_empty_string(stall["stall_website"]), noms=noms, email=stall["contact_email"], polling_place=polling_place, reported_timestamp=stall["reported_timestamp"], status=get_status(stall["status"]), mail_confirm_key=stall["mail_confirm_key"], mail_confirmed=stall["mail_confirmed"])
            s.save()
            print(s.id)
        else:
            print("Skipping stall {} (election_id={}). Polling place has no noms.".format(stall["id"], e.id))
