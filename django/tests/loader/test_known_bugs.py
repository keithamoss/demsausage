"""
Phase 1 — Known bugs documented as xfail tests.

Bug #3 (from LOADER_REDESIGN_PLAN.md):
    RollbackPollingPlaces.cleanup() calls:
        self.election.polling_places_loaded = False
        self.election.polling_places_loaded.save()   ← .save() on a bool!

    This raises AttributeError: 'bool' object has no attribute 'save'
    whenever the rollback path transitions from non-unofficial to all-unofficial.

The xfail(strict=True) here documents the bug: the test PASSES (as an expected
failure) while the bug is present, and would FAIL (unexpected pass) once fixed.
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.sausage.loader import RollbackPollingPlaces

from django.contrib.gis.geos import Point

MELB_LON = 144.9631
MELB_LAT = -37.8136


@pytest.mark.xfail(
    strict=True,
    raises=AttributeError,
    reason=(
        "Bug #3: RollbackPollingPlaces.cleanup() calls "
        "self.election.polling_places_loaded.save() — .save() on a bool raises "
        "AttributeError: 'bool' object has no attribute 'save'"
    ),
)
@pytest.mark.django_db
def test_rollback_cleanup_polling_places_loaded_reset_raises(test_election):
    """Demonstrate Bug #3: when all_polling_places_are_unofficial() returns True,
    cleanup() tries to call .save() on the boolean field value and raises AttributeError.

    Steps:
    1. Mark polling_places_loaded=True so the rollback path is active.
    2. Ensure there are ACTIVE PPs (to satisfy can_loading_begin) but no DRAFT PPs.
    3. Create a Stall with location_info=None so all_polling_places_are_unofficial() returns True.
       (Note: the model query is inverted — it checks location_info__isnull=True,
        i.e. stalls WITHOUT location_info — meaning official-placed stalls make it
        appear unofficial for rollback purposes.)
    4. Run RollbackPollingPlaces — cleanup() will reach the buggy line.
    """
    # Create an ACTIVE PP so rollback has something to work with
    PollingPlaces.objects.create(
        election=test_election,
        name="Test Hall",
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state="VIC",
        wheelchair_access="Full",
        geom=Point(MELB_LON, MELB_LAT, srid=4326),
        status=PollingPlaceStatus.ACTIVE,
    )

    # Create a Stall with location_info=None — this makes all_polling_places_are_unofficial() True
    # (the method checks Stalls.filter(location_info__isnull=True).count() > 0)
    Stalls.objects.create(
        election=test_election,
        name="Test Stall",
        description="",
        noms={"bbq": True},
        email="test@example.com",
        status="Pending",
        polling_place=None,
        location_info=None,  # <- triggers all_polling_places_are_unofficial()
        submitter_type="",
        tipoff_source="",
        tipoff_source_other="",
    )

    test_election.polling_places_loaded = True
    test_election.save()

    rollback = RollbackPollingPlaces(election=test_election, dry_run=False)
    rollback.make_logger()

    # This should NOT raise — but currently does due to Bug #3
    rollback.cleanup()

    # If we reach here the bug is fixed; ensure polling_places_loaded was reset
    test_election.refresh_from_db()
    assert (
        test_election.polling_places_loaded is False
    ), "After rollback, polling_places_loaded should be False"
