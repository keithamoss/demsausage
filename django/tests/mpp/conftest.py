"""
Shared fixtures for the mpp test suite.

The global `test_election` fixture from `tests/conftest.py` is reused here;
it creates an Elections row with an Australia-wide bounding polygon.
"""

import pytest


# ---------------------------------------------------------------------------
# Disable SECURE_SSL_REDIRECT for all tests in this suite.
# The production settings.py has SECURE_SSL_REDIRECT=True, which causes the
# Django test client to receive a 301 redirect on every request.  Disabling
# it here keeps the tests clean without touching global settings.
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def disable_ssl_redirect(settings):
    settings.SECURE_SSL_REDIRECT = False
from demsausage.app.enums import (
    MetaPollingPlaceStatus,
    MetaPollingPlaceTaskCategory,
    MetaPollingPlaceTaskStatus,
    MetaPollingPlaceTaskType,
    PollingPlaceState,
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
)
from demsausage.app.models import (
    MetaPollingPlaces,
    MetaPollingPlacesTasks,
    PollingPlaceFacilityType,
    PollingPlaces,
)
from rest_framework.test import APIClient

from django.contrib.auth.models import User
from django.contrib.gis.geos import Point

# Melbourne CBD coordinates used throughout
MELB_LON = 144.9631
MELB_LAT = -37.8136


# ---------------------------------------------------------------------------
# API Client
# ---------------------------------------------------------------------------


@pytest.fixture
def api_client(db):
    """DRF APIClient authenticated as a superuser created in the test DB.

    Sets HTTP_X_FORWARDED_FOR so the simple_history signal handler in
    signals.py doesn't raise a KeyError when recording audit history.
    """
    user = User.objects.create_superuser(
        username="testadmin", password="testpassword", email="testadmin@example.com"
    )
    client = APIClient()
    client.defaults["HTTP_X_FORWARDED_FOR"] = "127.0.0.1"
    client.force_authenticate(user=user)
    return client


# ---------------------------------------------------------------------------
# MetaPollingPlaces fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def draft_mpp(db):
    """A DRAFT MetaPollingPlaces row with a valid Melbourne CBD location."""
    return MetaPollingPlaces.objects.create(
        name="Test Hall",
        premises="Test Primary School",
        geom_location=Point(MELB_LON, MELB_LAT, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        overseas=False,
        jurisdiction="VIC",
        status=MetaPollingPlaceStatus.DRAFT,
    )


@pytest.fixture
def active_mpp(db):
    """An ACTIVE MetaPollingPlaces row. Used to verify no unintended promotions."""
    return MetaPollingPlaces.objects.create(
        name="Active Hall",
        premises="Active Primary School",
        geom_location=Point(MELB_LON + 0.01, MELB_LAT + 0.01, srid=4326),
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        overseas=False,
        jurisdiction="VIC",
        status=MetaPollingPlaceStatus.ACTIVE,
    )


# ---------------------------------------------------------------------------
# PollingPlaceFacilityType
# ---------------------------------------------------------------------------


@pytest.fixture
def facility_type(db):
    """A PollingPlaceFacilityType row used as a valid FK for PATCH tests."""
    return PollingPlaceFacilityType.objects.create(name="Community Hall")


# ---------------------------------------------------------------------------
# PollingPlaces fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def polling_place(draft_mpp, test_election):
    """A PollingPlaces row linked to draft_mpp for test_election."""
    return PollingPlaces.objects.create(
        election=test_election,
        meta_polling_place=draft_mpp,
        name="Test Hall",
        premises="Test Primary School",
        address="1 Test St, Testville VIC 1234",
        state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON, MELB_LAT, srid=4326),
        status=PollingPlaceStatus.DRAFT,
    )


@pytest.fixture
def second_polling_place(draft_mpp, test_election):
    """A second PollingPlaces row linked to draft_mpp. Used in split/move tests."""
    return PollingPlaces.objects.create(
        election=test_election,
        meta_polling_place=draft_mpp,
        name="Test Hall Annex",
        premises="Test Primary School Annex",
        address="2 Test St, Testville VIC 1234",
        state=PollingPlaceState.VIC,
        wheelchair_access=PollingPlaceWheelchairAccess.FULL,
        geom=Point(MELB_LON + 0.001, MELB_LAT + 0.001, srid=4326),
        status=PollingPlaceStatus.DRAFT,
    )


# ---------------------------------------------------------------------------
# Task fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def review_draft_task(draft_mpp):
    """An IN_PROGRESS REVIEW_DRAFT task for draft_mpp."""
    return MetaPollingPlacesTasks.objects.create(
        meta_polling_place=draft_mpp,
        job_name="Test REVIEW_DRAFT Job",
        category=MetaPollingPlaceTaskCategory.REVIEW,
        type=MetaPollingPlaceTaskType.REVIEW_DRAFT,
        status=MetaPollingPlaceTaskStatus.IN_PROGRESS,
    )


@pytest.fixture
def review_pp_task(active_mpp):
    """An IN_PROGRESS REVIEW_PP task for active_mpp."""
    return MetaPollingPlacesTasks.objects.create(
        meta_polling_place=active_mpp,
        job_name="Test REVIEW_PP Job",
        category=MetaPollingPlaceTaskCategory.REVIEW,
        type=MetaPollingPlaceTaskType.REVIEW_PP,
        status=MetaPollingPlaceTaskStatus.IN_PROGRESS,
    )


@pytest.fixture
def crowdsource_task(active_mpp):
    """An IN_PROGRESS CROWDSOURCE_FROM_FACEBOOK task for active_mpp."""
    return MetaPollingPlacesTasks.objects.create(
        meta_polling_place=active_mpp,
        job_name="Test Crowdsource Job",
        category=MetaPollingPlaceTaskCategory.CROWDSOURCING,
        type=MetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK,
        status=MetaPollingPlaceTaskStatus.IN_PROGRESS,
    )
