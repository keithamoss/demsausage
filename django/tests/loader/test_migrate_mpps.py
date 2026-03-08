"""
Phase 1 — migrate_mpps tests.

migrate_mpps has two sub-loops:
  A) For every ACTIVE PP → migrate/create its attached MetaPollingPlace to the
     matching DRAFT PP.
  B) For every DRAFT PP without an MPP → create a new draft singleton MPP.

Tests (6 + 2 xfail):
  1. mpp_not_found with MPP detached  (action field presence & detach behaviour)
  2. mpp_not_found without MPP (warning but no action — PP simply missing)
  3. Active PP successfully migrated — MPP FK repointed to the new DRAFT PP
  4. New DRAFT PP without an existing MPP gets a fresh singleton MPP created
  5. ec_id collision in MPP migration → 'Find by ec_id' multi-match error logged
  6. overwrite_distance_thresholds respected during distance-based MPP migration
  xfail A: mpp.save() runs after full_clean() raises ValidationError (Bug #2a)
  xfail B: mpp_task.save() runs after full_clean() raises ValidationError (Bug #2b)
"""

from unittest.mock import patch

import pytest
from demsausage.app.enums import MetaPollingPlaceStatus, PollingPlaceStatus
from demsausage.app.models import (
    MetaPollingPlaces,
    MetaPollingPlacesTasks,
    PollingPlaces,
)
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_dry, run_loader_full

from django.contrib.gis.geos import Point

MELB_LON = 144.9631
MELB_LAT = -37.8136
EAST_165M = {"lat": str(MELB_LAT), "lon": str(MELB_LON + 0.0019)}


def _make_active_pp(test_election, with_mpp: bool = True, name="Test Hall"):
    """Create an ACTIVE PollingPlaces row, optionally with a MetaPollingPlaces."""
    mpp = None
    if with_mpp:
        mpp = MetaPollingPlaces.objects.create(
            name=name,
            premises="Test Primary School",
            geom_location=Point(MELB_LON, MELB_LAT, srid=4326),
            wheelchair_access="Full",
            overseas=False,
            jurisdiction="VIC",
        )

    pp = PollingPlaces.objects.create(
        election=test_election,
        name=name,
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access="Full",
        geom=Point(MELB_LON, MELB_LAT, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
        meta_polling_place=mpp,
    )
    return pp, mpp


# ---------------------------------------------------------------------------
# 1. mpp_not_found with MPP detached → warning + MPP cleared
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mpp_not_found_with_detached_mpp_logs_warning(test_election):
    """When an ACTIVE PP with an MPP has no matching DRAFT PP, the loader logs
    a 'detaching MPP' warning and the MPP FK is cleared from the ACTIVE PP."""
    pp, mpp = _make_active_pp(test_election, with_mpp=True)
    test_election.polling_places_loaded = True
    test_election.save()

    # CSV with a PP in a different state (no distance match)
    sydney_row = {
        **MINIMAL_ROW,
        "name": "Faraway Hall",
        "state": "NSW",
        "address": "1 George St, Sydney NSW 2000",
        "lat": "-33.8688",
        "lon": "151.2093",
    }
    logs = run_loader_dry(test_election, make_csv([sydney_row]))

    # "detaching MPP" variant of the warning
    assert any(
        "detach" in m.lower() for m in logs.get("warnings", [])
    ), f"Expected 'detaching MPP' warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 2. mpp_not_found without attached MPP → warning, no detach message
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mpp_not_found_without_mpp_logs_warning(test_election):
    """When an ACTIVE PP WITHOUT an MPP has no matching DRAFT PP, a simpler
    'may have been removed' warning is emitted (no detach language)."""
    pp, _ = _make_active_pp(test_election, with_mpp=False)
    test_election.polling_places_loaded = True
    test_election.save()

    sydney_row = {
        **MINIMAL_ROW,
        "name": "Faraway Hall",
        "state": "NSW",
        "address": "1 George St, Sydney NSW 2000",
        "lat": "-33.8688",
        "lon": "151.2093",
    }
    logs = run_loader_dry(test_election, make_csv([sydney_row]))

    assert any(
        "been removed" in m.lower() for m in logs.get("warnings", [])
    ), f"Expected 'may have been removed' warning; warnings={logs.get('warnings')}"
    # Must NOT mention detaching
    assert not any(
        "detach" in m.lower() for m in logs.get("warnings", [])
    ), f"Should not say 'detach' for PP without MPP; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 3. Successful migration — MPP FK repointed on the DRAFT/new ACTIVE PP
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mpp_migrated_to_new_active_pp(test_election):
    """After a full reload the MetaPollingPlace is attached to the new ACTIVE PP
    (not the old archived one)."""
    old_pp, mpp = _make_active_pp(test_election, with_mpp=True)
    test_election.polling_places_loaded = True
    test_election.save()

    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    new_pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        new_pp.meta_polling_place_id == mpp.id
    ), f"Expected MPP {mpp.id} on new ACTIVE PP; got {new_pp.meta_polling_place_id}"

    old_pp.refresh_from_db()
    assert (
        old_pp.meta_polling_place_id is None
    ), "Old ARCHIVED PP should have MPP FK cleared after migration"


# ---------------------------------------------------------------------------
# 4. New PP on first load gets a singleton MPP created
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_new_pp_on_first_load_gets_singleton_mpp_created(test_election):
    """On the very first load (no ACTIVE PPs, no existing MPPs) each new DRAFT
    PP that becomes ACTIVE should receive a freshly-created MetaPollingPlaces row."""
    # No pre-existing ACTIVE PPs
    assert test_election.polling_places_loaded is False

    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        pp.meta_polling_place_id is not None
    ), "New PP should have an MPP after first load"
    mpp = MetaPollingPlaces.objects.get(pk=pp.meta_polling_place_id)
    assert mpp.name == "Test Hall"
    # A REVIEW_DRAFT task should be created alongside the MPP
    task_count = MetaPollingPlacesTasks.objects.filter(meta_polling_place=mpp).count()
    assert (
        task_count >= 1
    ), "Expected at least one MetaPollingPlacesTasks row for new MPP"


# ---------------------------------------------------------------------------
# 5. ec_id collision in MPP migration → error logged
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mpp_ec_id_collision_logs_error(test_election):
    """When two CSV rows share the same non-blank ec_id, check_ec_id_is_unique
    (in check_file_validity) detects the collision and logs an error before
    any polling places are written to the DB.

    Note: the error is caught upstream in check_file_validity, not inside the
    MPP migration loop — the loader never reaches migrate_mpps in this case."""
    _make_active_pp(test_election, with_mpp=True)
    test_election.polling_places_loaded = True
    test_election.save()

    # Two DRAFT PPs sharing the same ec_id value  — will cause the count>=2 branch
    rows = [
        {**MINIMAL_ROW, "name": "Test Hall", "ec_id": "42"},
        {
            **MINIMAL_ROW,
            "name": "Test Hall",
            "address": "2 Test St, Testville VIC 1234",
            "ec_id": "42",
        },
    ]
    logs = run_loader_dry(test_election, make_csv(rows))

    all_errors = logs.get("errors", [])
    # The collision is first detected as a non-unique ec_id in check_file_validity
    assert any(
        "non-unique ec_id" in m for m in all_errors
    ), f"Expected non-unique ec_id error; errors={all_errors}"


# ---------------------------------------------------------------------------
# 6. overwrite_distance_thresholds respected during MPP migration
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mpp_overwrite_distance_threshold_allows_distant_match(test_election):
    """When a 200 m threshold override is configured for 'Test Hall', an MPP
    from an ACTIVE PP at Melbourne CBD is migrated to a DRAFT PP 165 m away."""
    old_pp, mpp = _make_active_pp(test_election, with_mpp=True)
    test_election.polling_places_loaded = True
    test_election.save()

    row = {**MINIMAL_ROW, **EAST_165M}
    config = {
        "overwrite_distance_thresholds": [{"name": "Test Hall", "threshold": 0.2}]
    }
    run_loader_full(test_election, make_csv([row]), config=config)

    new_pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        new_pp.meta_polling_place_id == mpp.id
    ), f"Expected MPP {mpp.id} migrated to distant new PP; got {new_pp.meta_polling_place_id}"


# ---------------------------------------------------------------------------
# xfail A — Bug #2a: mpp.save() runs unconditionally after full_clean() raises
# ---------------------------------------------------------------------------


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Bug #2a: In migrate_mpps() first loop, mpp.save(force_insert=True) is "
        "called unconditionally after try: mpp.full_clean() / except: log_error. "
        "If full_clean() raises ValidationError, an invalid MPP object is persisted."
    ),
)
@pytest.mark.django_db
def test_new_mpp_full_clean_failure_does_not_save(test_election):
    """When MetaPollingPlaces.full_clean() raises ValidationError the MPP must
    NOT be saved to the DB.  Currently mpp.save() is called unconditionally,
    so an invalid MPP is persisted — this test documents that bug."""
    mpp_count_before = MetaPollingPlaces.objects.count()

    with patch.object(MetaPollingPlaces, "full_clean", side_effect=Exception("boom")):
        # This will trigger new MPP creation (no pre-existing ACTIVE PPs)
        run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    # If the bug is present, an MPP is created despite full_clean() raising
    # The assertion below will PASS (expected failure) when the bug is present
    # and FAIL (unexpected pass) once the bug is fixed
    assert MetaPollingPlaces.objects.count() == mpp_count_before, (
        "mpp.save() should NOT have been called after full_clean() raised, "
        "but an MPP was persisted to the DB."
    )


# ---------------------------------------------------------------------------
# xfail B — Bug #2b: mpp_task.save() runs after mpp_task.full_clean() raises
# ---------------------------------------------------------------------------


@pytest.mark.xfail(
    strict=True,
    reason=(
        "Bug #2b: In migrate_mpps() first loop, mpp_task.save(force_insert=True) "
        "is called unconditionally after try: mpp_task.full_clean() / except: log. "
        "If full_clean() raises, an invalid task is persisted."
    ),
)
@pytest.mark.django_db
def test_mpp_task_full_clean_failure_does_not_save(test_election):
    """When MetaPollingPlacesTasks.full_clean() raises ValidationError the task
    must NOT be saved.  The unconditional save() currently persists it."""
    task_count_before = MetaPollingPlacesTasks.objects.count()

    with patch.object(
        MetaPollingPlacesTasks, "full_clean", side_effect=Exception("boom")
    ):
        run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    assert MetaPollingPlacesTasks.objects.count() == task_count_before, (
        "mpp_task.save() should NOT have been called after full_clean() raised, "
        "but a task was persisted."
    )
