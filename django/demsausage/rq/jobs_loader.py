from demsausage.app.exceptions import BadRequest
from demsausage.app.models import Elections
from demsausage.app.sausage.loader import LoadPollingPlaces
from demsausage.rq.rq_utils import log_task_debug_info
from demsausage.util import make_logger
from django_rq import job

from rq import Retry, get_current_job

logger = make_logger(__name__)


@job("cache_hydration", timeout=900, retry=Retry(max=1), meta={"_custom_job_name": "task_refresh_polling_place_data_{election_id}", "_ensure_task_is_unique": True})
def task_refresh_polling_place_data(election_id, file, dry_run, config):
    log_task_debug_info(get_current_job())

    election = Elections.objects.get(id=election_id)
    loader = LoadPollingPlaces(election, file, dry_run, config)

    try:
        loader.run()
    except BadRequest as e:
        # BadRequest comes from rolling back when we're doing dry run
        logger.info("Got a BadRequest, probably because we're doing a dry run")
        pass
    except Exception as e:
        raise e

    logs = loader.collects_logs()
    job = get_current_job()
    job.meta['_polling_place_loading_results'] = logs
    job.save_meta()

    return {"message": "Done", "logs": logs}
