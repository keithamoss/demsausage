from django.core.cache import cache

from demsausage.app.models import PollingPlaces
from demsausage.app.serializers import PollingPlacesGeoJSONSerializer


def regenerate_election_geojson(election_id):
    polling_places = PollingPlacesGeoJSONSerializer(PollingPlaces.objects.select_related("noms").filter(election_id=election_id), many=True)
    cache.set(get_cache_key(election_id), polling_places.data)


def get_cache_key(electionId):
    return "election_{}_polling_places_geojson".format(electionId)
