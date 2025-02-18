import os
import random
from datetime import datetime
from time import sleep

import django
from django.contrib.gis.geos import Point

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

import pytz
from demsausage.app.enums import (
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
    StallStatus,
    StallSubmitterType,
    StallTipOffSource,
)
from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaces, Stalls


def get_election_id():
    return 60


def get_election():
    return Elections.objects.get(id=get_election_id())


def get_unofficial_election_id():
    return 61


def get_unofficial_election():
    return Elections.objects.get(id=get_unofficial_election_id())


def cleanup():
    # Official Polling Places
    pollingPlaces = PollingPlaces.objects.filter(election_id=get_election_id()).filter(
        noms__isnull=False
    )
    print(f"Deleted {pollingPlaces.count()} polling places with noms")
    pollingPlaceNomsIds = list(pollingPlaces.values_list("noms_id", flat=True))

    for pp in pollingPlaces:
        pp.noms_id = None
        pp.booth_info = ""
    PollingPlaces.objects.bulk_update(pollingPlaces, ["noms_id", "booth_info"])

    pollingPlaceNoms = PollingPlaceNoms.objects.filter(id__in=pollingPlaceNomsIds)
    print(f"Deleted {pollingPlaceNoms.count()} polling place noms entries")
    pollingPlaceNoms.delete()
    pollingPlaceNoms = None
    pollingPlaces = None

    stalls = Stalls.objects.filter(election_id=get_election_id())
    print(f"Deleted {stalls.count()} stalls")
    stalls.delete()
    stalls = None

    # Unofficial Polling Places
    pollingPlaces = PollingPlaces.objects.filter(
        election_id=get_unofficial_election_id()
    )
    pollingPlaceNomsIds = list(
        pollingPlaces.filter(noms__isnull=False).values_list("noms_id", flat=True)
    )

    for pp in pollingPlaces:
        pp.noms_id = None
    PollingPlaces.objects.bulk_update(pollingPlaces, ["noms_id"])

    pollingPlaceNoms = PollingPlaceNoms.objects.filter(id__in=pollingPlaceNomsIds)
    print(f"Deleted {pollingPlaceNoms.count()} unofficial polling place noms entries")
    pollingPlaceNoms.delete()
    pollingPlaceNoms = None

    stalls = Stalls.objects.filter(election_id=get_unofficial_election_id())
    print(f"Deleted {stalls.count()} stalls from unofficial polling places")
    stalls.delete()
    stalls = None

    pollingPlaces.delete()
    print(f"Deleted {pollingPlaces.count()} unofficial polling places")
    pollingPlaces = None


def get_next_polling_place(name):
    pp = (
        PollingPlaces.objects.filter(election_id=get_election_id())
        .filter(premises=name)
        .filter(booth_info="Used!")
        .first()
    )
    if pp is not None:
        print("Found", pp)
        return pp

    pp = (
        PollingPlaces.objects.filter(election_id=get_election_id())
        .exclude(booth_info="Used!")
        .order_by("-id")
        .first()
    )
    pp.premises = name
    pp.booth_info = "Used!"
    pp.save()
    print(pp)

    return pp


def create_polling_place_with_an_approved_owner_submission_stall(
    pollingPlace, stallName
):
    baseStall = create_owner_submission_stall(pollingPlace, stallName)

    # Approve Stall
    sleep(2)
    baseStallPending = Stalls.objects.get(id=baseStall.id)
    baseStallPending.status = StallStatus.APPROVED
    baseStallPending.triaged_on = datetime.now(pytz.utc)
    baseStallPending.triaged_by_id = 1
    baseStallPending.save()

    # Update Polling Place
    pollingPlaceNoms = PollingPlaceNoms(
        name=baseStallPending.name,
        description=baseStallPending.description,
        opening_hours=baseStallPending.opening_hours,
        website=baseStallPending.website,
        noms=baseStallPending.noms,
    )
    pollingPlaceNoms.save()

    pollingPlace.noms_id = pollingPlaceNoms.id
    pollingPlace.save()

    return baseStall


def create_polling_place_with_a_denied_owner_submission_stall(pollingPlace, stallName):
    baseStall = create_owner_submission_stall(pollingPlace, stallName)

    # Decline Stall
    sleep(2)
    baseStallPending = Stalls.objects.get(id=baseStall.id)
    baseStallPending.status = StallStatus.DECLINED
    baseStallPending.triaged_on = datetime.now(pytz.utc)
    baseStallPending.triaged_by_id = 1
    baseStallPending.save()

    return baseStall


def create_polling_place_with_admin_sourced_info(
    pollingPlace,
    noms={
        "bbq": True,
        "coffee": True,
    },
):
    # Update Polling Place
    pollingPlaceNoms = PollingPlaceNoms(
        noms=noms,
        source="Helen",
    )
    pollingPlaceNoms.save()

    pollingPlace.noms_id = pollingPlaceNoms.id
    pollingPlace.save()

    return pollingPlaceNoms


def approve_tip_off(pollingPlace, baseStall):
    # Approve Stall
    sleep(2)
    baseStallPending = Stalls.objects.get(id=baseStall.id)
    baseStallPending.status = StallStatus.APPROVED
    baseStallPending.triaged_on = datetime.now(pytz.utc)
    baseStallPending.triaged_by_id = 1
    baseStallPending.save()

    # Update Polling Place
    pollingPlaceNoms = PollingPlaceNoms(
        noms=baseStallPending.noms,
    )
    pollingPlaceNoms.save()

    pollingPlace.noms_id = pollingPlaceNoms.id
    pollingPlace.save()

    return baseStall


def create_polling_place_with_an_approved_tip_off(
    pollingPlace, tipoff_source, tipoff_source_other=""
):
    baseStall = create_tipoff_stall(pollingPlace, tipoff_source, tipoff_source_other)

    return approve_tip_off(pollingPlace, baseStall)


def create_polling_place_with_an_approved_RCOS_tip_off(
    pollingPlace, tipoff_source, tipoff_source_other=""
):
    baseStall = create_RCOS_tipoff_stall(
        pollingPlace, tipoff_source, tipoff_source_other
    )

    return approve_tip_off(pollingPlace, baseStall)


def create_polling_place_with_an_approved_RunOut_tip_off(
    pollingPlace, tipoff_source, tipoff_source_other=""
):
    baseStall = create_RunOut_tipoff_stall(
        pollingPlace, tipoff_source, tipoff_source_other
    )

    return approve_tip_off(pollingPlace, baseStall)


def create_polling_place_with_a_denied_tip_off(
    pollingPlace, tipoff_source, tipoff_source_other=""
):
    baseStall = create_tipoff_stall(pollingPlace, tipoff_source, tipoff_source_other)

    # Decline Stall
    sleep(2)
    baseStallPending = Stalls.objects.get(id=baseStall.id)
    baseStallPending.status = StallStatus.DECLINED
    baseStallPending.triaged_on = datetime.now(pytz.utc)
    baseStallPending.triaged_by_id = 1
    baseStallPending.save()

    return baseStall


def create_owner_submission_stall(
    pollingPlace,
    stallName,
    noms={
        "bbq": True,
    },
):
    stall = Stalls(
        election_id=get_election_id(),
        name=stallName,
        description="",
        opening_hours="8AM-4PM",
        website="https://admin-redesign.test.democracysausage.org",
        noms=noms,
        email="keithamoss@gmail.com",
        polling_place_id=pollingPlace.id,
        submitter_type=StallSubmitterType.OWNER,
    )
    stall.save()

    return stall


def create_tipoff_stall(
    pollingPlace,
    tipoff_source,
    tipoff_source_other="",
    noms={
        "bbq": True,
        "cake": True,
        "vego": True,
    },
):
    stall = Stalls(
        election_id=get_election_id(),
        noms=noms,
        email="keithamoss@gmail.com",
        polling_place_id=pollingPlace.id,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_RCOS_tipoff_stall(pollingPlace, tipoff_source, tipoff_source_other=""):
    stall = Stalls(
        election_id=get_election_id(),
        noms={
            "nothing": True,
        },
        email="keithamoss@gmail.com",
        polling_place_id=pollingPlace.id,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_RunOut_tipoff_stall(pollingPlace, tipoff_source, tipoff_source_other=""):
    stall = Stalls(
        election_id=get_election_id(),
        noms={
            "bbq": True,
            "cake": True,
            "run_out": True,
        },
        email="keithamoss@gmail.com",
        polling_place_id=pollingPlace.id,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_unofficial_polling_place_owner_submission_stall(
    unofficialPollingPlaceAddress, stallName
):
    stall = Stalls(
        election_id=get_unofficial_election_id(),
        name=stallName,
        description="",
        opening_hours="8AM-4PM",
        website="",
        noms={
            "bbq": True,
            "coffee": True,
        },
        location_info={
            "geom": {
                "type": "Point",
                "coordinates": [147 + random.uniform(0, 1), -41 + random.uniform(0, 1)],
            },
            "name": "Some Place",
            "state": "TAS",
            "address": unofficialPollingPlaceAddress,
        },
        email="keithamoss@gmail.com",
        polling_place_id=None,
        submitter_type=StallSubmitterType.OWNER,
    )
    stall.save()

    return stall


def approve_unofficial_polling_place_tip_off(baseStall):
    # Create polling place based on user-submitted location info
    pollingPlace = PollingPlaces(
        geom=Point(
            baseStall.location_info["geom"]["coordinates"][0],
            baseStall.location_info["geom"]["coordinates"][1],
        ),
        name=baseStall.location_info["name"],
        address=baseStall.location_info["address"],
        state=baseStall.location_info["state"],
        facility_type=None,
        election_id=baseStall.election_id,
        status=PollingPlaceStatus.ACTIVE,
        wheelchair_access=PollingPlaceWheelchairAccess.UNKNOWN,
    )
    pollingPlace.save()

    # Now that we have a polling place, add noms
    pollingPlaceNoms = PollingPlaceNoms(
        noms=baseStall.noms,
    )
    pollingPlaceNoms.save()

    # Update Polling Place
    pollingPlace.noms_id = pollingPlaceNoms.id
    pollingPlace.save()

    # Approve Stall
    sleep(2)
    stall = Stalls.objects.get(id=baseStall.id)
    stall.status = StallStatus.APPROVED
    stall.triaged_on = datetime.now(pytz.utc)
    stall.triaged_by_id = 1
    stall.polling_place_id = pollingPlace.id
    stall.save()

    return stall


def create_unofficial_polling_place_with_an_approved_owner_submission_stall(
    unofficialPollingPlaceAddress, stallName
):
    baseStallPending = create_unofficial_polling_place_owner_submission_stall(
        unofficialPollingPlaceAddress, stallName
    )

    return approve_unofficial_polling_place_tip_off(baseStallPending)


def create_unofficial_polling_place_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    stall = Stalls(
        election_id=get_unofficial_election_id(),
        noms={
            "cake": True,
            "coffee": True,
        },
        location_info={
            "geom": {
                "type": "Point",
                "coordinates": [147 + random.uniform(0, 1), -42 + random.uniform(0, 1)],
            },
            "name": "Some Place",
            "state": "TAS",
            "address": unofficialPollingPlaceAddress,
        },
        email="keithamoss@gmail.com",
        polling_place_id=None,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_unofficial_polling_place_approved_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    baseStallPending = create_unofficial_polling_place_tipoff_stall(
        unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other
    )

    return approve_unofficial_polling_place_tip_off(baseStallPending)


def create_unofficial_polling_place_RCOS_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    stall = Stalls(
        election_id=get_unofficial_election_id(),
        noms={
            "nothing": True,
        },
        location_info={
            "geom": {
                "type": "Point",
                "coordinates": [147 + random.uniform(0, 1), -42 + random.uniform(0, 1)],
            },
            "name": "Some Place",
            "state": "TAS",
            "address": unofficialPollingPlaceAddress,
        },
        email="keithamoss@gmail.com",
        polling_place_id=None,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_unofficial_polling_place_approved_RCOS_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    baseStallPending = create_unofficial_polling_place_RCOS_tipoff_stall(
        unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other
    )

    return approve_unofficial_polling_place_tip_off(baseStallPending)


def create_unofficial_polling_place_RunOut_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    stall = Stalls(
        election_id=get_unofficial_election_id(),
        noms={
            "cake": True,
            "run_out": True,
        },
        location_info={
            "geom": {
                "type": "Point",
                "coordinates": [146 + random.uniform(0, 1), -42 + random.uniform(0, 1)],
            },
            "name": "Some Place",
            "state": "TAS",
            "address": unofficialPollingPlaceAddress,
        },
        email="keithamoss@gmail.com",
        polling_place_id=None,
        submitter_type=StallSubmitterType.TIPOFF,
        tipoff_source=tipoff_source,
        tipoff_source_other=tipoff_source_other,
    )
    stall.save()

    return stall


def create_unofficial_polling_place_approved_RunOut_tipoff_stall(
    unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other=""
):
    baseStallPending = create_unofficial_polling_place_RunOut_tipoff_stall(
        unofficialPollingPlaceAddress, tipoff_source, tipoff_source_other
    )

    return approve_unofficial_polling_place_tip_off(baseStallPending)
