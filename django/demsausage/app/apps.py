from demsausage.util import make_logger
from django.apps import AppConfig

logger = make_logger(__name__)


class MyAppConfig(AppConfig):
    name = 'demsausage.app'

    def ready(self):
        import demsausage.app.signals  # noqa
        from demsausage.app.admin import is_production
        from demsausage.app.sausage.elections import \
            cache_rehydration_on_init_tasks

        # Otherwise this would run every time Django reloads due to code changes in development
        if is_production() is True:
            logger.info("Starting cache regeneration tasks from ready()")
            cache_rehydration_on_init_tasks()
