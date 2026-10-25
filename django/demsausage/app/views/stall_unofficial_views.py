from datetime import datetime
from math import asin, cos, radians, sin, sqrt

import pytz
from demsausage.app.enums import (
    PollingPlaceJurisdiction,
    PollingPlaceNomsChangeReason,
    PollingPlaceState,
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
    StallStatus,
)
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.sausage.mailgun import send_stall_approved_email
from demsausage.app.sausage.polling_places import find_by_distance
from demsausage.app.serializers import (
    PendingStallsSerializer,
    PollingPlaceNomsSerializer,
    StallsManagementSerializer,
    StallsSerializer,
)
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from simple_history.utils import update_change_reason

from django.contrib.gis.geos import Point
from django.db import transaction
from django.db.models.expressions import RawSQL
from django.utils import timezone


def _get_location_info_point(stall):
    coordinates = stall.location_info["geom"]["coordinates"]
    return Point(coordinates[0], coordinates[1], srid=4326)


def _get_distance_between_stalls_m(stall_a, stall_b):
    lon1, lat1 = stall_a.location_info["geom"]["coordinates"]
    lon2, lat2 = stall_b.location_info["geom"]["coordinates"]
    a = (
        sin(radians(lat2 - lat1) / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lon2 - lon1) / 2) ** 2
    )
    return 2 * 6371000 * asin(sqrt(a))


def get_pending_unofficial_stalls_queryset():
    return Stalls.objects.filter(
        status=StallStatus.PENDING,
        polling_place__isnull=True,
        location_info__isnull=False,
        # Mirrors Elections.is_active()
        election__election_day__date__gte=timezone.now().date(),
    )


def _does_location_info_state_match_election(stall):
    state = stall.location_info.get("state", None)
    if state not in [s.value for s in PollingPlaceState]:
        return False

    if stall.election.jurisdiction == PollingPlaceJurisdiction.AUS:
        return True

    return state.lower() == str(stall.election.jurisdiction).lower()


# location_info.state is unreliable (often a suburb name), so it's only shown to reviewers and never used here.
# Federal elections aren't supported (returns None) until this ties into meta polling places.
def _get_polling_place_state(stall):
    if stall.election.jurisdiction == PollingPlaceJurisdiction.AUS:
        return None

    return str(stall.election.jurisdiction).upper()


class PendingUnofficialStallsViewSet(generics.ListAPIView):
    """
    API endpoint that lists pending stalls submitted against unofficial (user-provided) locations.
    """

    serializer_class = StallsSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Geohash ordering clusters nearby (potentially duplicate) submissions together
        return (
            get_pending_unofficial_stalls_queryset()
            .select_related("election", "triaged_by")
            .annotate(
                geohash=RawSQL(
                    "ST_GeoHash(ST_SetSRID(ST_MakePoint((location_info->'geom'->'coordinates'->>0)::float, (location_info->'geom'->'coordinates'->>1)::float), 4326))",
                    [],
                )
            )
            .order_by("election_id", "geohash", "id")
        )

    def list(self, request, *args, **kwargs):
        response = []
        pendingStallsSerializer = PendingStallsSerializer()
        stalls = list(self.get_queryset())

        for stall in stalls:
            # Once official polling places are loaded these are match candidates, not duplicates, so look further afield
            nearby = find_by_distance(
                _get_location_info_point(stall),
                distance_threshold_km=(
                    1.0 if stall.election.polling_places_loaded is True else 0.1
                ),
                limit=5 if stall.election.polling_places_loaded is True else None,
                qs=PollingPlaces.objects.filter(
                    election_id=stall.election_id, status=PollingPlaceStatus.ACTIVE
                ),
            )

            response.append(
                self.serializer_class(stall).data
                | {
                    "election_name": stall.election.name,
                    "election_jurisdiction": stall.election.jurisdiction,
                    "election_polling_places_loaded": stall.election.polling_places_loaded,
                    "state_matches_election": _does_location_info_state_match_election(
                        stall
                    ),
                    "polling_place_state": _get_polling_place_state(stall),
                    "triaged_by_name": pendingStallsSerializer.get_triaged_by(stall),
                    "diff": pendingStallsSerializer.get_diff(stall),
                    "nearby_polling_places": [
                        {
                            "id": pp.id,
                            "name": pp.name,
                            "premises": pp.premises,
                            "address": pp.address,
                            "distance_m": round(pp.distance.m),
                        }
                        for pp in nearby
                    ],
                    "nearby_pending_stalls": [
                        {
                            "id": other.id,
                            "name": other.name or other.location_info["name"],
                            "distance_m": round(
                                _get_distance_between_stalls_m(stall, other)
                            ),
                        }
                        for other in stalls
                        if other.id != stall.id
                        and other.election_id == stall.election_id
                        and _get_distance_between_stalls_m(stall, other) <= 100
                    ],
                }
            )

        return Response(response)


class MatchUnofficialStallView(generics.GenericAPIView):
    """
    API endpoint that links a pending unofficial stall to an official polling place (once those are loaded), leaving it pending for the regular triage UI.
    """

    queryset = Stalls.objects
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request, pk=None, format=None):
        # Lock the row so concurrent triage requests are serialised
        stall = Stalls.objects.select_for_update().get(pk=self.get_object().pk)

        if stall.status != StallStatus.PENDING:
            return Response(
                {
                    "error": f"Oops! This submission was already {stall.status.lower()} by {stall.triaged_by.first_name.split(' ')[0]}."
                },
                status=status.HTTP_418_IM_A_TEAPOT,
            )

        if stall.polling_place is not None or stall.location_info is None:
            raise BadRequest("Stall is not an unofficial polling place submission")

        if stall.election.polling_places_loaded is False:
            raise BadRequest("Election doesn't have official polling places loaded yet")

        pollingPlace = PollingPlaces.objects.filter(
            id=request.data.get("polling_place_id", None),
            election_id=stall.election_id,
            status=PollingPlaceStatus.ACTIVE,
        ).first()

        if pollingPlace is None:
            raise BadRequest("Polling place not found in this election")

        stall.polling_place = pollingPlace
        stall.save()

        return Response({})


class ApproveUnofficialStallView(generics.GenericAPIView):
    """
    API endpoint that approves an unofficial stall and adds its user-provided location as a polling place.
    """

    queryset = Stalls.objects
    permission_classes = (IsAuthenticated,)

    @transaction.atomic
    def post(self, request, pk=None, format=None):
        # Lock the row so concurrent triage requests are serialised
        stall = Stalls.objects.select_for_update().get(pk=self.get_object().pk)

        if stall.status != StallStatus.PENDING:
            return Response(
                {
                    "error": f"Oops! This submission was already {stall.status.lower()} by {stall.triaged_by.first_name.split(' ')[0]}."
                },
                status=status.HTTP_418_IM_A_TEAPOT,
            )

        if stall.polling_place is not None or stall.location_info is None:
            raise BadRequest("Stall is not an unofficial polling place submission")

        if stall.election.is_active() is False:
            raise BadRequest("This election is no longer active")

        if stall.election.polling_places_loaded is True:
            raise BadRequest("Election polling places already loaded")

        pollingPlaceState = _get_polling_place_state(stall)
        if pollingPlaceState is None:
            raise BadRequest(
                "Unofficial stalls can't be approved for federal elections"
            )

        nomsSerializer = PollingPlaceNomsSerializer(
            data={
                "noms": stall.noms,
                "name": stall.name,
                "description": stall.description,
                "opening_hours": stall.opening_hours,
                "website": stall.website,
            },
            # The reverse polling_place relation is otherwise required
            partial=True,
        )

        if nomsSerializer.is_valid() is True:
            noms = nomsSerializer.save()
            update_change_reason(noms, PollingPlaceNomsChangeReason.APPROVED_UNOFFICIAL)
        else:
            raise BadRequest(nomsSerializer.errors)

        pollingPlace = PollingPlaces.objects.create(
            election=stall.election,
            noms=noms,
            geom=_get_location_info_point(stall),
            name=stall.location_info["name"],
            premises="",
            address=stall.location_info["address"],
            state=pollingPlaceState,
            facility_type=None,
            wheelchair_access=PollingPlaceWheelchairAccess.UNKNOWN,
            status=PollingPlaceStatus.ACTIVE,
        )

        serializer = StallsManagementSerializer(
            stall,
            data={
                "status": StallStatus.APPROVED,
                "triaged_on": datetime.now(pytz.utc),
                "triaged_by": request.user.id,
                "polling_place": pollingPlace.id,
            },
            partial=True,
        )

        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise BadRequest(serializer.errors)
