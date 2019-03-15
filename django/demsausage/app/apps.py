from django.apps import AppConfig
from demsausage.util import make_logger, get_env

logger = make_logger(__name__)


class MyAppConfig(AppConfig):
    name = 'demsausage.app'

    def ready(self):
        import demsausage.app.signals  # noqa
