"""
test_facility_types.py — GET /api/0.1/polling_places_facility_types/

Covers the API contract used by REVIEW_DRAFT UI select options.
"""

import pytest
from demsausage.app.models import PollingPlaceFacilityType
from rest_framework.test import APIClient

URL = "/api/0.1/polling_places_facility_types/"


@pytest.mark.django_db
def test_facility_types_returns_id_and_name(api_client):
    PollingPlaceFacilityType.objects.create(name="Community Hall")
    PollingPlaceFacilityType.objects.create(name="Primary School")

    resp = api_client.get(URL)
    assert resp.status_code == 200

    data = resp.json()
    assert len(data) == 2

    for item in data:
        assert set(item.keys()) == {"id", "name"}
        assert item["id"] is not None
        assert item["name"] != ""


@pytest.mark.django_db
def test_facility_types_unauthenticated_returns_403():
    PollingPlaceFacilityType.objects.create(name="Community Hall")

    unauth_client = APIClient()
    resp = unauth_client.get(URL)
    assert resp.status_code == 403
