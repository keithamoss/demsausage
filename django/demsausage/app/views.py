from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.core.cache import cache
from django.db import transaction

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route, detail_route, action
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.exceptions import APIException
from rest_framework import generics
from rest_framework import mixins
from rest_framework.settings import api_settings
from rest_framework_csv.renderers import CSVRenderer
from rest_framework.parsers import MultiPartParser

from demsausage.app.models import Elections, PollingPlaces, Stalls, PollingPlaceFacilityType
from demsausage.app.serializers import UserSerializer, ElectionsSerializer, ElectionsStatsSerializer, PollingPlaceFacilityTypeSerializer, PollingPlacesSerializer, PollingPlacesGeoJSONSerializer, PollingPlaceSearchResultsSerializer, StallsSerializer, PendingStallsSerializer, StallsUserEditSerializer, StallsManagementSerializer, PollingPlacesManagementSerializer, MailgunEventsSerializer
from demsausage.app.permissions import StallEditingPermissions, AnonymousOnlyGET
from demsausage.app.filters import PollingPlacesBaseFilter, PollingPlacesSearchFilter, PollingPlacesNearbyFilter
from demsausage.app.enums import StallStatus, PollingPlaceStatus
from demsausage.app.exceptions import BadRequest
from demsausage.app.sausage.mailgun import send_stall_approved_email, send_stall_submitted_email, send_stall_edited_email, make_confirmation_hash, verify_webhook
from demsausage.app.sausage.elections import get_polling_place_geojson_cache_key, get_elections_cache_key, LoadPollingPlaces, RollbackPollingPlaces, regenerate_election_geojson
from demsausage.util import make_logger, get_or_none, add_datetime_to_filename

from datetime import datetime
from copy import deepcopy
import pytz
import json

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
    permission_classes = (AllowAny,)
    schema = None

    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(
                request.user, context={"request": request}
            )

            return Response({
                "is_logged_in": True,
                "user": serializer.data
            })
        else:
            return Response({
                "is_logged_in": False,
                "user": None
            })


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)
        return Response({})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)


class ProfileViewSet(viewsets.ViewSet):
    """
    API endpoint that allows user profiles to be viewed and edited.
    """
    permission_classes = (IsAuthenticated,)

    @list_route(methods=["post"])
    def update_settings(self, request):
        request.user.profile.merge_settings(request.data)
        request.user.profile.save()
        return Response({"settings": request.user.profile.settings})


class ElectionsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """
    queryset = Elections.objects.order_by("-id")
    serializer_class = ElectionsStatsSerializer
    permission_classes = (IsAuthenticated,)

    @list_route(methods=["get", "delete"], permission_classes=(AnonymousOnlyGET,), serializer_class=ElectionsSerializer)
    def public(self, request, format=None):
        """
        Retrieve a list of all publicly visible elections that have been, or will be, available.
        """
        cache_key = get_elections_cache_key()

        if request.method == "GET":
            serializer = ElectionsSerializer(Elections.objects.filter(is_hidden=False).order_by("-id"), many=True)

            cache.set(cache_key, json.dumps(serializer.data))
            return Response(serializer.data)

        elif request.method == "DELETE":
            cache.delete(cache_key)
            return Response()

    @detail_route(methods=["post"], permission_classes=(IsAuthenticated,), serializer_class=ElectionsSerializer)
    @transaction.atomic
    def set_primary(self, request, pk=None, format=None):
        self.get_queryset().filter(is_primary=True).update(is_primary=False)

        serializer = ElectionsSerializer(self.get_object(), data={"is_primary": True}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @detail_route(methods=["put"], permission_classes=(IsAuthenticated,), parser_classes=(MultiPartParser,))
    @transaction.atomic
    def polling_places(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if str(request.data.get("dry_run", 0)) == "1" else False
        config = request.data.get("config", None)
        try:
            if config is not None and len(config) > 0:
                config = json.loads(config)
        except ValueError as e:
            raise BadRequest("Could not parse config: {}".format(e))

        loader = LoadPollingPlaces(election, request.data["file"], dry_run, config)
        loader.run()

        if loader.is_dry_run() is True:
            # Regenerate GeoJSON because the loader does this and transactions don't help us here :)
            regenerate_election_geojson(election.id)
            raise BadRequest({"message": "Rollback", "logs": loader.collects_logs()})
        return Response({"message": "Done", "logs": loader.collects_logs()})

    @detail_route(methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def polling_places_rollback(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if request.data.get("dry_run", None) == "1" else False

        rollback = RollbackPollingPlaces(election, dry_run)
        rollback.run()

        if rollback.is_dry_run() is True:
            # Regenerate GeoJSON because the loader does this and transactions don't help us here :)
            regenerate_election_geojson(election.id)
            raise BadRequest({"message": "Rollback", "logs": rollback.collects_logs()})
        rollback.collects_logs()
        return Response({})


class PollingPlaceFacilityTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows polling place facility types to be viewed.
    """
    queryset = PollingPlaceFacilityType.objects
    serializer_class = PollingPlaceFacilityTypeSerializer
    permission_classes = (IsAuthenticated,)


class PollingPlacesViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows polling places to be viewed and edited.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE).all().order_by("-id")
    serializer_class = PollingPlacesSerializer
    permission_classes = (IsAuthenticated,)
    renderer_classes = tuple(api_settings.DEFAULT_RENDERER_CLASSES) + (CSVRenderer, )

    def list(self, request, *args, **kwargs):
        self.filter_class = PollingPlacesBaseFilter
        return super(PollingPlacesViewSet, self).list(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(PollingPlacesViewSet, self).finalize_response(request, response, *args, **kwargs)

        # Customise the filename for CSV downloads
        if "text/csv" in response.accepted_media_type:
            election = get_or_none(Elections, id=request.query_params.get("election_id", None))
            if election is not None:
                filename = add_datetime_to_filename("{}.csv".format(election.name))

                response["Content-Type"] = "Content-Type: text/csv; name=\"{}\"".format(filename)
                response["Content-Disposition"] = "attachment; filename={}".format(filename)

        return response

    @list_route(methods=["get"])
    def without_facility_type(self, request, format=None):
        election_id = request.query_params.get("election_id", None)
        if election_id is not None:
            serializer = self.serializer_class(self.queryset.filter(election_id=election_id).filter(facility_type__isnull=True), many=True)
            return Response(serializer.data)
        else:
            raise BadRequest("No election_id provided.")


class PollingPlacesSearchViewSet(generics.ListAPIView):
    """
    Search the polling places for an election.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesSearchFilter


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    Retrieve a list of all polling places that are close to a given latitude, longitude coordinate pair.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesGeoJSONViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Retrieve a list of all polling places and their food stall attributes for a given election in GeoJSON format.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlacesGeoJSONSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesBaseFilter

    def list(self, request, format=None):
        response = super(PollingPlacesGeoJSONViewSet, self).list(request, format)

        cache_key = get_polling_place_geojson_cache_key(request.query_params.get("election_id"))
        cache.set(cache_key, json.dumps(response.data))
        return response

    @action(methods=["delete"], permission_classes=(IsAuthenticated,), detail=False)
    def clear_cache(self, request, format=None):
        cache_key = get_polling_place_geojson_cache_key(request.query_params.get("election_id"))
        cache.delete(cache_key)
        return Response({})


class StallsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stalls to be viewed and edited.
    """
    queryset = Stalls.objects
    serializer_class = StallsSerializer
    permission_classes = (StallEditingPermissions,)
    schema = None

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StallsUserEditSerializer
        return super(StallsViewSet, self).get_serializer_class()

    @transaction.atomic
    def create(self, request, format=None):
        serializer = StallsManagementSerializer(data=request.data)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_submitted_email(Stalls.objects.get(id=serializer.instance.id))
            return Response({}, status=status.HTTP_201_CREATED)
        else:
            raise BadRequest(serializer.errors)

    def retrieve(self, request, *args, **kwargs):
        stall = self.get_object()

        if stall.election.is_active() is False:
            raise BadRequest("The {election_name} election has already finished.".format(election_name=stall.election.name))

        return super(StallsViewSet, self).retrieve(request, *args, **kwargs)

    @detail_route(methods=["patch"])
    @transaction.atomic
    def update_and_resubmit(self, request, pk=None, format=None):
        stall = self.get_object()

        if stall.election.is_active() is False:
            raise BadRequest("The {election_name} election has already finished.".format(election_name=stall.election.name))

        data = deepcopy(request.data)
        del data["token"]
        del data["signature"]
        if stall.status == StallStatus.APPROVED or stall.status == StallStatus.DECLINED:
            data["status"] = StallStatus.PENDING

        serializer = StallsUserEditSerializer(stall, data, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_edited_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @detail_route(methods=["patch"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def approve(self, request, pk=None, format=None):
        stall = self.get_object()
        if stall.status != StallStatus.PENDING:
            raise BadRequest("Stall is not pending")

        serializer = StallsManagementSerializer(self.get_object(), data={
            "status": StallStatus.APPROVED,
            "approved_on": datetime.now(pytz.utc)
        }, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @detail_route(methods=["patch"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def approve_and_add(self, request, pk=None, format=None):
        stall = self.get_object()
        if stall.status != StallStatus.PENDING:
            raise BadRequest("Stall is not pending")

        if stall.election.polling_places_loaded is True:
            raise BadRequest("Election polling places already loaded")

        # Create polling place based on user-submitted location info
        pollingPlaceSerializer = PollingPlacesManagementSerializer(data={
            "geom": stall.location_info["geom"],
            "name": stall.location_info["name"],
            "address": stall.location_info["address"],
            "state": stall.location_info["state"],
            "facility_type": None,
            "election": stall.election.id,
            "status": PollingPlaceStatus.ACTIVE,
        })

        if pollingPlaceSerializer.is_valid() is True:
            pollingPlaceSerializer.save()
        else:
            raise BadRequest(pollingPlaceSerializer.errors)

        # Now that we have a polling place, add noms
        pollingPlaceWithNomsSerializer = PollingPlacesManagementSerializer(pollingPlaceSerializer.instance, data={"stall": {
            "noms": stall.noms,
            "name": stall.name,
            "description": stall.description,
            "website": stall.website,
        }, }, partial=True)

        if pollingPlaceWithNomsSerializer.is_valid() is True:
            pollingPlaceWithNomsSerializer.save()
        else:
            raise BadRequest(pollingPlaceWithNomsSerializer.errors)

        # Approve stall and link it to the new unofficial polling place we just added
        serializer = StallsManagementSerializer(stall, data={
            "status": StallStatus.APPROVED,
            "approved_on": datetime.now(pytz.utc),
            "polling_place": pollingPlaceSerializer.instance.id
        }, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
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


class MailManagementViewSet(viewsets.ViewSet):
    schema = None
    permission_classes = (AllowAny,)

    @list_route(methods=["get"])
    def opt_out(self, request, format=None):
        stall_id = request.query_params.get("stall_id", None)
        token = request.query_params.get("token", None)
        signature = request.query_params.get("signature", None)

        stall = get_or_none(Stalls, id=stall_id)

        if stall is None:
            raise APIException("Invalid confirmation key")

        if stall.mail_confirmed is True:
            if make_confirmation_hash(stall.id, token) != signature:
                raise APIException("Invalid confirmation key")
            else:
                stall.mail_confirmed = False
                stall.save()

        return Response("No worries, we've removed you from our mailing list :)", content_type="text/html")

    @list_route(methods=["post"])
    def mailgun_webhook(self, request, format=None):
        signature_data = request.data.get("signature", None)
        if signature_data is not None:
            timestamp = int(signature_data["timestamp"])
            token = signature_data["token"]
            signature = signature_data["signature"]

        event_data = request.data.get("event-data", None)
        if event_data is not None:
            event_type = event_data["event"]

        if timestamp is None or token is None or signature is None:
            return Response({"status": 1}, status=status.HTTP_406_NOT_ACCEPTABLE)

        if verify_webhook(token, timestamp, signature) is False:
            return Response({"status": 2}, status=status.HTTP_406_NOT_ACCEPTABLE)

        serializer = MailgunEventsSerializer(data={
            "timestamp": datetime.utcfromtimestamp(timestamp).strftime("%Y-%m-%dT%H:%M:%S"),
            "event_type": event_type,
            "payload": event_data,
        })
        if serializer.is_valid() is True:
            serializer.save()
            return Response({"status": "OK"})
        else:
            raise APIException(serializer.errors)
