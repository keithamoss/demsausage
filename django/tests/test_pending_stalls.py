from datetime import timedelta
from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from demsausage.app.enums import (
    PollingPlaceJurisdiction,
    PollingPlaceNomsChangeReason,
    PollingPlaceStatus,
    StallStatus,
)
from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.views.stall_unofficial_views import ApproveUnofficialStallView
from demsausage.app.views.stall_views import PendingStallsViewSet


@pytest.mark.django_db
@pytest.mark.parametrize("submitter_type", ["owner", "tipoff"])
def test_approving_unofficial_submission_records_direct_source(
    test_election, submitter_type
):
    test_election.jurisdiction = PollingPlaceJurisdiction.VIC
    test_election.election_day = timezone.now() + timedelta(days=1)
    test_election.save()
    user = User.objects.create_user(username="reviewer")
    with patch("demsausage.app.signals.send_discord_webhook_message"):
        stall = Stalls.objects.create(
            election=test_election,
            name="Test stall",
            description="Test",
            noms={"bbq": True},
            email="test@example.com",
            submitter_type=submitter_type,
            location_info={
                "name": "Test Hall",
                "address": "1 Test St",
                "state": "VIC",
                "geom": {"type": "Point", "coordinates": [144.9631, -37.8136]},
            },
        )

    request = APIRequestFactory().post("/", {}, format="json")
    force_authenticate(request, user=user)
    with (
        patch("demsausage.app.signals.task_regenerate_cached_election_data"),
        patch("demsausage.app.signals.send_discord_webhook_message"),
        patch("demsausage.app.views.stall_unofficial_views.send_stall_approved_email"),
    ):
        response = ApproveUnofficialStallView.as_view()(request, pk=stall.pk)

    assert response.status_code == 200
    stall.refresh_from_db()
    assert stall.polling_place.noms.source == "Direct"
    assert stall.polling_place.noms.history.first().history_change_reason == (
        PollingPlaceNomsChangeReason.APPROVED_UNOFFICIAL
    )


@pytest.mark.django_db
def test_latest_changes_links_to_current_active_polling_places(test_election):
    user = User.objects.create_user(username="reviewer", first_name="Reviewer")

    def make_polling_place(name, status=PollingPlaceStatus.ACTIVE):
        return PollingPlaces.objects.create(
            election=test_election,
            name=name,
            address="1 Test St, Testville VIC 1234",
            state="VIC",
            wheelchair_access="Full",
            geom=Point(144.9631, -37.8136, srid=4326),
            status=status,
        )

    def make_stall(polling_place):
        return Stalls.objects.create(
            election=test_election,
            name="Test stall",
            description="Test",
            noms={"bbq": True},
            email="test@example.com",
            status=StallStatus.APPROVED,
            polling_place=polling_place,
            triaged_by=user,
            triaged_on=timezone.now(),
        )

    with (
        patch("demsausage.app.signals.send_discord_webhook_message"),
        patch("demsausage.app.signals.task_regenerate_cached_election_data"),
    ):
        current_place = make_polling_place("Current Hall")
        old_place = make_polling_place("Old Hall", PollingPlaceStatus.ARCHIVED)
        migrated_stall = make_stall(old_place)
        Stalls.objects.filter(id=migrated_stall.id).update(polling_place=current_place)

        deleted_place = make_polling_place("Deleted Hall", PollingPlaceStatus.ARCHIVED)
        deleted_place_stall = make_stall(deleted_place)
        Stalls.objects.filter(id=deleted_place_stall.id).update(
            polling_place=current_place
        )
        deleted_place.delete()

        missing_place = make_polling_place("Missing Hall")
        detached_stall = make_stall(missing_place)
        Stalls.objects.filter(id=detached_stall.id).update(polling_place=None)
        missing_place.delete()

        archived_place = make_polling_place(
            "Archived Hall", PollingPlaceStatus.ARCHIVED
        )
        archived_stall = make_stall(archived_place)
        valid_stall = make_stall(current_place)

    request = APIRequestFactory().get("/api/0.1/stalls/pending/")
    force_authenticate(request, user=user)
    with (
        patch(
            "demsausage.app.views.stall_views.get_active_elections",
            return_value=[test_election],
        ),
        patch(
            "demsausage.app.views.stall_views.getGamifiedElectionStats", return_value={}
        ),
    ):
        response = PendingStallsViewSet.as_view()(request)

    assert response.status_code == 200
    changes = {
        change["stall_id"]: change for change in response.data[0]["latest_changes"]
    }
    assert set(changes) == {
        migrated_stall.id,
        deleted_place_stall.id,
        detached_stall.id,
        archived_stall.id,
        valid_stall.id,
    }
    assert changes[migrated_stall.id]["polling_place_id"] == current_place.id
    assert changes[migrated_stall.id]["polling_place_name"] == "Current Hall"
    assert changes[deleted_place_stall.id]["polling_place_id"] == current_place.id
    assert changes[deleted_place_stall.id]["polling_place_name"] == "Current Hall"
    assert changes[detached_stall.id]["polling_place_id"] is None
    assert changes[detached_stall.id]["polling_place_name"] is None
    assert changes[archived_stall.id]["polling_place_id"] is None
    assert changes[archived_stall.id]["polling_place_name"] == "Archived Hall"
    assert changes[valid_stall.id]["polling_place_id"] == current_place.id
    assert changes[valid_stall.id]["polling_place_name"] == "Current Hall"
