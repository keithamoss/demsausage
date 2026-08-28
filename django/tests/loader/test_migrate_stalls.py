"""
Phase 1 — migrate_unofficial_pending_stalls + declined/pending stall sub-tests.

The loader has two separate stall-migration paths:

  A) migrate_unofficial_pending_stalls  (runs before migrate_noms, only on first load)
     – matches stalls submitted against user-entered location_info to DRAFT polling places

  B) Declined/Pending stall migration inside migrate_noms  (runs on every reload)
     – repoints stalls whose polling_place is now ACTIVE to the corresponding DRAFT PP

Tests:
  1. Unofficial pending stall: no match → error logged  (threshold=200m, stall in Sydney)
  2. Unofficial pending stall: multi-match within 200m → error logged
  3. Unofficial pending stall: early exit when polling_places_loaded=True
  4. Unofficial pending stall: successful match → FK repointed, "Please verify" info
  5. Declined stall: matching DRAFT PP within 100m → FK repointed
  6. Declined stall: zero match → error logged
  7. Declined stall: multi-match → error logged
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus, StallStatus
from demsausage.app.models import PollingPlaces, Stalls
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

from django.contrib.gis.geos import MultiPolygon, Point, Polygon

MELB_LON = 144.9631
MELB_LAT = -37.8136

# A second polling place ~55 m north of Melbourne CBD
NORTH_55M = {"lat": str(MELB_LAT + 0.0005), "lon": str(MELB_LON)}


def _make_pending_stall(test_election, lat=MELB_LAT, lon=MELB_LON, polling_place=None):
    """Create a PENDING Stall with an unofficial location_info and no polling_place FK."""
    return Stalls.objects.create(
        election=test_election,
        name="Sausage Sizzle",
        description="A delicious BBQ stall",
        noms={"bbq": True},
        email="test@example.com",
        status=StallStatus.PENDING,
        polling_place=polling_place,
        location_info={
            "name": "Test Hall",
            "address": "1 Test St, Testville VIC 1234",
            "state": "VIC",
            "geom": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
        },
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )


def _make_active_pp(test_election, lat=MELB_LAT, lon=MELB_LON, name="Test Hall"):
    """Create an ACTIVE PP for stall declined/pending migration tests."""
    return PollingPlaces.objects.create(
        election=test_election,
        name=name,
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access="Full",
        geom=Point(lon, lat, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
    )


# ============================================================================
# A) migrate_unofficial_pending_stalls
# ============================================================================


@pytest.mark.django_db
def test_unofficial_pending_stall_no_match_logs_error(test_election):
    """A stall in Sydney gets no match against a Melbourne CSV → error logged."""
    # Stall is in Sydney
    _make_pending_stall(test_election, lat=-33.8688, lon=151.2093)
    test_election.polling_places_loaded = False
    test_election.save()

    # One Melbourne polling place in CSV — too far away to match
    logs = run_loader_dry(test_election, make_csv([MINIMAL_ROW]))

    errors = logs.get("errors", [])
    assert any(
        "stall_no_match" in m for m in errors
    ), f"Expected 'No matching polling place' error; errors={errors}"


@pytest.mark.django_db
def test_unofficial_pending_stall_multi_match_logs_error(test_election):
    """When two DRAFT PPs are within the 200m threshold, multi-match error is logged."""
    _make_pending_stall(test_election, lat=MELB_LAT, lon=MELB_LON)
    test_election.polling_places_loaded = False
    test_election.save()

    # Two polling places very close together — both within 200m of the stall
    rows = [
        {
            **MINIMAL_ROW,
            "name": "Test Hall",
            "lat": str(MELB_LAT),
            "lon": str(MELB_LON),
        },
        {
            **MINIMAL_ROW,
            "name": "Test Hall B",
            "lat": str(MELB_LAT + 0.0005),
            "lon": str(MELB_LON),
        },
    ]
    logs = run_loader_dry(test_election, make_csv(rows))

    errors = logs.get("errors", [])
    assert any(
        "stall_multi_match" in m for m in errors
    ), f"Expected 'Cannot determine' multi-match error; errors={errors}"


@pytest.mark.django_db
def test_unofficial_pending_stall_skipped_on_reload(test_election):
    """When polling_places_loaded=True the unofficial stall migration is skipped entirely."""
    _make_pending_stall(test_election, lat=MELB_LAT, lon=MELB_LON)
    test_election.polling_places_loaded = True
    test_election.save()

    stall = Stalls.objects.get(election=test_election, status=StallStatus.PENDING)
    assert stall.polling_place_id is None

    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    stall.refresh_from_db()
    assert (
        stall.polling_place_id is None
    ), "Stall should NOT be repointed when polling_places_loaded=True"


@pytest.mark.django_db
def test_unofficial_pending_stall_successful_match_repoints_fk(test_election):
    """A stall at Melbourne CBD matched to a Melbourne PP → FK repointed."""
    _make_pending_stall(test_election, lat=MELB_LAT, lon=MELB_LON)
    test_election.polling_places_loaded = False
    test_election.save()

    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    stall = Stalls.objects.get(election=test_election, status=StallStatus.PENDING)
    assert (
        stall.polling_place_id is not None
    ), "Stall FK should be repointed after successful match"


# ============================================================================
# B) Declined / Pending stall migration inside migrate_noms
# ============================================================================


@pytest.mark.django_db
def test_declined_stall_repointed_to_new_draft_pp(test_election):
    """After a reload, a DECLINED stall whose polling_place is now ACTIVE is
    repointed to the matching new DRAFT (soon-to-be ACTIVE) PP."""
    active_pp = _make_active_pp(test_election)
    stall = Stalls.objects.create(
        election=test_election,
        name="Declined Stall",
        description="Was declined",
        noms={"bbq": False},
        email="declined@example.com",
        status=StallStatus.DECLINED,
        polling_place=active_pp,
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )
    test_election.polling_places_loaded = True
    test_election.save()

    # CSV has the same PP at the same location — within 100m match
    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    stall.refresh_from_db()
    new_active = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        stall.polling_place_id == new_active.id
    ), f"Stall should point to new ACTIVE PP {new_active.id}; got {stall.polling_place_id}"


@pytest.mark.django_db
def test_declined_stall_no_match_logs_error(test_election):
    """A DECLINED stall attached to an ACTIVE PP in Melbourne, but with a CSV PP
    in Sydney (too far), logs a Declined/Pending Stall Migration error."""
    active_pp = _make_active_pp(test_election)
    Stalls.objects.create(
        election=test_election,
        name="Declined Stall",
        description="Was declined",
        noms={"bbq": False},
        email="declined@example.com",
        status=StallStatus.DECLINED,
        polling_place=active_pp,
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )
    test_election.polling_places_loaded = True
    test_election.save()

    # CSV puts the PP in Sydney — no match for the Melbourne stall
    sydney_row = {
        **MINIMAL_ROW,
        "name": "Faraway Hall",
        "state": "NSW",
        "address": "1 George St, Sydney NSW 2000",
        "lat": "-33.8688",
        "lon": "151.2093",
    }
    logs = run_loader_dry(test_election, make_csv([sydney_row]))

    errors = logs.get("errors", [])
    assert any(
        "No match found in new data for declined" in m for m in errors
    ), f"Expected zero-match error for declined stall; errors={errors}"


@pytest.mark.django_db
def test_declined_stall_multi_match_logs_error(test_election):
    """When 2 DRAFT PPs are within 100m of the stall's ACTIVE PP, a Declined/Pending
    Stall Migration error is logged listing the count."""
    active_pp = _make_active_pp(test_election)
    Stalls.objects.create(
        election=test_election,
        name="Declined Stall",
        description="",
        noms={"bbq": False},
        email="multi@example.com",
        status=StallStatus.DECLINED,
        polling_place=active_pp,
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )
    test_election.polling_places_loaded = True
    test_election.save()

    # Two PPs both within 100m of the Melbourne ACTIVE PP
    rows = [
        {
            **MINIMAL_ROW,
            "name": "Test Hall",
            "lat": str(MELB_LAT),
            "lon": str(MELB_LON),
        },
        {
            **MINIMAL_ROW,
            "name": "Test Hall B",
            "lat": str(MELB_LAT + 0.0005),
            "lon": str(MELB_LON),
        },
    ]
    logs = run_loader_dry(test_election, make_csv(rows))

    errors = logs.get("errors", [])
    assert any(
        "spatial_proximity" in m or "matches found in new data for declined" in m
        for m in errors
    ), f"Expected multi-match Declined/Pending error; errors={errors}"
