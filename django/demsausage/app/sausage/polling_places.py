from django.contrib.gis import measure
from django.contrib.gis.db.models.functions import Distance


def find_by_distance(search_point, distance_threshold_km, limit, qs):
    return qs.filter(geom__distance_lte=(search_point, measure.Distance(km=distance_threshold_km))).annotate(distance_metres=Distance("geom", search_point)).order_by("distance_metres")[:limit]
