
from datetime import timedelta

import django
from demsausage.rq.jobs import task_regenerate_cached_election_data
from demsausage.util import make_logger
from django.utils import timezone

logger = make_logger(__name__)

django.setup()


def init_tasks():
    logger.info("Starting cache regeneration tasks from init.py")

    # Rehydrate the cache for all active elections (starting with the primary election)
    from demsausage.app.models import Elections
    for election in Elections.objects.filter(is_hidden=False, election_day__gte=timezone.now() - timedelta(days=1)).order_by("-is_primary").values("id"):
        task_regenerate_cached_election_data.delay(election_id=election['id'])


init_tasks()
