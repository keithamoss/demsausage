import json
from copy import deepcopy
from datetime import datetime

import pytz
from demsausage.app.enums import (PollingPlaceStatus,
                                  PollingPlaceWheelchairAccess, StallStatus,
                                  StallSubmitterType)
from demsausage.app.exceptions import BadRequest
from demsausage.app.filters import (LonLatFilter, PollingPlacesBaseFilter,
                                    PollingPlacesNearbyFilter,
                                    PollingPlacesSearchFilter)
from demsausage.app.models import (Elections, PollingPlaceFacilityType,
                                   PollingPlaces, Stalls)
from demsausage.app.permissions import (AnonymousOnlyGET,
                                        StallEditingPermissions)
from demsausage.app.renderers import PNGRenderer
from demsausage.app.sausage.elections import (
    get_active_elections, get_default_election,
    get_default_election_map_png_cache_key, get_election_map_png_cache_key,
    get_elections_cache_key, get_polling_place_geojson_cache_key,
    get_polling_place_json_cache_key)
from demsausage.app.sausage.loader import RollbackPollingPlaces
from demsausage.app.sausage.mailgun import (make_confirmation_hash,
                                            send_stall_approved_email,
                                            send_stall_edited_email,
                                            send_stall_submitted_email,
                                            verify_webhook)
from demsausage.app.sausage.polling_places import (
    data_quality, find_by_distance, find_by_lookup_terms, find_by_stall,
    get_active_polling_place_queryset)
from demsausage.app.sausage.sausagelytics import (FederalSausagelytics,
                                                  StateSausagelytics)
from demsausage.app.serializers import (ElectionsSerializer,
                                        ElectionsStatsSerializer,
                                        MailgunEventsSerializer,
                                        PendingStallsSerializer,
                                        PollingPlaceFacilityTypeSerializer,
                                        PollingPlaceSearchResultsSerializer,
                                        PollingPlacesFlatJSONSerializer,
                                        PollingPlacesGeoJSONSerializer,
                                        PollingPlacesManagementSerializer,
                                        PollingPlacesSerializer,
                                        StallsManagementSerializer,
                                        StallsOwnerManagementSerializer,
                                        StallsSerializer,
                                        StallsTipOffManagementSerializer,
                                        StallsUserEditSerializer,
                                        UserSerializer)
from demsausage.app.webdriver import get_map_screenshot
from demsausage.rq.jobs import (task_generate_election_map_screenshot,
                                task_regenerate_cached_election_data)
from demsausage.rq.jobs_loader import task_refresh_polling_place_data
from demsausage.rq.rq_utils import get_redis_connection
from demsausage.util import add_datetime_to_filename, get_or_none, make_logger
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView
from rest_framework_csv.renderers import CSVRenderer
from rq.job import Job

from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.contrib.gis.db.models import Extent
from django.contrib.gis.geos import Point
from django.core.cache import cache
from django.db import transaction
from django.db.models import Func
from django.http import HttpResponseBadRequest, HttpResponseNotFound

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

    @action(detail=False, methods=["post"])
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

    @action(detail=False, methods=["get", "delete"], permission_classes=(AnonymousOnlyGET,), serializer_class=ElectionsSerializer)
    def public(self, request, format=None):
        """
        Retrieve a list of all publicly visible elections that have been, or will be, available.
        """
        cache_key = get_elections_cache_key()

        if request.method == "GET":
            serializer = ElectionsSerializer(Elections.objects.filter(is_hidden=False).order_by("-election_day"), many=True)

            cache.set(cache_key, json.dumps(serializer.data))
            return Response(serializer.data)

        elif request.method == "DELETE":
            cache.delete(cache_key)
            return Response()

    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,), serializer_class=ElectionsSerializer)
    @transaction.atomic
    def set_primary(self, request, pk=None, format=None):
        self.get_queryset().filter(is_primary=True).update(is_primary=False)

        serializer = ElectionsSerializer(self.get_object(), data={"is_primary": True}, partial=True)
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @action(detail=True, methods=["put"], permission_classes=(IsAuthenticated,), parser_classes=(MultiPartParser,))
    def polling_places(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if str(request.data.get("dry_run", 0)) == "1" else False
        config = request.data.get("config", None)
        try:
            if config is not None and len(config) > 0:
                config = json.loads(config)
        except ValueError as e:
            raise BadRequest("Could not parse config: {}".format(e))

        job = task_refresh_polling_place_data.delay(election_id=election.id, file=request.data["file"], dry_run=dry_run, config=config)
        return Response({"job_id": job.id if job is not None else None})

    @action(detail=True, methods=["get"], permission_classes=(IsAuthenticated,))
    def polling_place_loader_job(self, request, pk=None, format=None):
        job_id = request.query_params.get("job_id", None)

        if job_id is not None:
            job = Job.fetch(job_id, connection=get_redis_connection())
            jobStatus = job.get_status()

            response = None
            if jobStatus == "finished":
                response = {"message": "Done", "logs": job.meta.get("_polling_place_loading_results", None)}

            return Response({"status": jobStatus, "stages_log": job.meta.get("_polling_place_loading_stages_log", None), "response": response})
        raise BadRequest("No job_id provided")

    @action(detail=True, methods=["post"], permission_classes=(IsAuthenticated,))
    @transaction.atomic
    def polling_places_rollback(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if request.data.get("dry_run", None) == "1" else False

        rollback = RollbackPollingPlaces(election, dry_run)
        rollback.run()

        if rollback.is_dry_run() is True:
            # Regenerate GeoJSON because the loader does this and transactions don't help us here :)
            task_regenerate_cached_election_data.delay(election_id=election.id)
            raise BadRequest({"message": "Rollback", "logs": rollback.collects_logs()})
        rollback.collects_logs()
        return Response({})

    @action(detail=True, methods=["get"], permission_classes=(AllowAny,))
    def stats(self, request, pk=None, format=None):
        election = self.get_object()

        if election.id in [1, 29]:
            # No data for the first election because we don't have the vote counts in the 'extras' field
            # No data for the 2020 NT Election because COVID :(
            return HttpResponseNotFound()
        elif election.is_federal is True:
            stats = FederalSausagelytics(election)
        else:
            stats = StateSausagelytics(election)
        return Response(stats.get_stats())

    @action(detail=True, methods=["get"], permission_classes=(IsAuthenticated,))
    def data_quality(self, request, pk=None, format=None):
        election = self.get_object()

        if election.id != 27:
            return HttpResponseNotFound()

        report = data_quality(election)
        return Response({"report": report})


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
    queryset = get_active_polling_place_queryset().all().order_by("-id")
    serializer_class = PollingPlacesSerializer
    permission_classes = (IsAuthenticated,)
    renderer_classes = tuple(api_settings.DEFAULT_RENDERER_CLASSES) + (CSVRenderer, )

    def list(self, request, *args, **kwargs):
        self.filter_class = PollingPlacesBaseFilter
        return super(PollingPlacesViewSet, self).list(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(PollingPlacesViewSet, self).finalize_response(request, response, *args, **kwargs)

        # Customise the filename for CSV downloads
        if response.status_code == 200 and "text/csv" in response.accepted_media_type:
            election = get_or_none(Elections, id=request.query_params.get("election_id", None))
            if election is not None:
                filename = add_datetime_to_filename("{}.csv".format(election.name))

                response["Content-Type"] = "Content-Type: text/csv; name=\"{}\"".format(filename)
                response["Content-Disposition"] = "attachment; filename={}".format(filename)

        return response

    @action(detail=False, methods=["get"])
    def without_facility_type(self, request, format=None):
        election_id = request.query_params.get("election_id", None)
        if election_id is not None:
            serializer = self.serializer_class(self.queryset.filter(election_id=election_id).filter(facility_type__isnull=True), many=True)
            return Response(serializer.data)
        else:
            raise BadRequest("No election_id provided.")

    @action(detail=False, methods=["get"])
    def favourited(self, request, format=None):
        election_id = request.query_params.get("election_id", None)
        if election_id is not None:
            serializer = self.serializer_class(self.queryset.filter(election_id=election_id).filter(noms__isnull=False, noms__favourited=True).order_by("-noms__id"), many=True)
            return Response(serializer.data)
        else:
            raise BadRequest("No election_id provided.")

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def lookup(self, request, format=None):
        """
        Lookup the details for an individual polling place by its name + premises + state or its ec_id field.
        """
        election_id = request.query_params.get("election_id", None)
        lookup_terms = {
            "ec_id": request.query_params.get("ec_id", None),
            "name": request.query_params.get("name", None),
            "premises": request.query_params.get("premises", None),
            "state": request.query_params.get("state", None),
        }

        if election_id is not None:
            pollingPlace = find_by_lookup_terms(election_id, lookup_terms, self.queryset)
            if pollingPlace is not None:
                return Response(self.serializer_class(pollingPlace).data)
            return HttpResponseNotFound()
        else:
            raise BadRequest("No election_id provided.")

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def stall_lookup(self, request, format=None):
        """
        Lookup the details for an individual polling place by the id of the stall attached to it.
        """
        stall_id = request.query_params.get("stall_id", None)

        if stall_id is not None:
            pollingPlace = find_by_stall(stall_id, self.queryset)
            if pollingPlace is not None:
                return Response(self.serializer_class(pollingPlace).data)
            return HttpResponseNotFound()
        else:
            raise BadRequest("No stall_id provided.")

    @action(detail=False, methods=["get"], permission_classes=(AllowAny,))
    def nearby_bbox(self, request, format=None):
        """
        Retrieve the bounding box of the 15 polling places closest to a given latitude, longitude.

        Uses the same parameters as /polling_places/nearby/
        """
        election_id = request.query_params.get("election_id", None)
        lonlat = request.query_params.get("lonlat", None)

        if election_id is None or election_id == "":
            raise BadRequest("No election_id provided.")

        if lonlat is None or lonlat == "":
            raise BadRequest("No lonlat provided.")

        polling_places_filter = LonLatFilter().filter(get_active_polling_place_queryset().filter(election_id=election_id), lonlat)
        extent = polling_places_filter.annotate(geom_as_geometry=Func("geom", template="geom::geometry")).aggregate(Extent("geom_as_geometry"))

        pollingPlaceSerializer = PollingPlaceSearchResultsSerializer(polling_places_filter, many=True)

        return Response({"extent_wgs84": extent["geom_as_geometry__extent"], "polling_places": pollingPlaceSerializer.data})


class PollingPlacesSearchViewSet(generics.ListAPIView):
    """
    Search the polling places for an election.
    """
    queryset = get_active_polling_place_queryset()
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesSearchFilter


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    Retrieve a list of all polling places that are close to a given latitude, longitude.
    """
    queryset = get_active_polling_place_queryset()
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesGeoJSONViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Retrieve a list of all polling places and their food stall attributes for a given election in GeoJSON format.
    """
    queryset = get_active_polling_place_queryset()
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
        if 'election_id' in request.data:
            cache_key_geojson = get_polling_place_geojson_cache_key(request.data['election_id'])
            cache.delete(cache_key_geojson)

            cache_key_json = get_polling_place_json_cache_key(request.data['election_id'])
            cache.delete(cache_key_json)

            cache_key_map_png = get_election_map_png_cache_key(request.data['election_id'])
            cache.delete(cache_key_map_png)

            defaultElection = get_default_election()
            if defaultElection is not None and defaultElection.id == request.data['election_id']:
                cache_key_default_map_png = get_default_election_map_png_cache_key()
                cache.delete(cache_key_default_map_png)

            task_regenerate_cached_election_data.delay(election_id=request.data['election_id'])

            return Response({})
        else:
            return HttpResponseBadRequest()


class PollingPlacesJSONViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Retrieve a list of all polling places and their food stall attributes for a given election as a set of flat JSON objects.
    """
    queryset = get_active_polling_place_queryset()
    serializer_class = PollingPlacesFlatJSONSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesBaseFilter

    def list(self, request, format=None):
        response = super(PollingPlacesJSONViewSet, self).list(request, format)

        cache_key = get_polling_place_json_cache_key(request.query_params.get("election_id"))
        cache.set(cache_key, json.dumps(response.data))
        return response


class ElectionMapStaticImageViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Retrieve a static embeddable image of an election map.
    """
    queryset = Elections.objects
    renderer_classes = (PNGRenderer,)
    permission_classes = (AllowAny,)

    # A screenshot of a specific election
    def retrieve(self, request, pk=None, format=None):
        # We've gotten past the NGINX caching layer, so we can assume there's nothing in memcached right now
        # So let's fire off a job to cache an image for this election...
        task_generate_election_map_screenshot.delay(election_id=pk)

        # ...and return the pre-generated static image of the 2019 Federal Election (it's better than nothing!)
        try:
            with open('/app/demsausage/static_maps/federal_2019_australia.png', 'rb') as f:
                default_map_png = f.read()
                return Response(default_map_png)
        except:
            return HttpResponseBadRequest()

    # Hacky hacky...make this all work better
    def list(self, request, format=None):
        # We've gotten past the NGINX caching layer, so we can assume there's nothing in memcached right now

        primaryElection = get_default_election()
        if primaryElection is not None:
            # So let's fire off a job to cache an image for this election...
            task_generate_election_map_screenshot.delay(election_id=primaryElection.id)

            # ...and return the pre-generated static image of the 2019 Federal Election (it's better than nothing!)
            try:
                with open('/app/demsausage/static_maps/federal_2019_australia.png', 'rb') as f:
                    default_map_png = f.read()
                    return Response(default_map_png)
            except:
                return HttpResponseBadRequest()


class ElectionMapStaticImageCurrentDefaultElectionViewSet(APIView):
    permission_classes = (AllowAny,)
    queryset = Elections.objects
    renderer_classes = (PNGRenderer,)

    # A screenshot of the default election (i.e. the current active primary election) for use where no specific election needs to be shown
    def get(self, request):
        # We've gotten past the NGINX caching layer, so we can assume there's nothing in memcached right now

        primaryElection = get_default_election()
        if primaryElection is not None:
            # So let's fire off a job to cache an image for this election...
            task_generate_election_map_screenshot.delay(election_id=primaryElection.id)

            # ...and return the pre-generated static image of the 2019 Federal Election (it's better than nothing!)
            try:
                with open('/app/demsausage/static_maps/federal_2019_australia.png', 'rb') as f:
                    default_map_png = f.read()
                    return Response(default_map_png)
            except:
                return HttpResponseBadRequest()

    # We were seeing a fair number of HEAD requests for the default map image.
    # (Presumably from the crawlers building the social previews? Or someother bot doing things there?)
    # Not sure why it was only the default and not a specific election. I guess because the homepage uses
    # the default map image?
    # Anyway, this is a hacky fix for that.
    # Couldn't find a good way to make the old ElectionMapStaticImageViewSet.list() route respond to HEAD
    # requests, so this is the workaround.
    # I guess we could also have done it in NGINX by terminating there and returning a 200 OK? Meh.
    def head(self, request):
        return Response()


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
        if "election" in request.data:
            if get_active_elections().filter(id=request.data["election"]).count() == 0:
                raise BadRequest("This election is no longer active")
            
            # @TODO Once the legacy site is gone, use the code below that requires a submitter_type
            if "submitter_type" in request.data and request.data["submitter_type"] == StallSubmitterType.TIPOFF:
                serializer = StallsTipOffManagementSerializer(data=request.data)
            else:
                serializer = StallsOwnerManagementSerializer(data=request.data)
            
            if serializer is not None:
                if serializer.is_valid() is True:
                    serializer.save()

                    send_stall_submitted_email(Stalls.objects.get(id=serializer.instance.id))
                    return Response({}, status=status.HTTP_201_CREATED)
                else:
                    raise BadRequest(serializer.errors)
            else:
                raise BadRequest("Could not locate a valid serializer for the submitter_type '{submitter_type}'".format(request.data["submitter_type"]))

            # if "submitter_type" in request.data:
            #     if request.data["submitter_type"] == StallSubmitterType.OWNER:
            #         serializer = StallsOwnerManagementSerializer(data=request.data)
            #     elif request.data["submitter_type"] == StallSubmitterType.TIPOFF:
            #         serializer = StallsTipOffManagementSerializer(data=request.data)

            #     if serializer is not None:
            #         if serializer.is_valid() is True:
            #             serializer.save()

            #             send_stall_submitted_email(Stalls.objects.get(id=serializer.instance.id))
            #             return Response({}, status=status.HTTP_201_CREATED)
            #         else:
            #             raise BadRequest(serializer.errors)
            #     else:
            #         raise BadRequest("Could not locate a valid serializer for the submitter_type '{submitter_type}'".format(request.data["submitter_type"]))
            
            # raise BadRequest("No submitter_type supplied")
        raise BadRequest("No election supplied")

    def retrieve(self, request, *args, **kwargs):
        stall = self.get_object()

        if stall.election.is_active() is False:
            raise BadRequest("The {election_name} election has already finished.".format(election_name=stall.election.name))

        return super(StallsViewSet, self).retrieve(request, *args, **kwargs)

    @action(detail=True, methods=["patch"])
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

    @action(detail=True, methods=["patch"], permission_classes=(IsAuthenticated,))
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

    @action(detail=True, methods=["patch"], permission_classes=(IsAuthenticated,))
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
            "wheelchair_access": PollingPlaceWheelchairAccess.UNKNOWN
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
            "opening_hours": stall.opening_hours,
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

    @action(detail=False, methods=["get"])
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

    @action(detail=False, methods=["post"])
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
