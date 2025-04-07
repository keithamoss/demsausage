import json
from datetime import datetime, timedelta

from demsausage.app.exceptions import BadRequest
from demsausage.app.models import Elections
from demsausage.app.permissions import AnonymousOnlyGET
from demsausage.app.renderers import PNGRenderer
from demsausage.app.sausage.elections import (
    get_default_election,
    get_elections_cache_key,
)
from demsausage.app.sausage.loader import RollbackPollingPlaces
from demsausage.app.sausage.polling_places import data_quality
from demsausage.app.sausage.sausagelytics import (
    FederalSausagelytics,
    StateSausagelytics,
)
from demsausage.app.serializers import (
    ElectionsCreationSerializer,
    ElectionsSerializer,
    ElectionsStatsSerializer,
)
from demsausage.rq.jobs import (
    task_generate_election_map_screenshot,
    task_regenerate_cached_election_data,
)
from demsausage.rq.jobs_loader import task_refresh_polling_place_data
from demsausage.rq.rq_utils import get_redis_connection
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rq.job import Job

from django.core.cache import cache
from django.db import transaction
from django.http import HttpResponseBadRequest, HttpResponseNotFound
from django.utils.timezone import make_aware


class ElectionsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """

    queryset = Elections.objects.order_by("-election_day")
    serializer_class = ElectionsStatsSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action == "create":
            return ElectionsCreationSerializer
        return super(ElectionsViewSet, self).get_serializer_class()

    @action(
        detail=False,
        methods=["get", "delete"],
        permission_classes=(AnonymousOnlyGET,),
        serializer_class=ElectionsSerializer,
    )
    def public(self, request, format=None):
        """
        Retrieve a list of all publicly visible elections that have been, or will be, available.
        """
        cache_key = get_elections_cache_key()

        if request.method == "GET":
            serializer = ElectionsSerializer(
                Elections.objects.filter(is_hidden=False).order_by("-election_day"),
                many=True,
            )

            cache.set(cache_key, json.dumps(serializer.data))
            return Response(serializer.data)

        elif request.method == "DELETE":
            cache.delete(cache_key)
            return Response()

    @action(
        detail=False,
        methods=["get"],
        permission_classes=(AnonymousOnlyGET,),
        serializer_class=ElectionsSerializer,
    )
    def upcoming(self, request, format=None):
        """
        Retrieve a list of all elections coming up in the near future.
        """
        serializer = ElectionsSerializer(
            Elections.objects.filter(is_hidden=True, is_test=False)
            .filter(election_day__lte=make_aware(datetime.now()) + timedelta(weeks=12))
            .order_by("-election_day"),
            many=True,
        )

        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=(IsAuthenticated,),
        serializer_class=ElectionsSerializer,
    )
    @transaction.atomic
    def set_primary(self, request, pk=None, format=None):
        self.get_queryset().filter(is_primary=True).update(is_primary=False)

        serializer = ElectionsSerializer(
            self.get_object(), data={"is_primary": True}, partial=True
        )
        if serializer.is_valid() is True:
            serializer.save()
            return Response({})
        else:
            raise BadRequest(serializer.errors)

    @action(
        detail=True,
        methods=["put"],
        permission_classes=(IsAuthenticated,),
        parser_classes=(MultiPartParser,),
    )
    def polling_places(self, request, pk=None, format=None):
        election = self.get_object()
        dry_run = True if str(request.data.get("dry_run", 0)) == "1" else False
        config = request.data.get("config", None)
        try:
            if config is not None and len(config) > 0:
                config = json.loads(config)
        except ValueError as e:
            raise BadRequest("Could not parse config: {}".format(e))

        job = task_refresh_polling_place_data.delay(
            election_id=election.id,
            file=request.data["file"],
            dry_run=dry_run,
            config=config,
        )
        return Response({"job_id": job.id if job is not None else None})

    @action(detail=True, methods=["get"], permission_classes=(IsAuthenticated,))
    def polling_place_loader_job(self, request, pk=None, format=None):
        job_id = request.query_params.get("job_id", None)

        if job_id is not None:
            job = Job.fetch(job_id, connection=get_redis_connection())
            jobStatus = job.get_status()

            response = None
            if jobStatus == "finished":
                response = {
                    "message": "Done",
                    "logs": job.meta.get("_polling_place_loading_results", None),
                }

            return Response(
                {
                    "status": jobStatus,
                    "stages_log": job.meta.get(
                        "_polling_place_loading_stages_log", None
                    ),
                    "response": response,
                }
            )
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
                with open(
                    "/app/demsausage/static_maps/federal_2019_australia.png", "rb"
                ) as f:
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
            with open(
                "/app/demsausage/static_maps/federal_2019_australia.png", "rb"
            ) as f:
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
                with open(
                    "/app/demsausage/static_maps/federal_2019_australia.png", "rb"
                ) as f:
                    default_map_png = f.read()
                    return Response(default_map_png)
            except:
                return HttpResponseBadRequest()
