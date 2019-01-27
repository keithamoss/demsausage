from django.db import models


class PollingPlacesManager(models.Manager):
    def find_by_distance(self, election_id, search_point, distance_threshold_km, limit):
        from demsausage.app.models import PollingPlaces
        from django.contrib.gis import measure
        from django.contrib.gis.db.models.functions import Distance

        return PollingPlaces.objects.filter(election_id=election_id).filter(geom__distance_lte=(search_point, measure.Distance(km=distance_threshold_km))).annotate(distance_metres=Distance("geom", search_point)).order_by("distance_metres")[:limit]
