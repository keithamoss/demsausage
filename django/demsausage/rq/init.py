import django
from demsausage.util import make_logger

logger = make_logger(__name__)

django.setup()


def init_tasks():
    logger.info("Starting cache regeneration tasks from init.py")

    from demsausage.app.sausage.elections import \
        cache_rehydration_on_init_tasks
    cache_rehydration_on_init_tasks()


init_tasks()
