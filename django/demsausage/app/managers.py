from django.db import models

from demsausage.app.sausage.polling_places import find_by_distance


class PollingPlacesManager(models.Manager):
    def find_by_distance(self, election_id, search_point, distance_threshold_km, limit):
        from demsausage.app.models import PollingPlaces
        return find_by_distance(search_point, distance_threshold_km, limit, PollingPlaces.objects.filter(election_id=election_id))
