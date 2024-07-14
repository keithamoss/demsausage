import json

from demsausage.rq.rq_utils import log_task_debug_info
from demsausage.util import make_logger
from django_rq import job
from rq import Retry, get_current_job

from django.core.cache import cache

logger = make_logger(__name__)


@job("cache_hydration", timeout=90, meta={"_custom_job_name": "task_regenerate_cached_election_data_{election_id}", "_ensure_task_is_unique_in_scheduled_jobs": True})
def task_regenerate_cached_election_data(election_id):
    log_task_debug_info(get_current_job())

    from demsausage.app.enums import PollingPlaceStatus
    from demsausage.app.models import Elections, PollingPlaces
    from demsausage.app.sausage.elections import (
        get_default_election, get_default_election_map_png_cache_key,
        get_election_map_png_cache_key, get_polling_place_geojson_cache_key,
        get_polling_place_json_cache_key)
    from demsausage.app.serializers import (PollingPlacesFlatJSONSerializer,
                                            PollingPlacesGeoJSONSerializer)
    from demsausage.app.webdriver import get_map_screenshot

    queryset = PollingPlaces.objects.select_related("noms").filter(election_id=election_id, status=PollingPlaceStatus.ACTIVE)

    polling_places_geojson = PollingPlacesGeoJSONSerializer(queryset, many=True)
    cache.set(get_polling_place_geojson_cache_key(election_id), json.dumps(polling_places_geojson.data))

    polling_places_json = PollingPlacesFlatJSONSerializer(queryset, many=True)
    cache.set(get_polling_place_json_cache_key(election_id), json.dumps(polling_places_json.data))

    png_image = get_map_screenshot(Elections.objects.get(id=election_id))
    cache.set(get_election_map_png_cache_key(election_id), png_image)

    defaultElection = get_default_election()
    if defaultElection is not None and defaultElection.id == election_id:
        cache.set(get_default_election_map_png_cache_key(), png_image)


@job("cache_hydration", timeout=40, meta={"_custom_job_name": "task_generate_election_map_screenshot_{election_id}", "_ensure_task_is_unique_in_scheduled_jobs": True})
def task_generate_election_map_screenshot(election_id):
    log_task_debug_info(get_current_job())

    from demsausage.app.models import Elections
    from demsausage.app.sausage.elections import (
        get_default_election, get_default_election_map_png_cache_key,
        get_election_map_png_cache_key)
    from demsausage.app.webdriver import get_map_screenshot

    png_image = get_map_screenshot(Elections.objects.get(id=election_id))
    cache.set(get_election_map_png_cache_key(election_id), png_image)

    defaultElection = get_default_election()
    if defaultElection is not None and defaultElection.id == election_id:
        cache.set(get_default_election_map_png_cache_key(), png_image)
