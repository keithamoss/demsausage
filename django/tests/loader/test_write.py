"""
Phase 1 — write_draft_polling_places and migrate pipeline tests.

Verifies the DB state produced by the full write-and-migrate pipeline:

Tests (3):
  1. Full load: ACTIVE polling places are created, DRAFT rows don't persist
  2. Reload: existing ACTIVE PPs are archived, new ones go ACTIVE
  3. No DRAFT rows remain after migrate() completes (covers the full transition)
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from tests.conftest import MINIMAL_ROW, make_csv, run_loader_full


@pytest.mark.django_db
def test_full_load_creates_active_and_no_draft_rows(test_election):
    """After a complete (non-dry-run) load, polling places are ACTIVE and no
    DRAFT rows remain — migrate() must correctly promote every DRAFT to ACTIVE.
    """
    rows = [
        MINIMAL_ROW,
        {
            **MINIMAL_ROW,
            "name": "Test Hall 2",
            "address": "2 Test St, Testville VIC 1234",
            "lat": "-37.8200",
        },
    ]
    run_loader_full(test_election, make_csv(rows))

    active = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    ).count()
    draft = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.DRAFT
    ).count()

    assert active == 2, f"Expected 2 ACTIVE polling places; got {active}"
    assert draft == 0, f"Expected 0 DRAFT polling places after migrate(); got {draft}"


@pytest.mark.django_db
def test_reload_archives_previous_active_polling_places(test_election):
    """On a second (reload) run the previously-ACTIVE polling places are
    correctly moved to ARCHIVED status.

    Flow:
      1. First load: 2 ACTIVE PPs (test_election.polling_places_loaded → True)
      2. Second load with updated CSV: new ACTIVE PPs; old ones → ARCHIVED
    """
    first_load_rows = [
        MINIMAL_ROW,
        {
            **MINIMAL_ROW,
            "name": "Test Hall 2",
            "address": "2 Test St, Testville VIC 1234",
            "lat": "-37.8200",
        },
    ]
    run_loader_full(test_election, make_csv(first_load_rows))

    # Capture the IDs of the first-load ACTIVE PPs
    first_load_ids = set(
        PollingPlaces.objects.filter(
            election=test_election, status=PollingPlaceStatus.ACTIVE
        ).values_list("id", flat=True)
    )
    assert len(first_load_ids) == 2, "Pre-condition: 2 ACTIVE PPs after first load"

    # Reload the election (same CSV is fine — positions match)
    test_election.refresh_from_db()
    run_loader_full(test_election, make_csv(first_load_rows))

    # First-load PPs should now be ARCHIVED
    archived_count = PollingPlaces.objects.filter(
        id__in=first_load_ids, status=PollingPlaceStatus.ARCHIVED
    ).count()
    assert archived_count == 2, (
        f"Expected first-load PPs to be ARCHIVED after reload; "
        f"archived count={archived_count}"
    )

    # New ACTIVE PPs should exist (different IDs)
    new_active_ids = set(
        PollingPlaces.objects.filter(
            election=test_election, status=PollingPlaceStatus.ACTIVE
        ).values_list("id", flat=True)
    )
    assert new_active_ids.isdisjoint(first_load_ids), (
        "Second-load ACTIVE PPs should have new IDs; "
        f"overlap={new_active_ids & first_load_ids}"
    )


@pytest.mark.django_db
def test_no_draft_rows_remain_after_full_pipeline(test_election):
    """After the full pipeline (write_draft → migrate_noms → migrate_mpps →
    migrate) no DRAFT rows should remain for this election."""
    rows = [
        MINIMAL_ROW,
        {
            **MINIMAL_ROW,
            "name": "Hall B",
            "address": "10 B St, Testville VIC 1234",
            "lat": "-37.8200",
        },
        {
            **MINIMAL_ROW,
            "name": "Hall C",
            "address": "10 C St, Testville VIC 1234",
            "lat": "-37.8250",
        },
    ]
    run_loader_full(test_election, make_csv(rows))

    draft = PollingPlaces.objects.filter(
        election=test_election, status=PollingPlaceStatus.DRAFT
    ).count()
    assert (
        draft == 0
    ), f"Expected 0 DRAFT polling places after full pipeline; got {draft}"
