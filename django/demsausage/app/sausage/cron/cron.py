import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from demsausage.app.models import Stalls
from demsausage.app.enums import StallStatus
from demsausage.app.sausage.mailgun import send_pending_stall_reminder_email

pending_stall_count = Stalls.objects.filter(status=StallStatus.PENDING).count()

if pending_stall_count > 0:
    try:
        send_pending_stall_reminder_email(pending_stall_count)
    except Exception as e:
        print(e)

print("Fin")
