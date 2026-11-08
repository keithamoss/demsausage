from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from django.contrib.gis.geos import Point
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from demsausage.app.enums import PollingPlaceStatus, StallStatus
from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.views.stall_views import PendingStallsViewSet


@pytest.mark.django_db
def test_latest_changes_handles_deleted_historical_polling_places(test_election):
    user = User.objects.create_user(username="reviewer", first_name="Reviewer")

    def make_polling_place(name):
        return PollingPlaces.objects.create(
            election=test_election,
            name=name,
            address="1 Test St, Testville VIC 1234",
            state="VIC",
            wheelchair_access="Full",
            geom=Point(144.9631, -37.8136, srid=4326),
            status=PollingPlaceStatus.ARCHIVED,
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

    with patch("demsausage.app.signals.send_discord_webhook_message"):
        current_place = make_polling_place("Current Hall")
        old_place = make_polling_place("Old Hall")
        migrated_stall = make_stall(old_place)
        Stalls.objects.filter(id=migrated_stall.id).update(polling_place=current_place)
        old_place.delete()

        missing_place = make_polling_place("Missing Hall")
        detached_stall = make_stall(missing_place)
        Stalls.objects.filter(id=detached_stall.id).update(polling_place=None)
        missing_place.delete()

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
    assert set(changes) == {migrated_stall.id, valid_stall.id}
    assert changes[migrated_stall.id]["polling_place_id"] == current_place.id
    assert changes[migrated_stall.id]["polling_place_name"] == "Current Hall"
    assert changes[valid_stall.id]["polling_place_id"] == current_place.id
