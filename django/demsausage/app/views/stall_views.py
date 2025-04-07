from copy import deepcopy
from datetime import datetime

import pytz
from demsausage.app.enums import StallStatus, StallSubmitterType
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import Stalls
from demsausage.app.permissions import StallEditingPermissions
from demsausage.app.sausage.elections import (
    get_active_elections,
    getGamifiedElectionStats,
    is_it_election_day,
)
from demsausage.app.sausage.mailgun import (
    send_stall_approved_email,
    send_stall_edited_email,
    send_stall_submitted_email,
)
from demsausage.app.serializers import (
    PendingStallsSerializer,
    PollingPlaceNomsSerializer,
    StallsManagementSerializer,
    StallsOwnerManagementSerializer,
    StallsOwnerUserEditSerializer,
    StallsSerializer,
    StallsTipOffManagementSerializer,
    StallsTipOffUserEditSerializer,
)
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from simple_history.utils import update_change_reason

from django.db import transaction


class StallsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stalls to be viewed and edited.
    """

    queryset = Stalls.objects
    serializer_class = StallsSerializer
    permission_classes = (StallEditingPermissions,)
    schema = None

    def get_serializer_class(self):
        if self.action == "retrieve" or self.action == "update_and_resubmit":
            stall = self.get_object()

            if stall.submitter_type in [
                StallSubmitterType.TIPOFF,
                StallSubmitterType.TIPOFF_RUN_OUT,
                StallSubmitterType.TIPOFF_RED_CROSS_OF_SHAME,
            ]:
                return StallsTipOffUserEditSerializer
            elif stall.submitter_type == StallSubmitterType.OWNER:
                return StallsOwnerUserEditSerializer
            else:
                raise BadRequest(f"Unhandled submitter_type '{stall.submitter_type}'")
        return super(StallsViewSet, self).get_serializer_class()

    @transaction.atomic
    def create(self, request, format=None):
        if "election" in request.data:
            if get_active_elections().filter(id=request.data["election"]).count() == 0:
                raise BadRequest("This election is no longer active")

            if "submitter_type" in request.data:
                if request.data["submitter_type"] in [
                    StallSubmitterType.TIPOFF,
                    StallSubmitterType.TIPOFF_RUN_OUT,
                    StallSubmitterType.TIPOFF_RED_CROSS_OF_SHAME,
                ]:
                    serializer = StallsTipOffManagementSerializer(data=request.data)
                elif request.data["submitter_type"] == StallSubmitterType.OWNER:
                    serializer = StallsOwnerManagementSerializer(data=request.data)
                else:
                    raise BadRequest(
                        f"Unhandled submitter_type '{request.data['submitter_type']}'"
                    )
            else:
                raise BadRequest("No submitter_type supplied")

            if (
                request.data["submitter_type"]
                in [
                    StallSubmitterType.TIPOFF_RUN_OUT,
                    StallSubmitterType.TIPOFF_RED_CROSS_OF_SHAME,
                ]
                and is_it_election_day(request.data["election"]) is False
            ):
                raise BadRequest("These tip-offs can only be submitted on election day")

            if request.data["submitter_type"] == StallSubmitterType.TIPOFF_RUN_OUT:
                request.data["noms"].update({"run_out": True})

            if serializer is not None:
                if serializer.is_valid() is True:
                    serializer.save()

                    send_stall_submitted_email(
                        Stalls.objects.get(id=serializer.instance.id)
                    )
                    return Response({}, status=status.HTTP_201_CREATED)
                else:
                    raise BadRequest(serializer.errors)
            else:
                raise BadRequest(
                    "Could not locate a valid serializer for the submitter_type '{submitter_type}'".format(
                        request.data["submitter_type"]
                    )
                )
        raise BadRequest("No election supplied")

    def retrieve(self, request, *args, **kwargs):
        stall = self.get_object()

        if stall.election.is_active() is False:
            return Response(
                {
                    "error": "The {election_name} election has finished.".format(
                        election_name=stall.election.name
                    )
                },
                status=status.HTTP_418_IM_A_TEAPOT,
            )

        return super(StallsViewSet, self).retrieve(request, *args, **kwargs)

    @action(detail=True, methods=["patch"])
    @transaction.atomic
    def update_and_resubmit(self, request, pk=None, format=None):
        stall = self.get_object()

        if stall.election.is_active() is False:
            return Response(
                {
                    "error": "The {election_name} election has finished.".format(
                        election_name=stall.election.name
                    )
                },
                status=status.HTTP_418_IM_A_TEAPOT,
            )

        if stall.submitter_type in [
            StallSubmitterType.TIPOFF_RUN_OUT,
            StallSubmitterType.TIPOFF_RED_CROSS_OF_SHAME,
        ]:
            raise BadRequest(
                "Tip offs for a stall that've run out of food, or polling places without stalls, can't be edited."
            )

        data = deepcopy(request.data)
        del data["token"]
        del data["signature"]

        if stall.status == StallStatus.APPROVED or stall.status == StallStatus.DECLINED:
            data["status"] = StallStatus.PENDING

        data["owner_edit_timestamp"] = datetime.now(pytz.utc)

        serializer = self.get_serializer_class()(stall, data, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_edited_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def approve(self, request, pk=None, format=None):
        stall = self.get_object()

        if stall.status != StallStatus.PENDING:
            return Response(
                {
                    "error": f"Oops! This submission was already {stall.status.lower()} by {stall.triaged_by.first_name.split(' ')[0]}."
                },
                status=status.HTTP_418_IM_A_TEAPOT,
            )

        # Update the PollingPlaceNoms with the data included from the noms form
        serializer = PollingPlaceNomsSerializer(
            stall.polling_place.noms,
            data=request.data.get("pollingPlaceNoms", None),
            partial=True,
        )

        if serializer.is_valid() is True:
            noms = serializer.save()

            update_change_reason(
                noms,
                f"Approved and {request.data.get('approvalType', None)}",
            )

            # If we've created the noms, we need to link it up to the polling place
            if stall.polling_place.noms is None:
                stall.polling_place.noms_id = noms.id
                stall.polling_place.save()
        else:
            raise BadRequest(serializer.errors)

        # Approve the Stall itself
        serializer = StallsManagementSerializer(
            self.get_object(),
            data={
                "status": StallStatus.APPROVED,
                "triaged_on": datetime.now(pytz.utc),
                "triaged_by": request.user.id,
            },
            partial=True,
        )

        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    # @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    # @transaction.atomic
    # def approve_and_add(self, request, pk=None, format=None):
    #     stall = self.get_object()
    #     if stall.status != StallStatus.PENDING:
    #         raise BadRequest("Stall is not pending")

    #     if stall.election.polling_places_loaded is True:
    #         raise BadRequest("Election polling places already loaded")

    #     # @TODO Handle updating PollingPlaceNomsSerializer as per approve()

    #     # Create polling place based on user-submitted location info
    #     pollingPlaceSerializer = PollingPlacesManagementSerializer(
    #         data={
    #             "geom": stall.location_info["geom"],
    #             "name": stall.location_info["name"],
    #             "address": stall.location_info["address"],
    #             "state": stall.location_info["state"],
    #             "facility_type": None,
    #             "election": stall.election.id,
    #             "status": PollingPlaceStatus.ACTIVE,
    #             "wheelchair_access": PollingPlaceWheelchairAccess.UNKNOWN,
    #         }
    #     )

    #     if pollingPlaceSerializer.is_valid() is True:
    #         pollingPlaceSerializer.save()
    #     else:
    #         raise BadRequest(pollingPlaceSerializer.errors)

    #     # Now that we have a polling place, add noms
    #     pollingPlaceWithNomsSerializer = PollingPlacesManagementSerializer(
    #         pollingPlaceSerializer.instance,
    #         data={
    #             "stall": {
    #                 "noms": stall.noms,
    #                 "name": stall.name,
    #                 "description": stall.description,
    #                 "opening_hours": stall.opening_hours,
    #                 "website": stall.website,
    #             },
    #         },
    #         partial=True,
    #     )

    #     if pollingPlaceWithNomsSerializer.is_valid() is True:
    #         pollingPlaceWithNomsSerializer.save()
    #     else:
    #         raise BadRequest(pollingPlaceWithNomsSerializer.errors)

    #     # Approve stall and link it to the new unofficial polling place we just added
    #     serializer = StallsManagementSerializer(
    #         stall,
    #         data={
    #             "status": StallStatus.APPROVED,
    #             "triaged_on": datetime.now(pytz.utc),
    #             "triaged_by": request.user.id,
    #             "polling_place": pollingPlaceSerializer.instance.id,
    #         },
    #         partial=True,
    #     )
    #     if serializer.is_valid() is True:
    #         serializer.save()

    #         send_stall_approved_email(Stalls.objects.get(id=stall.id))
    #         return Response({})
    #     else:
    #         raise BadRequest(serializer.errors)

    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def decline(self, request, pk=None, format=None):
        stall = self.get_object()
        if stall.status != StallStatus.PENDING:
            raise BadRequest("Stall is not pending")

        serializer = StallsManagementSerializer(
            self.get_object(),
            data={
                "status": StallStatus.DECLINED,
                "triaged_on": datetime.now(pytz.utc),
                "triaged_by": request.user.id,
            },
            partial=True,
        )
        if serializer.is_valid() is True:
            serializer.save()

            return Response({})
        else:
            raise BadRequest(serializer.errors)


class PendingStallsViewSet(generics.ListAPIView):
    """
    API endpoint that allows pending stalls to be viewed and edited.
    """

    queryset = Stalls.objects.filter(status=StallStatus.PENDING).order_by("-id")
    serializer_class = PendingStallsSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        def _get_latest_changes(electionId):
            data = []

            for stall in (
                Stalls.history.filter(election_id=electionId)
                .filter(status__in=[StallStatus.APPROVED, StallStatus.DECLINED])
                .order_by("-triaged_on")[:24]
            ):
                data.append(
                    {
                        "history_id": stall.history_id,
                        "datetime": stall.triaged_on,
                        "triaged_by": stall.triaged_by.first_name.split(" ")[0],
                        "status": stall.status,
                        "stall_id": stall.id,
                        "polling_place_name": stall.polling_place.name,
                        "polling_place_id": stall.polling_place.id,
                    }
                )

            return data

        stalls = self.serializer_class(self.get_queryset(), many=True).data

        data = {}

        # Initialise with containers for each of the active elections
        for e in get_active_elections():
            data[e.id] = {}

        # This reshapes the stall-centric view of the world to be polling-place based so
        # we can show pending stalls on the same polling places grouped together in the UI
        for stall in stalls:
            if stall["election_id"] not in data:
                data[stall["election_id"]] = {}

            # Support elections WITH polling places loaded
            # NOTE: In future this will need to support follow-up submissions on unofficial polling places that have already been approved
            if stall["polling_place"] is not None:
                if stall["polling_place"]["id"] not in data[stall["election_id"]]:
                    data[stall["election_id"]][stall["polling_place"]["id"]] = stall[
                        "polling_place"
                    ] | {"pending_stalls": []}

                stallSansPollingPlace = stall.copy()
                del stallSansPollingPlace["polling_place"]
                data[stall["election_id"]][stall["polling_place"]["id"]][
                    "pending_stalls"
                ].append(stallSansPollingPlace)

            # Support elections WITHOUT polling places loaded
            # else:
            #     pollingPlaceStalls = Stalls.objects.filter(
            #         election_id=stall["election_id"]
            #     ).filter(location_info=stall["location_info"])

            #     if stall["location_info"]["address"] not in response:
            #         response[stall["location_info"]["address"]] = stall[
            #             "location_info"
            #         ] | {
            #             "id_unofficial": sha256(
            #                 stall["location_info"]["address"].encode("utf-8")
            #             ).hexdigest(),
            #             "election_id": stall["election_id"],
            #             "premises": "",
            #             "stall": None,
            #             "pending_stalls": [],
            #             "previous_subs": {
            #                 "approved": pollingPlaceStalls.filter(
            #                     Q(status=StallStatus.APPROVED)
            #                     | Q(previous_status=StallStatus.APPROVED)
            #                 ).count(),
            #                 "approved_owner_subs": pollingPlaceStalls.filter(
            #                     Q(status=StallStatus.APPROVED)
            #                     | Q(previous_status=StallStatus.APPROVED)
            #                 )
            #                 .filter(Q(submitter_type=StallSubmitterType.OWNER))
            #                 .count(),
            #                 "denied": pollingPlaceStalls.filter(
            #                     Q(status=StallStatus.DECLINED)
            #                     | Q(previous_status=StallStatus.DECLINED)
            #                 ).count(),
            #             },
            #         }

            #     stallSansPollingPlace = stall.copy()
            #     del stallSansPollingPlace["location_info"]
            #     response[stall["location_info"]["address"]]["pending_stalls"].append(
            #         stallSansPollingPlace
            #     )

        response = []
        for electionId in data:
            response.append(
                {
                    "election_id": electionId,
                    "latest_changes": _get_latest_changes(electionId),
                    "stats": getGamifiedElectionStats(electionId),
                    "booths": data[electionId].values(),
                }
            )

        return Response(response)
