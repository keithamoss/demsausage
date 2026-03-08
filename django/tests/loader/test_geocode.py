"""
Phase 1 — geocode_missing_locations tests.

Tests (4):
  1. Geocoding enabled, mock returns valid result → PP geocoded and saved to DB
  2. Geocoding disabled in config → blank-coord PP dropped from list
  3. Geocoding enabled, mock returns no results → skip warning logged, PP dropped
  4. Geocoding enabled, mock returns partial_match/non-ROOFTOP → not-accurate warning

For tests that call the Google Maps API, the ``googlemaps.Client`` and ``get_env``
imports in loader.py are patched to avoid real network calls.
"""

from unittest.mock import MagicMock

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

# Config that enables geocoding with no real API key (patched away)
GEOCODING_CONFIG = {"geocoding": {"enabled": True, "components": {"country": "AU"}}}

# A row whose lat/lon are blank — will need geocoding
BLANK_COORDS_ROW = {
    **MINIMAL_ROW,
    "name": "Unlocated Hall",
    "address": "99 Unknown St, Testville VIC 9999",
    "lat": "",
    "lon": "",
}

# A valid geocode API response — slightly north of Melbourne CBD so the geocoded
# PP lands at different coords from MINIMAL_ROW and doesn't collide in dedup.
GOOD_GEOCODE = [
    {
        "geometry": {
            "location": {"lat": -37.8050, "lng": 144.9631},
            "location_type": "ROOFTOP",
        }
    }
]

# A "not accurate enough" response: partial_match=True + non-ROOFTOP
INACCURATE_GEOCODE = [
    {
        "geometry": {
            "location": {"lat": -37.8136, "lng": 144.9631},
            "location_type": "APPROXIMATE",
        },
        "partial_match": True,
    }
]


def _patch_gmaps(mocker, return_value):
    """Patch googlemaps.Client and get_env in the loader's namespace."""
    mock_instance = MagicMock()
    mock_instance.geocode.return_value = return_value
    mocker.patch(
        "demsausage.app.sausage.loader.googlemaps.Client",
        return_value=mock_instance,
    )
    mocker.patch(
        "demsausage.app.sausage.loader.get_env",
        return_value="fake-geocoding-api-key",
    )
    return mock_instance


# ---------------------------------------------------------------------------
# 1. Geocoding enabled, valid API response → PP geocoded
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_geocode_enabled_geocodes_blank_coord_pp(test_election, mocker):
    """When geocoding is enabled and the API returns a single valid result,
    the blank-coordinate PP is geocoded and written to the DB."""
    _patch_gmaps(mocker, GOOD_GEOCODE)

    rows = [MINIMAL_ROW, BLANK_COORDS_ROW]
    run_loader_full(test_election, make_csv(rows), config=GEOCODING_CONFIG)

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert (
        count == 2
    ), f"Expected 2 ACTIVE PPs (1 pre-geocoded + 1 geocoded), got {count}"


# ---------------------------------------------------------------------------
# 2. Geocoding disabled → blank-coord PP is dropped
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_geocode_disabled_drops_blank_coord_pp(test_election):
    """When geocoding is disabled in config, a PP with blank coordinates is
    not kept: it is counted as 'skipped' and excluded from the final list."""
    config = {"geocoding": {"enabled": False}}
    rows = [MINIMAL_ROW, BLANK_COORDS_ROW]
    run_loader_full(test_election, make_csv(rows), config=config)

    count = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    assert (
        count == 1
    ), f"Expected 1 ACTIVE PP (blank-coord PP should have been dropped), got {count}"

    # The remaining PP should be the one with valid coordinates
    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.name == "Test Hall"


# ---------------------------------------------------------------------------
# 3. Geocoding enabled, API returns no results → skip warning, PP dropped
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_geocode_no_api_results_logs_warning(test_election, mocker):
    """When the geocoding API returns an empty list (no results found) a
    [WARNING] is emitted and the polling place is excluded from the result."""
    _patch_gmaps(mocker, [])  # empty list → "No good results found"

    rows = [MINIMAL_ROW, BLANK_COORDS_ROW]
    logs = run_loader_dry(test_election, make_csv(rows), config=GEOCODING_CONFIG)

    assert any(
        "No good results found" in m for m in logs.get("warnings", [])
    ), f"Expected 'No good results found' warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 4. Geocoding enabled, partial_match non-ROOFTOP → not-accurate warning
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_geocode_not_accurate_enough_logs_warning(test_election, mocker):
    """When the geocoding API returns a partial_match result whose location_type
    is not ROOFTOP, it is considered 'not accurate enough' and a [WARNING] is
    emitted.  The polling place is excluded from the result."""
    _patch_gmaps(mocker, INACCURATE_GEOCODE)

    rows = [MINIMAL_ROW, BLANK_COORDS_ROW]
    logs = run_loader_dry(test_election, make_csv(rows), config=GEOCODING_CONFIG)

    assert any(
        "Not accurate enough" in m for m in logs.get("warnings", [])
    ), f"Expected 'Not accurate enough' warning; warnings={logs.get('warnings')}"
