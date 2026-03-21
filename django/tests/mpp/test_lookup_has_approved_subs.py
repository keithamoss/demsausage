"""
test_lookup_has_approved_subs.py

Regression tests for PollingPlacesSerializerForLookup.get_has_approved_subs.
"""

import pytest
from demsausage.app.enums import (
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
    StallStatus,
)
from demsausage.app.models import PollingPlaceNoms, PollingPlaces, Stalls
from demsausage.app.serializers import PollingPlacesSerializerForLookup
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_full

from django.contrib.gis.geos import Point

MELB_LON = 144.9631
MELB_LAT = -37.8136


@pytest.mark.django_db
def test_has_approved_subs_true_after_loader_reload_replaces_polling_place(test_election):
    noms = PollingPlaceNoms.objects.create(noms={"bbq": True})
    old_pp = PollingPlaces.objects.create(
        election=test_election,
        noms=noms,
        name="Test Hall",
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON, MELB_LAT, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
    )

    Stalls.objects.create(
        election=test_election,
        polling_place=old_pp,
        name="Approved Sausage",
        description="A delicious BBQ stall",
        noms={"bbq": True},
        email="approved@example.com",
        status=StallStatus.APPROVED,
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )

    test_election.polling_places_loaded = True
    test_election.save()

    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    replacement_pp = PollingPlaces.objects.get(
        election=test_election,
        status=PollingPlaceStatus.ACTIVE,
    )
    assert replacement_pp.id != old_pp.id

    payload = PollingPlacesSerializerForLookup(replacement_pp).data
    assert payload["has_approved_subs"] is True


@pytest.mark.django_db
def test_has_approved_subs_false_when_no_approved_stalls(test_election):
    pp = PollingPlaces.objects.create(
        election=test_election,
        name="No Stalls Hall",
        premises="No Stalls Premises",
        address="2 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.01, MELB_LAT + 0.01, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
    )

    payload = PollingPlacesSerializerForLookup(pp).data
    assert payload["has_approved_subs"] is False
