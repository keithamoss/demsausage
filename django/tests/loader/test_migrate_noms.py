"""
Phase 1 — migrate_noms tests.

migrate_noms runs inside transaction.atomic() and transfers noms (and stall FK
references) from pre-existing ACTIVE polling places to the freshly-written
DRAFT polling places.

Tests are set up by directly creating ACTIVE PollingPlaces (and PollingPlaceNoms)
in the DB, bypassing the full first-load pipeline.

Tests (7):
  1. Noms FK is repointed to the matching DRAFT PP (distance match)
  2. No DRAFT PP within threshold → error logged, loader bails
  3. Two DRAFT PPs within threshold → spatial_proximity + multi-match error
  4. First load (polling_places_loaded=False) → merge-review warning logged
  5. Reload (polling_places_loaded=True) → no merge-review warning
  6. overwrite_distance_thresholds allows a 165 m-distant PP to match
  7. Default 100 m threshold rejects a 165 m-distant PP
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaceNoms, PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

from django.contrib.gis.geos import Point

# Base coordinates (Melbourne CBD)
MELB_LON = 144.9631
MELB_LAT = -37.8136

# ~55 m north of Melbourne CBD  (0.0005° lat × 111 km/° ≈ 55 m)
NORTH_55M = {"lat": str(MELB_LAT + 0.0005), "lon": str(MELB_LON)}
# ~77 m north  (0.0007° lat)
NORTH_77M = {"lat": str(MELB_LAT + 0.0007), "lon": str(MELB_LON)}
# ~165 m east  (0.0019° lon × 87.7 km/° ≈ 165 m — beyond 100 m, inside 200 m)
EAST_165M = {"lat": str(MELB_LAT), "lon": str(MELB_LON + 0.0019)}


def _make_active_pp_with_noms(test_election):
    """Create and return an ACTIVE PollingPlaces row with a PollingPlaceNoms."""
    noms = PollingPlaceNoms.objects.create(noms={"bbq": True})
    pp = PollingPlaces.objects.create(
        election=test_election,
        name="Test Hall",
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access="Full",
        geom=Point(MELB_LON, MELB_LAT, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
        noms=noms,
    )
    return pp, noms


# ---------------------------------------------------------------------------
# 1. Noms FK successfully repointed by distance
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_noms_migrate_by_distance_repoints_fk(test_election):
    """When an ACTIVE PP with noms has a matching DRAFT PP within 100 m, the
    noms FK is migrated to the new PP and the new PP becomes ACTIVE."""
    old_pp, noms = _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    # CSV has a PP at the same Melbourne CBD coordinates
    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    # Old PP should now be ARCHIVED with noms=None
    old_pp.refresh_from_db()
    assert old_pp.status == PollingPlaceStatus.ARCHIVED
    assert old_pp.noms_id is None, "Old PP should have noms cleared after migration"

    # The new ACTIVE PP should carry the noms
    new_pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        new_pp.noms_id == noms.id
    ), f"Expected noms id={noms.id} on new ACTIVE PP; got {new_pp.noms_id}"


# ---------------------------------------------------------------------------
# 2. No matching DRAFT PP → error
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_noms_no_match_logs_error(test_election):
    """When no DRAFT PP is found within 100 m of the ACTIVE PP with noms,
    migrate_noms logs an error and the loader bails."""
    _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    # CSV has a PP at Sydney — far from Melbourne, no distance match
    sydney_row = {
        **MINIMAL_ROW,
        "state": "NSW",
        "address": "1 George St, Sydney NSW 2000",
        "lat": "-33.8688",
        "lon": "151.2093",
    }
    logs = run_loader_dry(test_election, make_csv([sydney_row]))

    assert any(
        "0 matching polling places" in m or "matching polling places found" in m
        for m in logs.get("errors", [])
    ), f"Expected no-match error in migrate_noms; errors={logs.get('errors')}"


# ---------------------------------------------------------------------------
# 3. Two DRAFT PPs within threshold → spatial_proximity + multi-match error
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_noms_multi_match_logs_proximity_and_error(test_election):
    """When safe_find_by_distance returns 2+ DRAFT PPs for an ACTIVE PP with
    noms, both a spatial_proximity error and a multi-match noms error are logged.
    """
    _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    # Two CSV rows at DIFFERENT locations both within 100 m of Melbourne CBD
    rows = [
        {**MINIMAL_ROW, "name": "Test Hall", "address": "Addr A", **NORTH_55M},
        {**MINIMAL_ROW, "name": "Test Hall B", "address": "Addr B", **NORTH_77M},
    ]
    logs = run_loader_dry(test_election, make_csv(rows))

    all_errors = logs.get("errors", [])
    assert any(
        "spatially near each other" in m for m in all_errors
    ), f"Expected spatial_proximity error; errors={all_errors}"
    assert any(
        "matching polling places found" in m for m in all_errors
    ), f"Expected multi-match noms error; errors={all_errors}"


# ---------------------------------------------------------------------------
# 4. First load (polling_places_loaded=False) → merge-review warning
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_noms_merge_review_warning_on_first_load(test_election):
    """On a first load (polling_places_loaded=False) with an ACTIVE PP (user-
    added) that matches a DRAFT PP, a 'Is this correct?' warning is logged."""
    _make_active_pp_with_noms(test_election)
    # Leave polling_places_loaded=False (as created by test_election fixture)
    assert test_election.polling_places_loaded is False

    logs = run_loader_dry(test_election, make_csv([MINIMAL_ROW]))

    assert any(
        "Is this correct?" in m or "merged successfully" in m.lower()
        for m in logs.get("warnings", [])
    ), f"Expected merge-review warning on first load; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 5. Reload (polling_places_loaded=True) → no merge-review warning
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_noms_merge_review_absent_on_reload(test_election):
    """On a reload (polling_places_loaded=True), no 'Is this correct?' warning
    is emitted even when noms are successfully migrated."""
    _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    logs = run_loader_dry(test_election, make_csv([MINIMAL_ROW]))

    assert not any(
        "Is this correct?" in m or "merged successfully" in m.lower()
        for m in logs.get("warnings", [])
    ), f"Unexpected merge-review warning on reload; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 6. overwrite_distance_thresholds allows a 165 m-distant PP to match
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_overwrite_distance_threshold_allows_distant_match(test_election):
    """With a 200 m overwrite threshold for 'Test Hall', a DRAFT PP 165 m away
    is found and the noms are migrated successfully."""
    old_pp, noms = _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    # DRAFT PP at ~165 m east of Melbourne CBD
    row = {**MINIMAL_ROW, **EAST_165M}
    config = {
        "overwrite_distance_thresholds": [
            {"name": "Test Hall", "threshold": 0.2}  # 200 m
        ]
    }
    run_loader_full(test_election, make_csv([row]), config=config)

    new_pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        new_pp.noms_id == noms.id
    ), f"Expected noms to be migrated to distant PP; got noms_id={new_pp.noms_id}"


# ---------------------------------------------------------------------------
# 7. Default 100 m threshold rejects a 165 m-distant PP
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_default_distance_threshold_misses_distant_pp(test_election):
    """Without a threshold override the default 100 m radius does not reach a
    DRAFT PP that is 165 m away; migrate_noms logs an error."""
    _make_active_pp_with_noms(test_election)
    test_election.polling_places_loaded = True
    test_election.save()

    # DRAFT PP at ~165 m east — beyond the default 100 m threshold
    row = {**MINIMAL_ROW, **EAST_165M}
    logs = run_loader_dry(test_election, make_csv([row]))

    assert any(
        "0 matching polling places" in m or "matching polling places found" in m
        for m in logs.get("errors", [])
    ), f"Expected no-match error with default 100 m threshold; errors={logs.get('errors')}"
