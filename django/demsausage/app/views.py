from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.core.cache import cache
from django.db import transaction

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route, detail_route
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
from demsausage.app.serializers import UserSerializer, ElectionsSerializer, ElectionsStatsSerializer, PollingPlaceFacilityTypeSerializer, PollingPlacesSerializer, PollingPlacesGeoJSONSerializer, PollingPlaceSearchResultsSerializer, StallsSerializer, PendingStallsSerializer, StallsManagementSerializer, PollingPlacesManagementSerializer, MailgunEventsSerializer
from demsausage.app.permissions import AnonymousOnlyList, AnonymousOnlyCreate
from demsausage.app.filters import PollingPlacesBaseFilter, PollingPlacesFilter, PollingPlacesNearbyFilter
from demsausage.app.enums import StallStatus, PollingPlaceStatus
from demsausage.app.sausage.mailgun import send_stall_approved_email, send_stall_submitted_email, check_confirmation_hash, verify_webhook
from demsausage.app.sausage.elections import get_cache_key, LoadPollingPlaces, RollbackPollingPlaces
from demsausage.util import make_logger, get_or_none, clean_filename

import datetime
import pytz

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
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
    queryset = Elections.objects
    serializer_class = ElectionsSerializer
    permission_classes = (AnonymousOnlyList,)

    def get_queryset(self):
        if self.request.user.is_anonymous is True:
            return self.queryset.filter(is_hidden=False).order_by("-id")
        return self.queryset.order_by("-id")

    def get_serializer_class(self):
        if self.request.user.is_anonymous is True:
            return self.serializer_class
        return ElectionsStatsSerializer

    @detail_route(methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def set_primary(self, request, pk=None, format=None):
        self.get_queryset().filter(is_primary=True).update(is_primary=False)

        serializer = ElectionsSerializer(self.get_object(), data={"is_primary": True}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise APIException(serializer.errors)

    @detail_route(methods=["put"], permission_classes=(IsAuthenticated,), parser_classes=(MultiPartParser,))
    @transaction.atomic
    def polling_places(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if request.data.get("dry_run", None) == "1" else False
        config = {
            "address_fields": [
                "Property Name",
                "Flat Number",
                "Street Number",
                "Street Name",
                "Street Type",
                "Locality",
                "Postcode",
                "Melway/Vicroads Ref"
            ],
            "address_format": "{Property Name}, {Flat Number} {Street Number} {Street Name} {Street Type}, {Locality} {Postcode}, {Melway/Vicroads Ref}",
            "division_fields": ["Electorate 1", "Electorate 2"]
        }

        loader = LoadPollingPlaces(election, request.data["file"], dry_run, config)
        loader.run()

        if loader.is_dry_run() is False:
            raise APIException({"message": "Rollback", "logs": loader.collects_logs()})
        raise APIException("Foo!")
        return Response({"message": "Done", "logs": loader.collects_logs()})

    @detail_route(methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def polling_places_rollback(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if request.data.get("dry_run", None) == "1" else False

        rollback = RollbackPollingPlaces(election, dry_run)
        rollback.run()

        if rollback.is_dry_run() is False:
            raise APIException({"message": "Rollback", "logs": rollback.collects_logs()})
        raise APIException("Foo!")
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
        self.filter_class = PollingPlacesFilter
        return super(PollingPlacesViewSet, self).list(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(PollingPlacesViewSet, self).finalize_response(request, response, *args, **kwargs)

        # Customise the filename for CSV downloads
        if "text/csv" in response.accepted_media_type:
            election = get_or_none(Elections, id=request.query_params.get("election_id", None))
            if election is not None:
                filename = clean_filename("{} - {}.csv".format(election.name, datetime.datetime.now(pytz.timezone(settings.TIME_ZONE)).replace(microsecond=0).replace(tzinfo=None).isoformat()))

                response["Content-Type"] = "Content-Type: text/csv; name=\"{}\"".format(filename)
                response["Content-Disposition"] = "attachment; filename={}".format(filename)

        return response


class PollingPlacesSearchViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be searched by their name or address.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesFilter


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be searched by a lat,lon coordinate pair.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesGeoJSONViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be retrieved as GeoJSON.
    """
    queryset = PollingPlaces.objects.select_related("noms").filter(status=PollingPlaceStatus.ACTIVE)
    serializer_class = PollingPlacesGeoJSONSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesBaseFilter

    def list(self, request, format=None):
        regenerate_cache = True if self.request.query_params.get("regenerate_cache", None) is not None else False
        cache_key = get_cache_key(self.request.query_params.get("election_id"))

        if regenerate_cache is False and cache_key in cache:
            return Response(cache.get(cache_key))

        response = super(PollingPlacesGeoJSONViewSet, self).list(request, format)
        cache.set(cache_key, response.data)

        if regenerate_cache is True:
            return Response({})
        return response


class StallsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stalls to be viewed and edited.
    """
    queryset = Stalls.objects
    serializer_class = StallsSerializer
    permission_classes = (AnonymousOnlyCreate,)

    def create(self, request, format=None):
        serializer = StallsManagementSerializer(data=request.data)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_submitted_email(Stalls.objects.get(id=serializer.instance.id))
            return Response({}, status=status.HTTP_201_CREATED)
        else:
            raise APIException(serializer.errors)

    @detail_route(methods=["patch"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def approve(self, request, pk=None, format=None):
        stall = self.get_object()
        if stall.status != StallStatus.PENDING:
            raise APIException("Stall is not pending")

        serializer = StallsManagementSerializer(self.get_object(), data={"status": StallStatus.APPROVED}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise APIException(serializer.errors)

    @detail_route(methods=["patch"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def approve_and_add(self, request, pk=None, format=None):
        stall = self.get_object()
        if stall.status != StallStatus.PENDING:
            raise APIException("Stall is not pending")

        if stall.election.polling_places_loaded is True:
            raise APIException("Election polling places already loaded")

        # Create polling place based on user-submitted location info
        pollingPlaceSerializer = PollingPlacesManagementSerializer(data={
            "stall": {
                "noms": stall.noms,
                "name": stall.name,
                "description": stall.description,
                "website": stall.website,
            },
            "geom": stall.location_info["geom"],
            "name": stall.location_info["name"],
            "address": stall.location_info["address"],
            "state": stall.location_info["state"],
            "facility_type": None,
            "election": stall.election.id,
        })

        if pollingPlaceSerializer.is_valid() is True:
            pollingPlaceSerializer.save()
        else:
            raise APIException(pollingPlaceSerializer.errors)

        # Approve stall and link it to the new unofficial polling place we just added
        serializer = StallsManagementSerializer(stall, data={"status": StallStatus.APPROVED, "polling_place": pollingPlaceSerializer.instance.id}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()

            send_stall_approved_email(Stalls.objects.get(id=stall.id))
            return Response({})
        else:
            raise APIException(serializer.errors)


class PendingStallsViewSet(generics.ListAPIView):
    """
    API endpoint that allows pending stalls to be viewed and edited.
    """
    queryset = Stalls.objects.filter(status=StallStatus.PENDING).order_by("-id")
    serializer_class = PendingStallsSerializer
    permission_classes = (IsAuthenticated,)


class MailManagementViewSet(viewsets.ViewSet):
    @list_route(methods=["get"])
    def opt_out(self, request, format=None):
        confirm_key = request.query_params.get("confirm_key", None)

        if confirm_key is None:
            raise APIException("Confirm key required")

        stall = get_or_none(Stalls, mail_confirm_key=confirm_key)

        if stall is None:
            raise APIException("Invalid confirm key")

        if stall.mail_confirmed is True:
            if check_confirmation_hash(stall.email, stall.id, confirm_key) is False:
                raise APIException("Confirmation key has expired")
            else:
                stall.mail_confirmed = False
                stall.save()

        return Response("No worries, we've removed you from our mailing list :)", content_type="text/html")

    @list_route(methods=["get"])
    def mailgun_webhook(self, request, format=None):
        token = request.data.get("token", None)
        timestamp = request.data.get("timestamp", None)
        signature = request.data.get("signature", None)
        event_type = request.data.get("event", None)

        if token is None or timestamp is None or signature is None:
            return Response({}, status=status.HTTP_406_NOT_ACCEPTABLE)

        if verify_webhook(token, timestamp, signature) is False:
            return Response({}, status=status.HTTP_406_NOT_ACCEPTABLE)

        serializer = MailgunEventsSerializer(data={
            "timestamp": timestamp,
            "event_type": event_type,
            "data": request.data,
        })
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise APIException(serializer.errors)
