"""
test_mpp_complete.py — POST /api/0.1/meta_polling_places/tasks/{id}/complete/ (B2)

Tests that:
  - Completing a REVIEW_DRAFT task on a DRAFT MPP promotes it to ACTIVE.
  - Completing a non-REVIEW_DRAFT task (or an already-ACTIVE MPP) leaves status unchanged.
  - Defer/Close actions do NOT promote the MPP.
  - Atomicity: a `MetaPollingPlaces.save()` failure rolls back the task status change.
"""

from unittest.mock import patch

import pytest
from demsausage.app.enums import (
    MetaPollingPlaceStatus,
    MetaPollingPlaceTaskOutcome,
    MetaPollingPlaceTaskStatus,
)
from demsausage.app.models import MetaPollingPlaces, MetaPollingPlacesTasks
from rest_framework.test import APIClient


def _complete_url(pk):
    return f"/api/0.1/meta_polling_places/tasks/{pk}/complete/"


def _defer_url(pk):
    return f"/api/0.1/meta_polling_places/tasks/{pk}/defer/"


def _close_url(pk):
    return f"/api/0.1/meta_polling_places/tasks/{pk}/close/"


# ---------------------------------------------------------------------------
# 1. Complete REVIEW_DRAFT on DRAFT MPP → task COMPLETED; MPP → ACTIVE
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_review_draft_promotes_draft_mpp(api_client, review_draft_task, draft_mpp):
    resp = api_client.post(_complete_url(review_draft_task.id))
    assert resp.status_code == 200

    review_draft_task.refresh_from_db()
    assert review_draft_task.status == MetaPollingPlaceTaskStatus.COMPLETED
    assert review_draft_task.outcome == MetaPollingPlaceTaskOutcome.COMPLETED

    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.ACTIVE


# ---------------------------------------------------------------------------
# 2. Complete REVIEW_DRAFT on already-ACTIVE MPP → task COMPLETED; MPP unchanged
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_review_draft_active_mpp_unchanged(api_client, db):
    from demsausage.app.enums import MetaPollingPlaceTaskCategory, MetaPollingPlaceTaskType, PollingPlaceWheelchairAccess

    from django.contrib.gis.geos import Point

    # Create an ACTIVE MPP and a REVIEW_DRAFT task for it
    mpp = MetaPollingPlaces.objects.create(
        name="Already Active Hall",
        premises="",
        geom_location=Point(144.9631, -37.8136, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        overseas=False,
        jurisdiction="VIC",
        status=MetaPollingPlaceStatus.ACTIVE,
    )
    task = MetaPollingPlacesTasks.objects.create(
        meta_polling_place=mpp,
        job_name="Test Job",
        category=MetaPollingPlaceTaskCategory.REVIEW,
        type=MetaPollingPlaceTaskType.REVIEW_DRAFT,
    )

    resp = api_client.post(_complete_url(task.id))
    assert resp.status_code == 200

    mpp.refresh_from_db()
    assert mpp.status == MetaPollingPlaceStatus.ACTIVE  # still Active, no error


# ---------------------------------------------------------------------------
# 3. Complete REVIEW_PP on DRAFT MPP → task COMPLETED; MPP stays DRAFT
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_review_pp_does_not_promote_mpp(api_client, review_pp_task, active_mpp, draft_mpp):
    # Create a REVIEW_PP task pointing to draft_mpp
    from demsausage.app.enums import MetaPollingPlaceTaskCategory, MetaPollingPlaceTaskType

    task = MetaPollingPlacesTasks.objects.create(
        meta_polling_place=draft_mpp,
        job_name="Review PP Job",
        category=MetaPollingPlaceTaskCategory.REVIEW,
        type=MetaPollingPlaceTaskType.REVIEW_PP,
    )

    resp = api_client.post(_complete_url(task.id))
    assert resp.status_code == 200

    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT  # unchanged


# ---------------------------------------------------------------------------
# 4. Complete CROWDSOURCE_FROM_FACEBOOK → 200; MPP status unchanged
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_crowdsource_task_no_mpp_change(api_client, crowdsource_task, active_mpp):
    original_status = active_mpp.status

    resp = api_client.post(_complete_url(crowdsource_task.id))
    assert resp.status_code == 200

    active_mpp.refresh_from_db()
    assert active_mpp.status == original_status


# ---------------------------------------------------------------------------
# 5. Defer REVIEW_DRAFT → task COMPLETED/DEFERRED; MPP stays DRAFT
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_defer_review_draft_does_not_promote_mpp(api_client, review_draft_task, draft_mpp):
    resp = api_client.post(_defer_url(review_draft_task.id))
    assert resp.status_code == 200

    review_draft_task.refresh_from_db()
    assert review_draft_task.status == MetaPollingPlaceTaskStatus.COMPLETED
    assert review_draft_task.outcome == MetaPollingPlaceTaskOutcome.DEFERRED

    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT


# ---------------------------------------------------------------------------
# 6. Close REVIEW_DRAFT → task COMPLETED/CLOSED; MPP stays DRAFT
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_close_review_draft_does_not_promote_mpp(api_client, review_draft_task, draft_mpp):
    resp = api_client.post(_close_url(review_draft_task.id))
    assert resp.status_code == 200

    review_draft_task.refresh_from_db()
    assert review_draft_task.status == MetaPollingPlaceTaskStatus.COMPLETED
    assert review_draft_task.outcome == MetaPollingPlaceTaskOutcome.CLOSED

    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT


# ---------------------------------------------------------------------------
# 7. Complete an already-COMPLETED task → 400 with "isn't in progress"
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_already_completed_task_returns_400(api_client, review_draft_task):
    # First complete it
    api_client.post(_complete_url(review_draft_task.id))

    # Try completing again
    resp = api_client.post(_complete_url(review_draft_task.id))
    assert resp.status_code == 400
    assert "isn't in progress" in resp.content.decode()


# ---------------------------------------------------------------------------
# 8. Complete while unauthenticated → 403
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_unauthenticated(review_draft_task):
    unauth_client = APIClient()
    resp = unauth_client.post(_complete_url(review_draft_task.id))
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 9. passed_review is true after completing REVIEW_DRAFT → GET shows passed_review: true
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_review_draft_sets_passed_review(api_client, review_draft_task):
    resp = api_client.post(_complete_url(review_draft_task.id))
    assert resp.status_code == 200

    # GET the task and verify passed_review in the nested MPP's task_outcomes
    get_resp = api_client.get(f"/api/0.1/meta_polling_places/tasks/{review_draft_task.id}/")
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["meta_polling_place"]["task_outcomes"]["passed_review"] is True


# ---------------------------------------------------------------------------
# 10. Atomicity: MetaPollingPlaces.save() raises → task status rolled back
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_complete_review_draft_rolled_back_on_mpp_save_failure(
    api_client, review_draft_task, draft_mpp
):
    """If MPP.save() raises during complete, @transaction.atomic must roll back
    the task status change too — task remains IN_PROGRESS."""

    original_save = MetaPollingPlaces.save

    def failing_save(self, *args, **kwargs):
        if self.pk == draft_mpp.pk:
            raise RuntimeError("Simulated DB failure")
        return original_save(self, *args, **kwargs)

    with patch.object(MetaPollingPlaces, "save", failing_save):
        # Prevent Django test client from re-raising the exception
        api_client.raise_request_exception = False
        resp = api_client.post(_complete_url(review_draft_task.id))
        api_client.raise_request_exception = True

    # The request should have raised a 500 (unhandled exception inside atomic)
    assert resp.status_code == 500

    # Verify the task is still IN_PROGRESS (transaction was rolled back)
    review_draft_task.refresh_from_db()
    assert review_draft_task.status == MetaPollingPlaceTaskStatus.IN_PROGRESS

    # Verify the MPP is still DRAFT
    draft_mpp.refresh_from_db()
    assert draft_mpp.status == MetaPollingPlaceStatus.DRAFT
