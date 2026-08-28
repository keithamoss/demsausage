"""
test_rearrange.py — POST /api/0.1/meta_polling_places/rearrange_from_mpp_review/ (B3)

Tests that:
  - Splits create a new DRAFT MPP and a REVIEW_DRAFT task.
  - The split_job_name is used as the task's job_name (or auto-generated).
  - Moves repoint Polling Places to existing MPPs.
  - Transactions roll back on orphan-creating operations.
"""

from unittest.mock import patch

import pytest
from demsausage.app.enums import (
    MetaPollingPlaceStatus,
    MetaPollingPlaceTaskStatus,
    MetaPollingPlaceTaskType,
    PollingPlaceState,
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
)
from demsausage.app.models import MetaPollingPlaces, MetaPollingPlacesTasks, PollingPlaces
from rest_framework.test import APIClient

from django.contrib.gis.geos import Point

REARRANGE_URL = "/api/0.1/meta_polling_places/rearrange_from_mpp_review/"

MELB_LON = 144.9631
MELB_LAT = -37.8136


# ---------------------------------------------------------------------------
# 1. Split with split_job_name → new DRAFT MPP + REVIEW_DRAFT task w/ exact name
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_with_job_name_creates_review_draft_task(
    api_client, draft_mpp, polling_place, second_polling_place
):
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    resp = api_client.post(
        REARRANGE_URL,
        {
            "moves": [],
            "splits": [second_polling_place.id],
            "split_job_name": "My Review Job 2025",
        },
        format="json",
    )
    assert resp.status_code == 200

    # One new MPP created
    assert MetaPollingPlaces.objects.count() == initial_mpp_count + 1
    new_mpp = MetaPollingPlaces.objects.latest("id")
    assert new_mpp.status == MetaPollingPlaceStatus.DRAFT

    # One new REVIEW_DRAFT task created with the exact job name
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count + 1
    task = MetaPollingPlacesTasks.objects.latest("id")
    assert task.type == MetaPollingPlaceTaskType.REVIEW_DRAFT
    assert task.job_name == "My Review Job 2025"
    assert task.meta_polling_place_id == new_mpp.id

    # The split PP is now linked to the new MPP
    second_polling_place.refresh_from_db()
    assert second_polling_place.meta_polling_place_id == new_mpp.id


# ---------------------------------------------------------------------------
# 2. Two splits with same split_job_name → both tasks share the job name
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_two_splits_share_job_name(api_client, draft_mpp, test_election):
    # Create two MPPs, each with TWO PPs, so splitting one PP off doesn't orphan the source.
    mpp2 = MetaPollingPlaces.objects.create(
        name="MPP 2", premises="", geom_location=Point(MELB_LON + 0.01, MELB_LAT, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL, overseas=False, jurisdiction="VIC",
        status=MetaPollingPlaceStatus.DRAFT,
    )
    # draft_mpp gets two PPs so splitting one doesn't orphan it
    pp_a = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=draft_mpp,
        name="PP A", premises="", address="1 A St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    PollingPlaces.objects.create(
        election=test_election, meta_polling_place=draft_mpp,
        name="PP A2", premises="", address="1A A St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.0001, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    # mpp2 gets two PPs so splitting one doesn't orphan it
    pp_b = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=mpp2,
        name="PP B", premises="", address="2 B St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.01, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    PollingPlaces.objects.create(
        election=test_election, meta_polling_place=mpp2,
        name="PP B2", premises="", address="2A B St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.0101, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )

    shared_job_name = "Shared Job 2025"

    # First split
    resp1 = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [pp_a.id], "split_job_name": shared_job_name},
        format="json",
    )
    assert resp1.status_code == 200

    # Second split (from a different source MPP to avoid an orphan)
    resp2 = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [pp_b.id], "split_job_name": shared_job_name},
        format="json",
    )
    assert resp2.status_code == 200

    tasks = MetaPollingPlacesTasks.objects.filter(job_name=shared_job_name)
    assert tasks.count() == 2
    for task in tasks:
        assert task.job_name == shared_job_name


# ---------------------------------------------------------------------------
# 3. Split without split_job_name → auto-generated name (non-blank, contains "MPP Split")
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_without_job_name_auto_generates(
    api_client, draft_mpp, polling_place, second_polling_place
):
    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [second_polling_place.id]},
        format="json",
    )
    assert resp.status_code == 200

    task = MetaPollingPlacesTasks.objects.latest("id")
    assert task.job_name != ""
    assert "MPP Split" in task.job_name


# ---------------------------------------------------------------------------
# 3b. Split with empty split_job_name explicitly provided → 400 + rollback
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_with_empty_split_job_name_returns_400_and_rolls_back(
    api_client, draft_mpp, polling_place, second_polling_place
):
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [second_polling_place.id], "split_job_name": ""},
        format="json",
    )

    assert resp.status_code == 400
    assert MetaPollingPlaces.objects.count() == initial_mpp_count
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count


# ---------------------------------------------------------------------------
# 3c. Split with whitespace split_job_name explicitly provided → 400 + rollback
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_with_whitespace_split_job_name_returns_400_and_rolls_back(
    api_client, draft_mpp, polling_place, second_polling_place
):
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [second_polling_place.id], "split_job_name": "   "},
        format="json",
    )

    assert resp.status_code == 400
    assert MetaPollingPlaces.objects.count() == initial_mpp_count
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count


# ---------------------------------------------------------------------------
# 4. Move PP to existing MPP → 200; PP repointed; no new MPP or task created
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_move_pp_to_existing_mpp(
    api_client, draft_mpp, active_mpp, polling_place, second_polling_place
):
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    # Move second_polling_place from draft_mpp to active_mpp
    resp = api_client.post(
        REARRANGE_URL,
        {
            "moves": [
                {"pollingPlaceId": second_polling_place.id, "metaPollingPlaceId": active_mpp.id}
            ],
            "splits": [],
        },
        format="json",
    )
    assert resp.status_code == 200

    # No new MPP or task
    assert MetaPollingPlaces.objects.count() == initial_mpp_count
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count

    second_polling_place.refresh_from_db()
    assert second_polling_place.meta_polling_place_id == active_mpp.id


# ---------------------------------------------------------------------------
# 5. Mixed move + split → both succeed; new MPP+task from split, PP moved
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_mixed_move_and_split(api_client, draft_mpp, active_mpp, test_election):
    # draft_mpp has three PPs: split one, move one, leave one
    pp_keep = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=draft_mpp,
        name="PP Keep", premises="", address="1 Keep St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    pp_move = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=draft_mpp,
        name="PP Move", premises="", address="2 Move St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.001, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    pp_split = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=draft_mpp,
        name="PP Split", premises="", address="3 Split St VIC", state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.002, MELB_LAT, srid=4326), status=PollingPlaceStatus.DRAFT,
    )

    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    resp = api_client.post(
        REARRANGE_URL,
        {
            "moves": [{"pollingPlaceId": pp_move.id, "metaPollingPlaceId": active_mpp.id}],
            "splits": [pp_split.id],
            "split_job_name": "Mixed Job",
        },
        format="json",
    )
    assert resp.status_code == 200

    assert MetaPollingPlaces.objects.count() == initial_mpp_count + 1
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count + 1

    pp_move.refresh_from_db()
    assert pp_move.meta_polling_place_id == active_mpp.id

    new_task = MetaPollingPlacesTasks.objects.latest("id")
    assert new_task.type == MetaPollingPlaceTaskType.REVIEW_DRAFT
    assert new_task.job_name == "Mixed Job"


# ---------------------------------------------------------------------------
# 6. Split that would orphan the source MPP → 400; rolled back
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_orphans_source_mpp_returns_400(api_client, draft_mpp, polling_place):
    """draft_mpp has only one PP (polling_place). Splitting it off would leave
    draft_mpp as an orphan. Expect 400 and no new objects created."""
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()

    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [polling_place.id]},
        format="json",
    )
    assert resp.status_code == 400

    # Transaction rolled back — no new MPP or task
    assert MetaPollingPlaces.objects.count() == initial_mpp_count
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count


# ---------------------------------------------------------------------------
# 7. Move that would orphan source MPP → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_move_orphans_source_mpp_returns_400(
    api_client, draft_mpp, polling_place, active_mpp
):
    """draft_mpp has only one PP (polling_place). Moving it to active_mpp would
    orphan draft_mpp. Expect 400."""
    resp = api_client.post(
        REARRANGE_URL,
        {
            "moves": [{"pollingPlaceId": polling_place.id, "metaPollingPlaceId": active_mpp.id}],
            "splits": [],
        },
        format="json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 8. Non-existent pollingPlaceId in splits → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_nonexistent_polling_place_id_returns_400(
    api_client, draft_mpp, polling_place
):
    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [99999]},
        format="json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 9. Non-existent pollingPlaceId in moves → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_move_nonexistent_polling_place_id_returns_400(api_client, draft_mpp, active_mpp):
    resp = api_client.post(
        REARRANGE_URL,
        {
            "moves": [{"pollingPlaceId": 99999, "metaPollingPlaceId": active_mpp.id}],
            "splits": [],
        },
        format="json",
    )
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 10. Unauthenticated → 403
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_rearrange_unauthenticated(draft_mpp, polling_place, second_polling_place):
    unauth_client = APIClient()
    resp = unauth_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [second_polling_place.id]},
        format="json",
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 11. Split: new MPP inherits geom_location from the first linked polling place
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_new_mpp_inherits_geom_location(
    api_client, draft_mpp, polling_place, second_polling_place
):
    # second_polling_place.geom is at (MELB_LON+0.001, MELB_LAT+0.001) per conftest
    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [second_polling_place.id]},
        format="json",
    )
    assert resp.status_code == 200

    second_polling_place.refresh_from_db()
    new_mpp = second_polling_place.meta_polling_place
    assert new_mpp.id != draft_mpp.id

    # geom_location should match the PP's geom
    assert round(new_mpp.geom_location.x, 6) == round(second_polling_place.geom.x, 6)
    assert round(new_mpp.geom_location.y, 6) == round(second_polling_place.geom.y, 6)


# ---------------------------------------------------------------------------
# 12. Split: overseas PP → new MPP has overseas=True and jurisdiction=None
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_overseas_pp_sets_overseas_and_null_jurisdiction(
    api_client, draft_mpp, polling_place, test_election
):
    # Create an overseas MPP and a PP attached to it
    overseas_mpp = MetaPollingPlaces.objects.create(
        name="London Embassy",
        premises="",
        geom_location=Point(-0.1175, 51.5126, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        overseas=True,
        jurisdiction=None,
        status=MetaPollingPlaceStatus.DRAFT,
    )
    # Create two PPs on the overseas MPP (so splitting one doesn't orphan it)
    PollingPlaces.objects.create(
        election=test_election, meta_polling_place=overseas_mpp,
        name="London Embassy PP 2", premises="", address="Strand, London",
        state=PollingPlaceState.Overseas, wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(-0.1175, 51.5126, srid=4326), status=PollingPlaceStatus.DRAFT,
    )
    overseas_pp = PollingPlaces.objects.create(
        election=test_election, meta_polling_place=overseas_mpp,
        name="London Embassy PP", premises="", address="Strand, London",
        state=PollingPlaceState.Overseas, wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(-0.1175, 51.5126, srid=4326), status=PollingPlaceStatus.DRAFT,
    )

    resp = api_client.post(
        REARRANGE_URL,
        {"moves": [], "splits": [overseas_pp.id]},
        format="json",
    )
    assert resp.status_code == 200

    overseas_pp.refresh_from_db()
    new_mpp = overseas_pp.meta_polling_place
    assert new_mpp.overseas is True
    assert new_mpp.jurisdiction is None


# ---------------------------------------------------------------------------
# 13. Split task creation failure rolls back new MPP + PP reassignment
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_split_task_full_clean_failure_rolls_back_everything(
    api_client, draft_mpp, polling_place, second_polling_place
):
    initial_mpp_count = MetaPollingPlaces.objects.count()
    initial_task_count = MetaPollingPlacesTasks.objects.count()
    original_mpp_id = second_polling_place.meta_polling_place_id

    with patch.object(MetaPollingPlacesTasks, "full_clean", side_effect=Exception("boom")):
        resp = api_client.post(
            REARRANGE_URL,
            {
                "moves": [],
                "splits": [second_polling_place.id],
                "split_job_name": "Rollback Job",
            },
            format="json",
        )

    assert resp.status_code == 400
    assert MetaPollingPlaces.objects.count() == initial_mpp_count
    assert MetaPollingPlacesTasks.objects.count() == initial_task_count

    second_polling_place.refresh_from_db()
    assert second_polling_place.meta_polling_place_id == original_mpp_id
