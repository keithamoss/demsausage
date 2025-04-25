from datetime import datetime

import pytz
from demsausage.app.enums import (
    MetaPollingPlaceTaskCategory,
    MetaPollingPlaceTaskOutcome,
    MetaPollingPlaceTaskStatus,
    MetaPollingPlaceTaskType,
    PollingPlaceState,
)
from demsausage.app.exceptions import BadRequest
from demsausage.app.models import (
    Elections,
    MetaPollingPlaces,
    MetaPollingPlacesLinks,
    MetaPollingPlacesRemarks,
    MetaPollingPlacesTasks,
    PollingPlaces,
)
from demsausage.app.sausage.polling_places import get_active_polling_place_queryset
from demsausage.app.serializers import (
    MetaPollingPlacesLinksCreateSerializer,
    MetaPollingPlacesLinksRetrieveSerializer,
    MetaPollingPlacesLinksUpdateSerializer,
    MetaPollingPlacesRetrieveSerializer,
    MetaPollingPlacesTasksCreateSerializer,
    MetaPollingPlacesTasksSerializer,
)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db import transaction
from django.db.models import Count, F, Max, Q
from django.http import HttpResponseBadRequest


class MetaPollingPlacesTasksViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """

    queryset = MetaPollingPlacesTasks.objects
    serializer_class = MetaPollingPlacesTasksSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action in ["create", "createCompletedTask"]:
            return MetaPollingPlacesTasksCreateSerializer
        # elif self.action in ["update", "partial_update"]:
        #     return MetaPollingPlacesLinksUpdateSerializer
        return super().get_serializer_class()

    @action(
        detail=True,
        methods=["post"],
    )
    @transaction.atomic
    def close(self, request, pk=None, format=None):
        task = self.get_object()
        remarks = request.data.get("remarks", None)

        if task.status != MetaPollingPlaceTaskStatus.IN_PROGRESS:
            raise BadRequest("This task isn't in progress.")

        if remarks is not None and isinstance(remarks, str) and len(remarks) > 0:
            mpp_remarks = MetaPollingPlacesRemarks(
                meta_polling_place_task_id=task.id,
                meta_polling_place_id=task.meta_polling_place.id,
                text=remarks,
                user_id=request.user.id,
            )

            try:
                mpp_remarks.full_clean()
            except Exception as e:
                return HttpResponseBadRequest(f"Error creating remarks: {e}")

            mpp_remarks.save()

        task.status = MetaPollingPlaceTaskStatus.COMPLETED
        task.outcome = MetaPollingPlaceTaskOutcome.CLOSED
        task.actioned_on = datetime.now(pytz.utc)
        task.actioned_by_id = request.user.id
        task.save()

        return Response()

    @action(
        detail=True,
        methods=["post"],
    )
    @transaction.atomic
    def defer(self, request, pk=None, format=None):
        task = self.get_object()
        remarks = request.data.get("remarks", None)

        if task.status != MetaPollingPlaceTaskStatus.IN_PROGRESS:
            raise BadRequest("This task isn't in progress.")

        if remarks is not None and isinstance(remarks, str) and len(remarks) > 0:
            mpp_remarks = MetaPollingPlacesRemarks(
                meta_polling_place_task_id=task.id,
                meta_polling_place_id=task.meta_polling_place.id,
                text=remarks,
                user_id=request.user.id,
            )

            try:
                mpp_remarks.full_clean()
            except Exception as e:
                return HttpResponseBadRequest(f"Error creating remarks: {e}")

            mpp_remarks.save()

        task.status = MetaPollingPlaceTaskStatus.COMPLETED
        task.outcome = MetaPollingPlaceTaskOutcome.DEFERRED
        task.actioned_on = datetime.now(pytz.utc)
        task.actioned_by_id = request.user.id
        task.save()

        return Response()

    @action(
        detail=True,
        methods=["post"],
    )
    @transaction.atomic
    def complete(self, request, pk=None, format=None):
        task = self.get_object()

        if task.status != MetaPollingPlaceTaskStatus.IN_PROGRESS:
            raise BadRequest("This task isn't in progress.")

        task.status = MetaPollingPlaceTaskStatus.COMPLETED
        task.outcome = MetaPollingPlaceTaskOutcome.COMPLETED
        task.actioned_on = datetime.now(pytz.utc)
        task.actioned_by_id = request.user.id
        task.save()

        return Response()

    @action(
        detail=False,
        methods=["post"],
    )
    @transaction.atomic
    def createCompletedTask(self, request, *args, **kwargs):
        data = request.data.copy()

        data["status"] = MetaPollingPlaceTaskStatus.COMPLETED
        data["outcome"] = MetaPollingPlaceTaskOutcome.COMPLETED
        data["actioned_on"] = datetime.now(pytz.utc)
        data["actioned_by"] = request.user.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response()

    @transaction.atomic
    def list(self, request):
        # @TODO Once we decide if jobs can have different types of task, revisit this and either put it in as a constraint on the model or adapt this and the UI to handle multiple task types.
        queryset = (
            MetaPollingPlacesTasks.objects.filter(
                status=MetaPollingPlaceTaskStatus.IN_PROGRESS
            )
            .values("job_name")
            .annotate(task_count=Count("job_name"))
            .annotate(max_created_on=Max("created_on"))
            .annotate(category=Max("category"))
            .annotate(type=Max("type"))
            .order_by("-max_created_on")
        )

        return Response(
            queryset.values(
                "job_name", "task_count", "max_created_on", "category", "type"
            )
        )

    @action(
        # detail=True,
        # methods=["post"],
        detail=False,
        methods=["get"],
        permission_classes=(IsAuthenticated,),
        # serializer_class=ElectionsSerializer,
    )
    @transaction.atomic
    def next(self, request, format=None):
        job_name = request.query_params.get("job_name", None)

        if job_name is None:
            return HttpResponseBadRequest("job_name is required")

        task = (
            MetaPollingPlacesTasks.objects.filter(
                job_name=job_name, status=MetaPollingPlaceTaskStatus.IN_PROGRESS
            )
            .order_by("created_on")
            .first()
        )

        if task is not None:
            serializer = self.serializer_class(
                task,
                many=False,
            )

            return Response(serializer.data)
        else:
            return Response()

    @action(
        detail=False,
        methods=["post"],
        permission_classes=(IsAuthenticated,),
        # serializer_class=ElectionsSerializer,
    )
    @transaction.atomic
    def create_job(self, request, format=None):
        election_id = request.data.get("election_id", None)
        max_tasks = request.data.get("max_tasks", 5)
        deferred_tasks_included = request.data.get("deferred_tasks_included", False)
        jurisdiction = request.data.get("jurisdiction", "")

        if (
            election_id is None
            or Elections.objects.filter(id=election_id).exists() is False
        ):
            return HttpResponseBadRequest("election_id is required")

        job_name = (
            f"Facebook Research - {datetime.today().strftime('%-d %B %Y %H:%M:%S')}"
        )

        exclusionFilter = (
            Q(outcome__isnull=True) | Q(outcome=MetaPollingPlaceTaskOutcome.DEFERRED)
            if deferred_tasks_included is False
            else Q(outcome__isnull=True)
        )

        pollingPlaces = (
            get_active_polling_place_queryset()
            .filter(election_id=election_id)
            .filter(noms__isnull=True)
            # Exclude any MPPs that already have an active task, or deferred (config dependent), of this type
            .exclude(
                meta_polling_place__in=MetaPollingPlacesTasks.objects.filter(
                    exclusionFilter
                )
                .filter(category=MetaPollingPlaceTaskCategory.CROWDSOURCING)
                .filter(type=MetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK)
                .values_list("meta_polling_place", flat=True)
            )
            # Exclude any MPPs that were part of a task of this type with in the last 2 days
            # .exclude(
            #     meta_polling_place__in=MetaPollingPlacesTasks.objects.filter(
            #         actioned_on__date__gte=timezone.now() - timedelta(days=2)
            #     )
            #     .filter(category=MetaPollingPlaceTaskCategory.CROWDSOURCING)
            #     .filter(type=MetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK)
            #     .values_list("meta_polling_place", flat=True)
            # )
            .order_by("geom")
            .order_by(F("chance_of_sausage").desc(nulls_last=True))
        )

        # Allow constraining polling places to a specific jurisdiction
        if jurisdiction != "":
            pollingPlaces = pollingPlaces.filter(state=jurisdiction)

        metaPollingPlaceIds = []

        for pollingPlace in pollingPlaces[:max_tasks]:
            # Just a safeguard against an MPP being used twice in a given election
            # We'll have other things to protect against this, but they can still slip
            # through at the moment.
            if pollingPlace.meta_polling_place.id not in metaPollingPlaceIds:
                mpp_task = MetaPollingPlacesTasks(
                    meta_polling_place_id=pollingPlace.meta_polling_place.id,
                    job_name=job_name,
                    category=MetaPollingPlaceTaskCategory.CROWDSOURCING,
                    type=MetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK,
                )

                try:
                    mpp_task.full_clean()
                except Exception as e:
                    return HttpResponseBadRequest(f"Error creating task: {e}")

                mpp_task.save()
                metaPollingPlaceIds.append(pollingPlace.meta_polling_place.id)

        return Response(
            {
                "job_name": job_name,
                "tasks_created": MetaPollingPlacesTasks.objects.filter(
                    job_name=job_name
                ).count(),
            }
        )

    # @action(
    #     detail=False,
    #     methods=["get", "delete"],
    #     permission_classes=(AnonymousOnlyGET,),
    #     serializer_class=ElectionsSerializer,
    # )
    # def public(self, request, format=None):
    #     """
    #     Retrieve a list of all publicly visible elections that have been, or will be, available.
    #     """
    #     cache_key = get_elections_cache_key()

    #     if request.method == "GET":
    #         serializer = ElectionsSerializer(
    #             Elections.objects.filter(is_hidden=False).order_by("-election_day"),
    #             many=True,
    #         )

    #         cache.set(cache_key, json.dumps(serializer.data))
    #         return Response(serializer.data)

    #     elif request.method == "DELETE":
    #         cache.delete(cache_key)
    #         return Response()

    # @action(
    #     detail=False,
    #     methods=["get"],
    #     permission_classes=(AnonymousOnlyGET,),
    #     serializer_class=ElectionsSerializer,
    # )
    # def upcoming(self, request, format=None):
    #     """
    #     Retrieve a list of all elections coming up in the near future.
    #     """
    #     serializer = ElectionsSerializer(
    #         Elections.objects.filter(is_hidden=True, is_test=False)
    #         .filter(election_day__lte=make_aware(datetime.now()) + timedelta(weeks=12))
    #         .order_by("-election_day"),
    #         many=True,
    #     )

    #     return Response(serializer.data)


class MetaPollingPlacesLinksViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """

    queryset = MetaPollingPlacesLinks.objects
    serializer_class = MetaPollingPlacesLinksRetrieveSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.action in ["create"]:
            return MetaPollingPlacesLinksCreateSerializer
        elif self.action in ["update", "partial_update"]:
            return MetaPollingPlacesLinksUpdateSerializer
        return super().get_serializer_class()

    # @TODO How do we turn off bits of ModelViewSet that we don't want?


class MetaPollingPlacesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows MetaPollingPlaces to be viewed and edited.
    """

    queryset = MetaPollingPlaces.objects
    serializer_class = MetaPollingPlacesRetrieveSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        # if self.action in ["create"]:
        #     return MetaPollingPlacesLinksCreateSerializer
        # elif self.action in ["update", "partial_update"]:
        #     return MetaPollingPlacesLinksUpdateSerializer
        return super().get_serializer_class()

    @action(
        detail=False,
        methods=["post"],
    )
    @transaction.atomic
    def rearrange_from_mpp_review(self, request):
        ######################
        # IMPORTANT!
        # We're using `BadRequest` throughout rather than nicer `HttpResponseBadRequest`
        # so that any errors or issues that arise cause all changes to be rolledback
        # inside the transaction.
        ######################
        moves = request.data.get("moves", None)
        splits = request.data.get("splits", None)

        if moves is None or splits is None:
            return HttpResponseBadRequest("Invalid input")

        ######################
        # Process Moves:
        # These are Polling Places that are moving to existing Meta Polling Place(s)
        ######################
        metaPollingPlaceIdsLosingPollingPlaces = []
        metaPollingPlaceIdsGainingPollingPlaces = []

        if len(moves) > 0:
            # Repoint each Polling Place to the requested Meta Polling Place
            for item in moves:
                if "pollingPlaceId" in item and "metaPollingPlaceId" in item:
                    if (
                        MetaPollingPlaces.objects.filter(
                            id=item["metaPollingPlaceId"]
                        ).first()
                        is None
                    ):
                        raise BadRequest(
                            "Processing moves: A Meta Polling Place doesn't exist"
                        )

                    pp = PollingPlaces.objects.filter(id=item["pollingPlaceId"]).first()

                    if pp is None:
                        raise BadRequest(
                            "Processing moves: A Polling Place doesn't exist"
                        )

                    if (
                        pp.meta_polling_place_id
                        not in metaPollingPlaceIdsLosingPollingPlaces
                    ):
                        metaPollingPlaceIdsLosingPollingPlaces.append(
                            pp.meta_polling_place_id
                        )

                    pp.meta_polling_place_id = item["metaPollingPlaceId"]
                    pp.save()

                    if (
                        item["metaPollingPlaceId"]
                        not in metaPollingPlaceIdsGainingPollingPlaces
                    ):
                        metaPollingPlaceIdsGainingPollingPlaces.append(
                            item["metaPollingPlaceId"]
                        )

            # Ensure we haven't just created any orphan MPPs
            for metaPollingPlaceId in metaPollingPlaceIdsLosingPollingPlaces:
                if (
                    PollingPlaces.objects.filter(
                        meta_polling_place=metaPollingPlaceId
                    ).count()
                    == 0
                ):
                    raise BadRequest(
                        "Unable to process polling place moves. This would create an orphan Meta Polling Place."
                    )

        ######################
        # Process Splits:
        # These are Polling Places that are moving to a brand new draft Meta Polling Place
        ######################
        metaPollingPlaceIdsLosingPollingPlaces = []
        pollingPlaceIdsToSplit = []

        for pollingPlaceId in splits:
            if (
                isinstance(pollingPlaceId, int) is True
                and PollingPlaces.objects.filter(id=pollingPlaceId).first() is not None
            ):
                pollingPlaceIdsToSplit.append(pollingPlaceId)
            else:
                raise BadRequest(
                    f"'{pollingPlaceId}' is not a number or is not a valid Polling Place"
                )

        if len(pollingPlaceIdsToSplit) > 0:
            pollingPlacesToSplit = PollingPlaces.objects.filter(
                id__in=pollingPlaceIdsToSplit
            )

            # Create a brand new draft Meta Polling Place
            # Even though we've reviewed its Polling Places, it still needs to be a draft so
            # we can populate its core info later.
            firstPollingPlace = pollingPlacesToSplit.order_by(
                "-election__election_day", "id"
            ).first()

            mpp = MetaPollingPlaces(
                name=firstPollingPlace.name,
                premises=firstPollingPlace.premises,
                jurisdiction=(
                    firstPollingPlace.state
                    if firstPollingPlace.state != PollingPlaceState.Overseas
                    else None
                ),
                overseas=firstPollingPlace.state == PollingPlaceState.Overseas,
                geom_location=firstPollingPlace.geom,
                wheelchair_access=firstPollingPlace.wheelchair_access,
            )

            try:
                mpp.full_clean()
                mpp.save(force_insert=True)
            except Exception as e:
                raise BadRequest(
                    f"Error creating MPP: {firstPollingPlace.name} (#{firstPollingPlace.id})"
                )

            # Now move all of the Polling Places to our brand new Meta Polling Place
            for pollingPlace in pollingPlacesToSplit:
                if (
                    pollingPlace.meta_polling_place_id
                    not in metaPollingPlaceIdsLosingPollingPlaces
                ):
                    metaPollingPlaceIdsLosingPollingPlaces.append(
                        pollingPlace.meta_polling_place_id
                    )

                pollingPlace.meta_polling_place_id = mpp.id

                pollingPlace.save()

            # Ensure we haven't just created any orphan Meta Polling Places
            for metaPollingPlaceId in metaPollingPlaceIdsLosingPollingPlaces:
                if (
                    PollingPlaces.objects.filter(
                        meta_polling_place=metaPollingPlaceId
                    ).count()
                    == 0
                ):
                    raise BadRequest(
                        "Unable to process polling place splits. This would create an orphan Meta Polling Place."
                    )

        return Response()

    # @TODO How do we turn off bits of ModelViewSet that we don't want?
