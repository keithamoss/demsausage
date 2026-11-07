import os

import django

from demsausage.app.test_data.utils import cleanup

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

cleanup()
