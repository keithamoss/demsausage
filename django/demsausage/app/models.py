from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from model_utils import FieldTracker
from demsausage.app.enums import ProfileSettings
from demsausage.util import make_logger

logger = make_logger(__name__)

# Create your models here.


class CompilationError(Exception):
    pass


def default_profile_settings():
    return {

    }


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_image_url = models.URLField(blank=False)
    is_approved = models.BooleanField(default=False)
    settings = JSONField(default=default_profile_settings, blank=True)

    tracker = FieldTracker()

    def __str__(self):
        return self.user.username

    def merge_settings(self, settings):
        for item, val in settings.items():
            if ProfileSettings.has_value(item) is True:
                if item not in self.settings and type(val) is dict:
                    self.settings[item] = {}

                # If a specific column position object is null then we want to remove it completely
                if item == "column_positions":
                    columnId = next(iter(val.keys()))
                    columnSettings = next(iter(val.values()))
                    if columnSettings is None:
                        if columnId in self.settings[item]:
                            del self.settings[item][columnId]
                        continue

                if type(self.settings[item]) is dict:
                    self.settings[item] = {**self.settings[item], **val}
                else:
                    self.settings[item] = val


class AllowedUsers(models.Model):
    "Our whitelist of allowed users"

    email = models.EmailField(unique=True, blank=False)
