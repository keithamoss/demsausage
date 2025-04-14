import json
import urllib.parse

from demsausage.app.enums import (
    PollingPlaceChanceOfSausage,
    PollingPlaceHistoryEventType,
    PollingPlaceStatus,
    StallStatus,
)
from demsausage.app.exceptions import BadRequest
from demsausage.app.filters import (
    LonLatFilter,
    PollingPlacesBaseFilter,
    PollingPlacesNearbyFilter,
    PollingPlacesSearchFilter,
)
from demsausage.app.models import (
    Elections,
    PollingPlaceFacilityType,
    PollingPlaceNoms,
    PollingPlaces,
    Stalls,
)
from demsausage.app.sausage.elections import (
    get_default_election,
    get_default_election_map_png_cache_key,
    get_election_map_png_cache_key,
    get_polling_place_geojson_cache_key,
    get_polling_place_json_cache_key,
)
from demsausage.app.sausage.polling_places import (
    find_by_lookup_terms,
    find_by_stall,
    get_active_polling_place_queryset,
)
from demsausage.app.serializers import (
    PollingPlaceFacilityTypeSerializer,
    PollingPlacesCSVDownloadSerializer,
    PollingPlaceSearchResultsSerializer,
    PollingPlacesFlatJSONSerializer,
    PollingPlacesGeoJSONSerializer,
    PollingPlacesSerializer,
    StallsSerializer,
)
from demsausage.rq.jobs import task_regenerate_cached_election_data
from demsausage.util import (
    add_datetime_to_filename,
    get_env,
    get_or_none,
    get_url_safe_election_name,
)
from rest_framework import generics, mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework_csv.renderers import CSVRenderer
from simple_history.utils import update_change_reason

from django.contrib.auth.models import User
from django.contrib.gis.db.models import Extent
from django.core.cache import cache
from django.db import transaction
from django.db.models import F, Func
from django.http import HttpResponseBadRequest, HttpResponseNotFound


class PollingPlacesViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoint that allows polling places to be viewed and edited.
    """

    queryset = get_active_polling_place_queryset().all().order_by("-id")
    serializer_class = PollingPlacesSerializer
    permission_classes = (IsAuthenticated,)
    renderer_classes = tuple(api_settings.DEFAULT_RENDERER_CLASSES) + (CSVRenderer,)

    def list(self, request, *args, **kwargs):
        if request.query_params.get("format", None) == "csv":
            self.serializer_class = PollingPlacesCSVDownloadSerializer

        self.filter_class = PollingPlacesBaseFilter
        return super(PollingPlacesViewSet, self).list(request, *args, **kwargs)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super(PollingPlacesViewSet, self).finalize_response(
            request, response, *args, **kwargs
        )

        # Customise the filename for CSV downloads
        if (
            response.status_code == 200
            and "text/csv" in response.accepted_media_type
            and "vollie_cos_task" not in request.get_full_path()
        ):
            election = get_or_none(
                Elections, id=request.query_params.get("election_id", None)
            )

            if election is not None:
                filename = add_datetime_to_filename("{}.csv".format(election.name))

                response["Content-Type"] = 'Content-Type: text/csv; name="{}"'.format(
                    filename
                )
                response["Content-Disposition"] = "attachment; filename={}".format(
                    filename
                )
        return response

    @transaction.atomic
    def update(self, request, pk=None, *args, **kwargs):
        pollingPlace = self.get_object()

        # Note: This handles both Creates *and* Updates
        response = super(PollingPlacesViewSet, self).update(
            request, pk, *args, **kwargs
        )

        if pollingPlace.noms is None:
            update_change_reason(self.get_object().noms, "Added directly")
        else:
            update_change_reason(self.get_object().noms, "Edited directly")

        return response

    @action(detail=False, methods=["get"])
    def vollie_cos_task(self, request, format=None):
        election_id = request.query_params.get("election_id", None)

        if election_id is None:
            raise BadRequest("No election_id provided.")

        election = Elections.objects.get(id=election_id)
        data = []

        for pollingPlace in PollingPlaces.objects.filter(
            election_id=election_id, status=PollingPlaceStatus.ACTIVE, noms_id=None
        ).order_by(F("chance_of_sausage").desc(nulls_last=True)):
            data.append(
                {
                    "name": pollingPlace.name,
                    "address": pollingPlace.address,
                    "assigned_to": "",
                    "status": "",
                    "chance_of_sausage": (
                        PollingPlaceChanceOfSausage(pollingPlace.chance_of_sausage).name
                        if pollingPlace.chance_of_sausage is not None
                        else "No Data"
                    ),
                    "edit_link": f"{get_env('SITE_BASE_URL')}/polling-places/{get_url_safe_election_name(election.name)}/{pollingPlace.id}/",
                    "google_link": f"https://www.google.com/search?q=Facebook+{urllib.parse.quote_plus(pollingPlace.name)}+{pollingPlace.state}",
                }
            )

        return Response(data)

    @action(detail=True, methods=["get"])
    def noms_history(self, request, pk=None, format=None):
        def get_user_name(userId):
            user = User.objects.get(pk=record.history_user_id)
            return (
                f"{user.first_name} {user.last_name}"
                if user.first_name is not None and user.last_name is not None
                else "Unknown User"
            )

        historyDiff = []
        pollingPlace = self.get_object()

        if pollingPlace.noms is not None:
            history = pollingPlace.noms.history.all()

            for idx, record in enumerate(history):
                deltaRecord = {
                    "history_id": record.history_id,
                    "history_date": record.history_date,
                    "history_change_reason": record.history_change_reason,
                    "history_type": record.history_type,
                    "history_user_name": get_user_name(record.history_user_id),
                }

                if record.prev_record is not None:
                    # Ref: https://django-simple-history.readthedocs.io/en/latest/history_diffing.html
                    delta = record.diff_against(record.prev_record)

                    deltaRecord.update(
                        {
                            "changed_fields": delta.changed_fields,
                            "changes": [
                                {"field": i.field, "old": i.old, "new": i.new}
                                for i in delta.changes
                            ],
                        }
                    )

                historyDiff.append(deltaRecord)

        return Response(historyDiff)

    @action(detail=True, methods=["get"])
    def related_stalls(self, request, pk=None, format=None):
        pollingPlace = self.get_object()
        stalls = Stalls.objects.filter(polling_place_id=pollingPlace.id).order_by(
            "-reported_timestamp"
        )

        serializer = StallsSerializer(stalls, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None, format=None):
        pollingPlace = self.get_object()
        history = []

        # Polling place noms change history
        if pollingPlace.noms is not None:
            for item in PollingPlaceNoms.history.filter(id=pollingPlace.noms_id):
                if item.history_change_reason == "Added directly":
                    history.append(
                        {
                            "timestamp": item.history_date,
                            "message": f"Noms added directly by {item.history_user.first_name.split(' ')[0]}",
                            "type": PollingPlaceHistoryEventType.ADDED_DIRECTLY,
                        }
                    )
                elif item.history_change_reason == "Edited directly":
                    history.append(
                        {
                            "timestamp": item.history_date,
                            "message": f"Noms edited directly by {item.history_user.first_name.split(' ')[0]}",
                            "type": PollingPlaceHistoryEventType.EDITED_DIRECTLY,
                        }
                    )
                elif item.history_change_reason in [
                    "Approved and merged automatically",
                    "Approved and merged by hand",
                ]:
                    # These are handled by the stall history below
                    pass
                else:
                    history.append(
                        {
                            "timestamp": item.history_date,
                            "message": "Noms UNKNOWN_HISTORY_EVENT",
                            "type": PollingPlaceHistoryEventType.UNKNOWN,
                        }
                    )

        # Stall change history
        for item in Stalls.history.filter(polling_place_id=pollingPlace.id):
            if item.status == StallStatus.PENDING and item.previous_status is None:
                history.append(
                    {
                        "timestamp": item.history_date,
                        "message": f"Submission #{item.id} received",
                        "type": PollingPlaceHistoryEventType.SUBMISSION_RECEIVED,
                    }
                )
            elif (
                item.status == StallStatus.PENDING
                and item.owner_edit_timestamp is not None
            ):
                history.append(
                    {
                        "timestamp": item.history_date,
                        "message": f"Submission #{item.id} was edited by its owner",
                        "type": PollingPlaceHistoryEventType.SUBMISSION_EDITED,
                    }
                )
            elif item.status == StallStatus.APPROVED:
                history.append(
                    {
                        "timestamp": item.history_date,
                        "message": f"Submission #{item.id} approved by {item.history_user.first_name.split(' ')[0]}",
                        "type": PollingPlaceHistoryEventType.SUBMISSION_APPROVED,
                    }
                )
            elif item.status == StallStatus.DECLINED:
                history.append(
                    {
                        "timestamp": item.history_date,
                        "message": f"Submission #{item.id} declined by {item.history_user.first_name.split(' ')[0]}",
                        "type": PollingPlaceHistoryEventType.SUBMISSION_DECLINED,
                    }
                )
            else:
                history.append(
                    {
                        "timestamp": item.history_date,
                        "message": f"Submission #{item.id} UNKNOWN_HISTORY_EVENT",
                        "type": PollingPlaceHistoryEventType.UNKNOWN,
                    }
                )

        history.sort(key=lambda x: x["timestamp"])

        for idx, item in enumerate(history):
            item.update({"id": idx + 1})

        return Response(reversed(history))

    @action(detail=True, methods=["delete"])
    @transaction.atomic
    def delete_polling_place_noms(self, request, pk=None, format=None):
        pollingPlace = self.get_object()

        if pollingPlace.noms is not None:
            pollingPlace.noms.deleted = True
            pollingPlace.noms._change_reason = "Deleted directly"
            pollingPlace.noms.save()

        return Response()

    @action(detail=False, methods=["get"])
    def without_facility_type(self, request, format=None):
        election_id = request.query_params.get("election_id", None)
        if election_id is not None:
            serializer = self.serializer_class(
                self.queryset.filter(election_id=election_id).filter(
                    facility_type__isnull=True
                ),
                many=True,
            )
            return Response(serializer.data)
        else:
            raise BadRequest("No election_id provided.")

    @action(detail=False, methods=["get"])
    def favourited(self, request, format=None):
        election_id = request.query_params.get("election_id", None)
        if election_id is not None:
            serializer = self.serializer_class(
                self.queryset.filter(election_id=election_id)
                .filter(noms__isnull=False, noms__favourited=True)
                .order_by("-noms__id"),
                many=True,
            )
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
            pollingPlace = find_by_lookup_terms(
                election_id, lookup_terms, self.queryset
            )
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

        polling_places_filter = LonLatFilter().filter(
            get_active_polling_place_queryset().filter(election_id=election_id), lonlat
        )
        extent = polling_places_filter.annotate(
            geom_as_geometry=Func("geom", template="geom::geometry")
        ).aggregate(Extent("geom_as_geometry"))

        pollingPlaceSerializer = PollingPlaceSearchResultsSerializer(
            polling_places_filter, many=True
        )

        return Response(
            {
                "extent_wgs84": extent["geom_as_geometry__extent"],
                "polling_places": pollingPlaceSerializer.data,
            }
        )

    @action(detail=True, methods=["patch"])
    @transaction.atomic
    def update_internal_notes(self, request, pk=None, format=None):
        pollingPlace = self.get_object()

        # This probably should be using a serializer, but whatevs.
        if "internal_notes" in request.data and pollingPlace is not None:
            pollingPlace.internal_notes = request.data["internal_notes"]
            pollingPlace.save()

        return Response()


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

        cache_key = get_polling_place_geojson_cache_key(
            request.query_params.get("election_id")
        )
        cache.set(cache_key, json.dumps(response.data))
        return response

    @action(methods=["delete"], permission_classes=(IsAuthenticated,), detail=False)
    def clear_cache(self, request, format=None):
        if "election_id" in request.data:
            cache_key_geojson = get_polling_place_geojson_cache_key(
                request.data["election_id"]
            )
            cache.delete(cache_key_geojson)

            cache_key_json = get_polling_place_json_cache_key(
                request.data["election_id"]
            )
            cache.delete(cache_key_json)

            cache_key_map_png = get_election_map_png_cache_key(
                request.data["election_id"]
            )
            cache.delete(cache_key_map_png)

            defaultElection = get_default_election()
            if (
                defaultElection is not None
                and defaultElection.id == request.data["election_id"]
            ):
                cache_key_default_map_png = get_default_election_map_png_cache_key()
                cache.delete(cache_key_default_map_png)

            task_regenerate_cached_election_data.delay(
                election_id=request.data["election_id"]
            )

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

        cache_key = get_polling_place_json_cache_key(
            request.query_params.get("election_id")
        )
        cache.set(cache_key, json.dumps(response.data))
        return response


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    Retrieve a list of all polling places that are close to a given latitude, longitude.
    """

    queryset = get_active_polling_place_queryset()
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesSearchViewSet(generics.ListAPIView):
    """
    Search the polling places for an election.
    """

    queryset = get_active_polling_place_queryset()
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesSearchFilter


class PollingPlaceFacilityTypeViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows polling place facility types to be viewed.
    """

    queryset = PollingPlaceFacilityType.objects
    serializer_class = PollingPlaceFacilityTypeSerializer
    permission_classes = (IsAuthenticated,)
