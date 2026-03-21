"""
test_mpp_update.py — PATCH /api/0.1/meta_polling_places/{id}/ (B1)

Tests that MetaPollingPlacesViewSet.partial_update accepts the correct writable
fields and silently discards read-only fields (overseas, status).
"""

import json

import pytest
from demsausage.app.enums import MetaPollingPlaceStatus
from demsausage.app.models import MetaPollingPlaces

from django.contrib.gis.geos import GEOSGeometry


def _url(pk):
    return f"/api/0.1/meta_polling_places/{pk}/"


# ---------------------------------------------------------------------------
# 1. PATCH all writable fields with valid values → 200; all fields updated
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_all_writable_fields(api_client, draft_mpp, facility_type):
    payload = {
        "name": "Updated Hall",
        "premises": "Updated Premises",
        "facility_type": facility_type.id,
        "wheelchair_access": "Assisted",
        "wheelchair_access_description": "Ramp at side entrance",
        "geom_location": {
            "type": "Point",
            "coordinates": [144.9700, -37.8200],
        },
    }
    resp = api_client.patch(_url(draft_mpp.id), payload, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.name == "Updated Hall"
    assert draft_mpp.premises == "Updated Premises"
    assert draft_mpp.facility_type_id == facility_type.id
    assert draft_mpp.wheelchair_access == "Assisted"
    assert draft_mpp.wheelchair_access_description == "Ramp at side entrance"
    assert round(draft_mpp.geom_location.x, 4) == 144.97
    assert round(draft_mpp.geom_location.y, 4) == -37.82


# ---------------------------------------------------------------------------
# 2. PATCH only `name` (partial update) → 200; only name changes
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_name_only(api_client, draft_mpp):
    original_premises = draft_mpp.premises
    resp = api_client.patch(_url(draft_mpp.id), {"name": "Partial Update Hall"}, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.name == "Partial Update Hall"
    assert draft_mpp.premises == original_premises


# ---------------------------------------------------------------------------
# 3. PATCH geom_location as valid GeoJSON Point → 200; persisted correctly
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_geom_location_valid(api_client, draft_mpp):
    resp = api_client.patch(
        _url(draft_mpp.id),
        {"geom_location": {"type": "Point", "coordinates": [145.0, -38.0]}},
        format="json",
    )
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert round(draft_mpp.geom_location.x, 4) == 145.0
    assert round(draft_mpp.geom_location.y, 4) == -38.0


# ---------------------------------------------------------------------------
# 4. PATCH facility_type as valid FK id → 200; FK updated
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_facility_type_valid_id(api_client, draft_mpp, facility_type):
    assert draft_mpp.facility_type_id is None
    resp = api_client.patch(_url(draft_mpp.id), {"facility_type": facility_type.id}, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.facility_type_id == facility_type.id


# ---------------------------------------------------------------------------
# 5. PATCH facility_type as null → 200; FK set to null
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_facility_type_null(api_client, draft_mpp, facility_type):
    # First set a facility type
    draft_mpp.facility_type = facility_type
    draft_mpp.save()

    resp = api_client.patch(_url(draft_mpp.id), {"facility_type": None}, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.facility_type_id is None


# ---------------------------------------------------------------------------
# 6. PATCH facility_type as a non-existent id → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_facility_type_nonexistent_id(api_client, draft_mpp):
    resp = api_client.patch(_url(draft_mpp.id), {"facility_type": 99999}, format="json")
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 7. PATCH wheelchair_access with invalid enum value → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_wheelchair_access_invalid_value(api_client, draft_mpp):
    resp = api_client.patch(
        _url(draft_mpp.id), {"wheelchair_access": "InvalidValue"}, format="json"
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 8. PATCH geom_location with invalid shape (Polygon) → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_geom_location_invalid_shape(api_client, draft_mpp):
    resp = api_client.patch(
        _url(draft_mpp.id),
        {
            "geom_location": {
                "type": "Polygon",
                "coordinates": [[[144.9, -37.8], [145.0, -37.8], [145.0, -37.9], [144.9, -37.8]]],
            }
        },
        format="json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 8b. PATCH geom_location as null → 400 (non-null model field)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_geom_location_null_returns_400(api_client, draft_mpp):
    original_x = draft_mpp.geom_location.x
    original_y = draft_mpp.geom_location.y

    resp = api_client.patch(_url(draft_mpp.id), {"geom_location": None}, format="json")
    assert resp.status_code == 400

    draft_mpp.refresh_from_db()
    assert draft_mpp.geom_location.x == original_x
    assert draft_mpp.geom_location.y == original_y


# ---------------------------------------------------------------------------
# 8c. PATCH geom_location malformed Point payload → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_geom_location_malformed_payload_returns_400(api_client, draft_mpp):
    resp = api_client.patch(
        _url(draft_mpp.id),
        {"geom_location": {"type": "Point", "coordinates": "not-an-array"}},
        format="json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 9. PATCH while unauthenticated → 403
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_unauthenticated(draft_mpp):
    from rest_framework.test import APIClient

    unauth_client = APIClient()
    resp = unauth_client.patch(_url(draft_mpp.id), {"name": "Hacker"}, format="json")
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 10. PATCH with overseas=True in body → 200; overseas field in DB is unchanged
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_overseas_ignored(api_client, draft_mpp):
    assert draft_mpp.overseas is False
    resp = api_client.patch(_url(draft_mpp.id), {"overseas": True}, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.overseas is False  # unchanged — not in serializer


# ---------------------------------------------------------------------------
# 11. PATCH with status='Active' in body → 200; status field in DB is unchanged
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_patch_status_ignored(api_client, draft_mpp):
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT
    resp = api_client.patch(_url(draft_mpp.id), {"status": "Active"}, format="json")
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT  # unchanged — not in serializer
