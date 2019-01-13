from django.contrib import admin
from django.contrib.auth.models import User
from django.db import connection
from .models import Profile
from demsausage.util import get_env

# Register your models here.
admin.register(Profile)(admin.ModelAdmin)


def get_admins():
    if "auth_users" in connection.introspection.table_names():
        return User.objects.filter(is_staff=True, is_superuser=True, is_active=True).all()
    else:
        return []


def is_development():
    return get_env("ENVIRONMENT") == "DEVELOPMENT"
