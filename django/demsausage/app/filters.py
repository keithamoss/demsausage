from django.db.models import Q
from django_filters import rest_framework as filters
from rest_framework.exceptions import APIException

from demsausage.app.models import PollingPlaces


class IntegerListFilter(filters.Filter):
    """
    Accept comma separated string of integers as value and convert it to list.

    Useful for __in lookups.
    """

    def filter(self, qs, value):
        if value not in (None, ""):
            try:
                integers = [int(v) for v in value[0:1000].split(",")]
            except Exception as e:
                raise APIException(e)

            return super(IntegerListFilter, self).filter(qs, integers)
        return qs


class LonLatFilter(filters.Filter):
    """
    Accept comma separated string of integers as value and convert it to list.

    Useful for __in lookups.
    """

    def filter(self, qs, value):
        if value not in (None, ""):
            from django.contrib.gis.geos import Point
            from demsausage.app.sausage.polling_places import find_by_distance

            try:
                lon, lat = [float(v) for v in value[0:1000].split(",")]
                search_point = Point(float(lon), float(lat), srid=4326)
            except Exception as e:
                raise APIException(e)

            polling_places_filter = find_by_distance(search_point, distance_threshold_km=50, limit=15, qs=qs)
            if polling_places_filter.count() == 0:
                polling_places_filter = find_by_distance(search_point, distance_threshold_km=1000, limit=15, qs=qs)
            return polling_places_filter
        return qs


class NamePremisesOrAddressFilter(filters.BaseCSVFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value not in (None, ""):
            for search_term in value:
                qs = qs.filter(Q(name__icontains=search_term) | Q(premises__icontains=search_term) | Q(address__icontains=search_term))

        return qs


class PollingPlacesFilter(filters.FilterSet):
    election_id = filters.NumberFilter(field_name="election_id", required=True)
    ids = IntegerListFilter(field_name="id", lookup_expr="in")
    search_term = NamePremisesOrAddressFilter()
    lonlat = LonLatFilter(field_name="lonlat")

    class Meta:
        model = PollingPlaces
        fields = ("election_id", "ids", "search_term", "lonlat", )


class PollingPlacesNearbyFilter(PollingPlacesFilter):
    lonlat = LonLatFilter(field_name="lonlat")

    class Meta:
        model = PollingPlaces
        fields = ("election_id", "ids", "lonlat", )
