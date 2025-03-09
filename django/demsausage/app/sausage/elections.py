from datetime import timedelta

from demsausage.app.models import Elections, PollingPlaceNoms, PollingPlaces
from demsausage.rq.jobs import task_regenerate_cached_election_data
from demsausage.util import make_logger

from django.contrib.auth.models import User
from django.core.cache import cache
from django.db.models import Count
from django.utils import timezone

logger = make_logger(__name__)


def clear_elections_cache():
    cache.delete(get_elections_cache_key())


def get_polling_place_geojson_cache_key(electionId):
    return "election_{}_polling_places_geojson".format(electionId)


def get_polling_place_json_cache_key(electionId):
    return "election_{}_polling_places_json".format(electionId)


def get_election_map_png_cache_key(electionId):
    return f"election_/api/0.1/map_image/{electionId}/_map_export_png"


def get_default_election_map_png_cache_key():
    return "current_election_map_export_png"


def get_elections_cache_key():
    return "elections_list"


def get_default_election():
    return Elections.objects.filter(is_primary=True).get()


def get_active_elections():
    return Elections.objects.filter(
        is_hidden=False, election_day__gte=timezone.now() - timedelta(days=1)
    )


def is_it_election_day(electionId):
    return (
        Elections.objects.filter(
            id=electionId, election_day__date=timezone.now()
        ).count()
        == 1
    )


def cache_rehydration_on_init_tasks():
    # Rehydrate the cache for all active elections (starting with the primary election)
    for election in get_active_elections().order_by("-is_primary").values("id"):
        task_regenerate_cached_election_data.delay(election_id=election["id"])


def getGamifiedElectionStats(electionId):
    """
    Retrieve stats on who's made changes to polling booths for a given election.
    """
    user_stats = []

    nomsChangesByUser = (
        PollingPlaceNoms.history.filter(
            id__in=PollingPlaces.objects.filter(election_id=electionId, status="Active")
            .exclude(noms_id__isnull=True)
            .values("noms_id")
        )
        .values("history_user_id")
        .annotate(total=Count("history_user_id"))
        .order_by("total")
    )

    for history in nomsChangesByUser:
        user = User.objects.get(id=history["history_user_id"])

        user_stats.append(
            {
                "id": user.id,
                # Handle people with two first names
                "name": user.first_name.split(" ")[0],
                "initials": f"{user.first_name[:1]}{user.last_name[:1]}",
                "image_url": user.profile.profile_image_url,
                "total": history["total"],
            }
        )

    return user_stats
