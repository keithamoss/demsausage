from demsausage.app.enums import TaskStatus
from demsausage.util import (get_env,
                             get_stracktrace_string_for_current_exception,
                             is_jsonable, make_logger)
from django.utils.timezone import make_aware
from pytz import timezone
from redis import Redis

from rq import Queue
from rq.command import send_stop_job_command
from rq.job import Job
from rq.registry import StartedJobRegistry

logger = make_logger(__name__)


def get_redis_connection():
    return Redis.from_url(get_env("RQ_REDIS_URL"))


def get_func_name_from_path(func_path):
    return func_path.split(".")[-1]


def get_job_name_from_meta_or_none(job):
    if job.meta is not None and "_custom_job_name" in job.meta:
        return job.meta["_custom_job_name"]
    return None


def get_started_tasks(queue_name=None):
    tasks = []

    redis = get_redis_connection()
    for queue in Queue.all(connection=redis):
        if queue_name is None or queue.name == queue_name:
            registry = StartedJobRegistry(name=queue.name, connection=redis)
            for job_id in registry.get_job_ids():
                job = Job.fetch(job_id, connection=redis)
                tasks.append({
                    "id": job.id,
                    "name": get_job_name_from_meta_or_none(job),
                    "queue": job.origin,
                })
    return tasks


def get_queued_tasks(queue_name=None):
    tasks = []

    redis = get_redis_connection()
    for queue in Queue.all(connection=redis):
        if queue_name is None or queue.name == queue_name:
            for job_id in queue.job_ids:
                job = Job.fetch(job_id, connection=redis)
                tasks.append({
                    "id": job.id,
                    "name": get_job_name_from_meta_or_none(job),
                    "queue": job.origin,
                })
    return tasks


def is_job_started(custom_job_name, queue_name=None, except_for_job_id=None, return_duplicate_jobs=False):
    duplicate_jobs = []
    redis = get_redis_connection()
    for queue in Queue.all(connection=redis):
        if queue_name is None or queue.name == queue_name:
            registry = StartedJobRegistry(name=queue.name, connection=redis)
            for job_id in registry.get_job_ids():
                if except_for_job_id is not None and job_id == except_for_job_id:
                    continue

                job = Job.fetch(job_id, connection=redis)

                if job.meta is not None and "_custom_job_name" in job.meta and job.meta["_custom_job_name"] == custom_job_name:
                    duplicate_jobs.append(job)

    return duplicate_jobs if return_duplicate_jobs is True else len(duplicate_jobs) > 0


# def is_job_started_debugging(custom_job_name, queue_name=None, except_for_job_id=None, return_duplicate_jobs=False):
#     logger.info(f"Hi from is_job_started for {custom_job_name} except_for_job_id {except_for_job_id}")
#     logger.info(f"is_job_started:queue_name is {queue_name}")
#     logger.info(f"is_job_started:except_for_job_id is {except_for_job_id}")
#     logger.info(f"is_job_started:return_duplicate_jobs is {return_duplicate_jobs}")
#     duplicate_jobs = []
#     redis = get_redis_connection()
#     for queue in Queue.all(connection=redis):
#         if queue_name is None or queue.name == queue_name:
#             logger.info(f"is_job_started looking in StartedJobRegistry for {queue.name}")
#             registry = StartedJobRegistry(name=queue.name, connection=redis)
#             logger.info("registry")
#             logger.info(registry)
#             logger.info(f"is_job_started registry jobs len = {len(registry.get_job_ids())}")
#             for job_id in registry.get_job_ids():
#                 logger.info(f"is_job_started found and starting checks on job {job_id}")
#                 if except_for_job_id is not None and job_id == except_for_job_id:
#                     logger.info(f"Ignorning {job_id} because it matches except_for_job_id {except_for_job_id}")
#                     continue

#                 job = Job.fetch(job_id, connection=redis)
#                 logger.info(f"_custom_job_name is {job.meta['_custom_job_name']} vs {custom_job_name}")

#                 if job.meta is not None and "_custom_job_name" in job.meta and job.meta["_custom_job_name"] == custom_job_name:
#                     duplicate_jobs.append(job)

#     logger.info(f"is_job_started duplicate_jobs for {custom_job_name} is len = {len(duplicate_jobs)}")
#     return duplicate_jobs if return_duplicate_jobs is True else len(duplicate_jobs) > 0


def is_job_queued(custom_job_name, queue_name=None, except_for_job_id=None, return_duplicate_jobs=False):
    duplicate_jobs = []
    redis = get_redis_connection()
    for queue in Queue.all(connection=redis):
        if queue_name is None or queue.name == queue_name:
            for job_id in queue.job_ids:
                if except_for_job_id is not None and job_id == except_for_job_id:
                    continue

                job = Job.fetch(job_id, connection=redis)

                if job.meta is not None and "_custom_job_name" in job.meta and job.meta["_custom_job_name"] == custom_job_name:
                    duplicate_jobs.append(job)

    return duplicate_jobs if return_duplicate_jobs is True else len(duplicate_jobs) > 0


def is_job_started_or_queued(custom_job_name, queue_name=None, except_for_job_id=None):
    if is_job_started(custom_job_name, queue_name, except_for_job_id) is True:
        return True
    if is_job_queued(custom_job_name, queue_name, except_for_job_id) is True:
        return True
    logger.info(f"Job '{custom_job_name}' is not started or queued")
    return False


def get_duplicate_jobs(job, queue_name=None):
    custom_job_name = get_job_name_from_meta_or_none(job)
    return is_job_started(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True) + is_job_queued(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True)

    # if custom_job_name == "task_open_tweet_stream":
    #     return is_job_started_debugging(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True) + is_job_queued(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True)
    # else:
    #     return is_job_started(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True) + is_job_queued(custom_job_name, queue_name=queue_name, except_for_job_id=job.id, return_duplicate_jobs=True)


def get_started_jobs_by_func_names(func_names):
    found_jobs = []

    redis = get_redis_connection()
    for queue in Queue.all(connection=redis):
        registry = queue.started_job_registry

        for job_id in registry.get_job_ids():
            job = Job.fetch(job_id, connection=redis)

            if get_func_name_from_path(job.func_name) in func_names:
                found_jobs.append(job)

            # print('Status: %s' % job.get_status())
            # print('Meta: %s' % job.get_meta(refresh=True))
            # print('origin: %s' % job.origin)
            # print('func_name: %s' % job.func_name)
            # print('args:', job.args)
            # print('kwargs: %s' % job.kwargs)
            # print('result: %s' % job.result)
            # print('enqueued_at: %s' % job.enqueued_at)
            # print('started_at: %s' % job.started_at)
            # print('ended_at: %s' % job.ended_at)
            # print('exc_info: %s' % job.exc_info)
            # print('last_heartbeat: %s' % job.last_heartbeat)
            # print('worker_name: %s' % job.worker_name)

    return found_jobs


def cancel_jobs(jobs):
    logger.info("cancel_jobs(jobs)")
    logger.info(jobs)
    redis = get_redis_connection()

    for job in jobs:
        logger.info(f"Cancelling job '{job.id}' (_custom_job_name={get_job_name_from_meta_or_none(job)}) (status={job.get_status()}) on queue '{job.origin}'")

        # This will raise an exception if job is invalid or not currently executing
        send_stop_job_command(redis, job.id)


def report_job_success(job, connection, result, *args, **kwargs):
    logger.debug(f"report_job_success for job {job.func_name} ({job.id})")
    report_job_result(TaskStatus.SUCCESS, job, connection, result, *args, **kwargs)


def report_job_failure(job, connection, result, *args, **kwargs):
    logger.debug(f"report_job_failure for job {job.func_name} ({job.id})")
    report_job_result(TaskStatus.FAILED, job, connection, result, *args, **kwargs)


def report_job_result(status, job, connection, result, *args, **kwargs):
    logger.debug("_report_job_result starting")

    def _format_result(result):
        if is_jsonable(result):
            return result
        elif "Exception" in result.__name__:
            return get_stracktrace_string_for_current_exception()
        return f"{result}"

    from demsausage.app.models import TaskResults
    task = TaskResults(job_id=job.id, job_name=get_job_name_from_meta_or_none(job), job_func_name=job.func_name, queue=job.origin, worker="", status=status, result=_format_result(result), meta=job.meta, job_args=job.args, job_kwargs=job.kwargs, date_enqueued=make_aware(job.enqueued_at, timezone=timezone("UTC")), date_done=make_aware(job.ended_at, timezone=timezone("UTC")))
    task.save()


def does_job_want_to_be_unique(job_meta):
    return job_meta is not None and "_ensure_task_is_unique" in job_meta and job_meta["_ensure_task_is_unique"] is True


def does_job_want_to_be_unique_scheduled_job(job_meta):
    return job_meta is not None and "_ensure_task_is_unique_in_scheduled_jobs" in job_meta and job_meta["_ensure_task_is_unique_in_scheduled_jobs"] is True


def log_task_debug_info(job):
    import inspect
    calling_func_name = inspect.stack()[1].function

    already_exists_elsewhere = is_job_started_or_queued(job.meta["_custom_job_name"], except_for_job_id=job.id)
    logger.info(f"starting {calling_func_name} as {job.id} (already_exists_elsewhere={already_exists_elsewhere})")


def start_job_if_not_queued(task_name, queue_name, *args, **kwargs):
    if is_job_queued(task_name, queue_name) is False:
        import demsausage.rq.jobs as jobs
        getattr(jobs, task_name).delay(*args, **kwargs)
    else:
        logger.info(f"start_job_if_not_queued {task_name} is already queued, so not adding another")
