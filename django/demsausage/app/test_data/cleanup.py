import os

from demsausage.app.test_data.utils import cleanup

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

cleanup()
