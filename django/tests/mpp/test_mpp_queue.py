"""
test_mpp_queue.py — list and next endpoints (FR-13)

Tests that:
  - GET /api/0.1/meta_polling_places/tasks/ returns job-group summaries with correct
    task_count (IN_PROGRESS only — forms the basis for "X remaining" in the browser).
  - GET /api/0.1/meta_polling_places/tasks/next/?job_name=X returns a random
    IN_PROGRESS task with a tasks_remaining count.
  - Edge cases: missing job_name, unauthenticated, empty queue.
"""

import pytest
from demsausage.app.enums import (
    MetaPollingPlaceTaskCategory,
    MetaPollingPlaceTaskStatus,
    MetaPollingPlaceTaskType,
    PollingPlaceWheelchairAccess,
)
from demsausage.app.models import MetaPollingPlaces, MetaPollingPlacesTasks
from rest_framework.test import APIClient

from django.contrib.gis.geos import Point

LIST_URL = "/api/0.1/meta_polling_places/tasks/"
NEXT_URL = "/api/0.1/meta_polling_places/tasks/next/"

MELB_LON = 144.9631
MELB_LAT = -37.8136


def _make_mpp(n=0):
    return MetaPollingPlaces.objects.create(
        name=f"Hall {n}",
        premises="",
        geom_location=Point(MELB_LON + n * 0.01, MELB_LAT, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        overseas=False,
        jurisdiction="VIC",
    )


def _make_task(mpp, job_name, status=MetaPollingPlaceTaskStatus.IN_PROGRESS):
    return MetaPollingPlacesTasks.objects.create(
        meta_polling_place=mpp,
        job_name=job_name,
        category=MetaPollingPlaceTaskCategory.REVIEW,
        type=MetaPollingPlaceTaskType.REVIEW_DRAFT,
        status=status,
    )


# ---------------------------------------------------------------------------
# 1. GET tasks/ with no tasks → empty list
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_list_with_no_tasks_returns_empty(api_client):
    resp = api_client.get(LIST_URL)
    assert resp.status_code == 200
    assert resp.json() == []


# ---------------------------------------------------------------------------
# 2. GET tasks/ with tasks across two job names → two entries, correct counts
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_list_two_job_groups_correct_task_counts(api_client):
    mpp1 = _make_mpp(0)
    mpp2 = _make_mpp(1)
    mpp3 = _make_mpp(2)

    _make_task(mpp1, "Job Alpha")
    _make_task(mpp2, "Job Alpha")   # 2 tasks in Job Alpha
    _make_task(mpp3, "Job Beta")    # 1 task in Job Beta

    resp = api_client.get(LIST_URL)
    assert resp.status_code == 200

    data = resp.json()
    assert len(data) == 2

    by_name = {item["job_name"]: item for item in data}
    assert by_name["Job Alpha"]["task_count"] == 2
    assert by_name["Job Beta"]["task_count"] == 1


# ---------------------------------------------------------------------------
# 3. GET tasks/next/?job_name=X with tasks → returns a valid IN_PROGRESS task
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_returns_valid_task_for_job(api_client):
    mpp1 = _make_mpp(0)
    mpp2 = _make_mpp(1)
    t1 = _make_task(mpp1, "Job Next")
    t2 = _make_task(mpp2, "Job Next")

    resp = api_client.get(NEXT_URL, {"job_name": "Job Next"})
    assert resp.status_code == 200

    data = resp.json()
    assert data is not None
    assert data["id"] in [t1.id, t2.id]
    assert data["tasks_remaining"] == 2


# ---------------------------------------------------------------------------
# 3b. GET tasks/next/ with lat/lon → nearest task returned first
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_with_valid_lat_lon_returns_nearest_task(api_client):
    mpp_near = _make_mpp(0)
    mpp_far = _make_mpp(2)
    near_task = _make_task(mpp_near, "Job Proximity")
    _make_task(mpp_far, "Job Proximity")

    resp = api_client.get(
        NEXT_URL,
        {"job_name": "Job Proximity", "lat": str(MELB_LAT), "lon": str(MELB_LON)},
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["id"] == near_task.id
    assert data["tasks_remaining"] == 2


# ---------------------------------------------------------------------------
# 3c. GET tasks/next/ with invalid lat/lon strings → fallback succeeds
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_with_invalid_lat_lon_falls_back_and_returns_task(api_client):
    mpp1 = _make_mpp(0)
    mpp2 = _make_mpp(1)
    t1 = _make_task(mpp1, "Job Invalid Coords")
    t2 = _make_task(mpp2, "Job Invalid Coords")

    resp = api_client.get(
        NEXT_URL,
        {"job_name": "Job Invalid Coords", "lat": "abc", "lon": "def"},
    )
    assert resp.status_code == 200

    data = resp.json()
    assert data["id"] in [t1.id, t2.id]
    assert data["tasks_remaining"] == 2


# ---------------------------------------------------------------------------
# 4. GET tasks/next/?job_name=X when all tasks are completed → empty / null
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_returns_empty_when_all_tasks_completed(api_client):
    mpp1 = _make_mpp(0)
    _make_task(mpp1, "Job Done", status=MetaPollingPlaceTaskStatus.COMPLETED)

    resp = api_client.get(NEXT_URL, {"job_name": "Job Done"})
    assert resp.status_code == 200
    # DRF returns empty Response() which serialises to {}
    data = resp.json()
    assert data == {} or data is None


# ---------------------------------------------------------------------------
# 5. GET tasks/next/ without job_name → 400
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_without_job_name_returns_400(api_client):
    resp = api_client.get(NEXT_URL)
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# 6. GET tasks/next/ unauthenticated → 403
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_next_unauthenticated():
    unauth_client = APIClient()
    resp = unauth_client.get(NEXT_URL, {"job_name": "Any Job"})
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 6b. GET tasks/ list endpoint unauthenticated → 403
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_list_unauthenticated():
    unauth_client = APIClient()
    resp = unauth_client.get(LIST_URL)
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 7. task_count reflects only IN_PROGRESS tasks — completing reduces the count
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_list_task_count_only_counts_in_progress(api_client):
    mpp1 = _make_mpp(0)
    mpp2 = _make_mpp(1)
    t1 = _make_task(mpp1, "Job Count")
    _make_task(mpp2, "Job Count")

    # Initially 2 in-progress
    resp = api_client.get(LIST_URL)
    data = {item["job_name"]: item for item in resp.json()}
    assert data["Job Count"]["task_count"] == 2

    # Complete one task
    api_client.post(f"/api/0.1/meta_polling_places/tasks/{t1.id}/complete/")

    # Now only 1 in-progress
    resp2 = api_client.get(LIST_URL)
    data2 = {item["job_name"]: item for item in resp2.json()}
    assert data2["Job Count"]["task_count"] == 1
