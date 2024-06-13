from demsausage.app.exceptions import BadRequest
from demsausage.app.models import PollingPlaces
from demsausage.util import is_one_of_these_things_in_this_other_thing
from django_filters import rest_framework as filters

from django.db.models import Q


class ValueInFilter(filters.BaseInFilter):
    def filter(self, qs, value):
        if value == []:
            raise BadRequest("Please supply at least one value to filter by")
        else:
            return super(ValueInFilter, self).filter(qs, value)


class NumberInFilter(ValueInFilter, filters.NumberFilter):
    pass


class StringInFilter(ValueInFilter, filters.CharFilter):
    pass


class NamePremisesOrAddressFilter(filters.BaseCSVFilter, filters.CharFilter):
    def filter(self, qs, value):
        if value == []:
            raise BadRequest("Please supply at least one value to filter by")
        elif value is not None:
            for search_term in value:
                qs = qs.filter(Q(name__icontains=search_term) | Q(premises__icontains=search_term) | Q(address__icontains=search_term))
        return qs


class LonLatFilter(filters.Filter):
    """
    Accept comma separated string of integers as value and convert it to list.

    Useful for __in lookups.
    """

    def filter(self, qs, value):
        if value not in (None, ""):
            from demsausage.app.sausage.polling_places import find_by_distance

            from django.contrib.gis.geos import Point

            try:
                lon, lat = [float(v) for v in value[0:1000].split(",")]
                search_point = Point(float(lon), float(lat), srid=4326)
            except Exception as e:
                raise BadRequest(e)

            polling_places_filter = find_by_distance(search_point, distance_threshold_km=50, limit=15, qs=qs)
            if polling_places_filter.count() == 0:
                polling_places_filter = find_by_distance(search_point, distance_threshold_km=1000, limit=15, qs=qs)
            return polling_places_filter
        return qs


class PollingPlacesBaseFilter(filters.FilterSet):
    election_id = filters.NumberFilter(field_name="election_id", required=True)

    class Meta:
        model = PollingPlaces
        fields = ("election_id", )


class PollingPlacesSearchFilter(PollingPlacesBaseFilter):
    ids = NumberInFilter(field_name="id", lookup_expr="in")
    search_term = NamePremisesOrAddressFilter()
    polling_place_names = StringInFilter(field_name="name", lookup_expr="in")

    class Meta:
        model = PollingPlaces
        fields = ("ids", "search_term", "polling_place_names", )

    def is_valid(self):
        searchParams = list(self.get_fields().keys())
        queryParams = list(self.request.query_params.keys())

        if is_one_of_these_things_in_this_other_thing(searchParams, queryParams) is False:
            raise BadRequest("Please supply a filter criteria: {}".format(", ".join(searchParams)))
        return super(PollingPlacesSearchFilter, self).is_valid()


class PollingPlacesNearbyFilter(PollingPlacesBaseFilter):
    lonlat = LonLatFilter(field_name="lonlat")

    class Meta:
        model = PollingPlaces
        fields = ("election_id", "lonlat", )
