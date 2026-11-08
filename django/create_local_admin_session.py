#!/usr/bin/env python
"""Create a short-lived admin browser session in the local Compose database."""

import json
import os
import time
from importlib import import_module

import django
from django.conf import settings
from django.contrib.auth import BACKEND_SESSION_KEY, HASH_SESSION_KEY, SESSION_KEY
from django.core.exceptions import PermissionDenied
from django.db import connection

LOCAL_ADMIN_HOST = "admin.test.democracysausage.org"
SESSION_LIFETIME_SECONDS = 8 * 60 * 60
BACKEND = "django.contrib.auth.backends.ModelBackend"


def create_local_admin_session() -> dict:
    from django.contrib.auth import get_user_model

    if (
        not settings.DEBUG
        or connection.settings_dict["HOST"] != "db"
        or connection.settings_dict["NAME"] != "stack"
        or settings.SESSION_COOKIE_DOMAIN != LOCAL_ADMIN_HOST
        or settings.SESSION_ENGINE != "django.contrib.sessions.backends.db"
        or BACKEND not in settings.AUTHENTICATION_BACKENDS
    ):
        raise PermissionDenied(
            "Session creation is restricted to the local Compose database "
            "and admin.test.democracysausage.org."
        )

    user = get_user_model().objects.get(pk=1)
    if not user.is_active:
        raise PermissionDenied("Local user ID 1 is inactive.")

    session = import_module(settings.SESSION_ENGINE).SessionStore()
    session[SESSION_KEY] = str(user.pk)
    session[BACKEND_SESSION_KEY] = BACKEND
    session[HASH_SESSION_KEY] = user.get_session_auth_hash()
    session.set_expiry(SESSION_LIFETIME_SECONDS)
    session.save()

    return {
        "name": settings.SESSION_COOKIE_NAME,
        "value": session.session_key,
        "url": f"https://{LOCAL_ADMIN_HOST}/",
        "path": settings.SESSION_COOKIE_PATH,
        "secure": True,
        "httpOnly": True,
        "sameSite": "Lax",
        "expires": int(time.time()) + SESSION_LIFETIME_SECONDS,
    }


if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
    django.setup()
    print(json.dumps(create_local_admin_session()))
