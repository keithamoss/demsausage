import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from demsausage.app.enums import StallStatus  # noqa: E402
from demsausage.app.models import Stalls  # noqa: E402
from demsausage.app.sausage.mailgun import (  # noqa: E402
    send_monthly_reminder_heartbeat_email,
    send_pending_stall_reminder_email,
)

print("Sending monthly reminder heartbeat email...")
send_monthly_reminder_heartbeat_email()
print("Monthly reminder heartbeat email sent")

print("Checking for pending stalls...")
pending_stall_count = Stalls.objects.filter(status=StallStatus.PENDING).count()
print(f"Found {pending_stall_count} pending stall(s)")

if pending_stall_count > 0:
    print(f"Sending pending stall reminder email for {pending_stall_count} stall(s)...")
    try:
        send_pending_stall_reminder_email(pending_stall_count)
        print("Pending stall reminder email sent successfully")
    except Exception as e:
        print(f"Error sending pending stall reminder email: {e}")
else:
    print("No pending stalls, skipping reminder email")

print("Cron job finished successfully")
