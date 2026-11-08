import importlib

import pytest
from django.contrib.auth import BACKEND_SESSION_KEY, HASH_SESSION_KEY, SESSION_KEY
from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.db import connection
from django.test import RequestFactory

from create_local_admin_session import (
    BACKEND,
    LOCAL_ADMIN_HOST,
    SESSION_LIFETIME_SECONDS,
    create_local_admin_session,
)


@pytest.fixture
def local_settings(db, settings, monkeypatch):
    settings.DEBUG = True
    settings.SESSION_COOKIE_DOMAIN = LOCAL_ADMIN_HOST
    settings.SESSION_ENGINE = "django.contrib.sessions.backends.db"
    settings.AUTHENTICATION_BACKENDS = [BACKEND]
    connection.ensure_connection()
    monkeypatch.setitem(connection.settings_dict, "HOST", "db")
    # Keep the actual test database isolated; only the safety check sees "stack".
    monkeypatch.setitem(connection.settings_dict, "NAME", "stack")
    return settings


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("DEBUG", False),
        ("SESSION_COOKIE_DOMAIN", "admin.democracysausage.org"),
        ("SESSION_ENGINE", "django.contrib.sessions.backends.signed_cookies"),
        ("AUTHENTICATION_BACKENDS", []),
    ],
)
def test_rejects_unsafe_settings_before_database_access(local_settings, field, value):
    setattr(local_settings, field, value)
    with pytest.raises(PermissionDenied, match="restricted"):
        create_local_admin_session()


@pytest.mark.parametrize(
    ("field", "value"), [("HOST", "production"), ("NAME", "other")]
)
def test_rejects_nonlocal_database_before_access(
    local_settings, monkeypatch, field, value
):
    monkeypatch.setitem(connection.settings_dict, field, value)
    with pytest.raises(PermissionDenied, match="restricted"):
        create_local_admin_session()


@pytest.mark.django_db
def test_creates_authenticated_expiring_session(local_settings):
    user = User.objects.create_user(pk=1, username="local-admin-test")
    cookie = create_local_admin_session()
    session = importlib.import_module(local_settings.SESSION_ENGINE).SessionStore(
        session_key=cookie["value"]
    )
    try:
        assert session[SESSION_KEY] == "1"
        assert session[BACKEND_SESSION_KEY] == BACKEND
        assert session[HASH_SESSION_KEY] == user.get_session_auth_hash()
        assert session.get_expiry_age() == SESSION_LIFETIME_SECONDS
        assert cookie["url"] == f"https://{LOCAL_ADMIN_HOST}/"
        assert cookie["secure"] is True
        assert cookie["httpOnly"] is True

        from django.contrib.auth import get_user

        request = RequestFactory().get("/")
        request.session = session
        assert get_user(request).pk == user.pk
    finally:
        session.delete()


@pytest.mark.django_db
def test_rejects_inactive_user(local_settings):
    User.objects.create_user(pk=1, username="inactive-local-test", is_active=False)
    with pytest.raises(PermissionDenied, match="inactive"):
        create_local_admin_session()


@pytest.mark.django_db
def test_missing_user_fails_explicitly(local_settings):
    with pytest.raises(User.DoesNotExist):
        create_local_admin_session()
