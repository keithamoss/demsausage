from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.indexes import GinIndex
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


class PollingPlaceNoms(models.Model):
    "Our crowdsauced information about the food, drink, et cetera that's available at a given polling place."

    noms = JSONField(default=None, blank=True)
    stall_name = models.TextField()
    stall_description = models.TextField()
    stall_website = models.TextField()
    stall_extra_info = models.TextField()
    first_report = models.DateTimeField(auto_now_add=True)
    latest_report = models.DateTimeField(auto_now=True)
    chance_of_sausage = models.FloatField()
    source = models.TextField()

    class Meta:
        indexes = [
            GinIndex(fields=['noms'])
        ]


class PollingPlaceFacilityType(models.Model):
    "Our list of known types of polling place (e.g. Community Hall, Public School, ..."

    name = models.TextField()


class PollingPlaces(models.Model):
    "Our information about each polling place sauced from the relevant Electoral Commission."

    old_id = models.IntegerField()
    noms = models.OneToOneField(PollingPlaceNoms, on_delete=models.PROTECT)
    geom = models.PointField()
    name = models.TextField()
    facility_type = models.OneToOneField(PollingPlaceFacilityType, on_delete=models.PROTECT)
    premises = models.TextField()
    address = models.TextField()
    division = JSONField(default=list, blank=True)
    state = models.CharField(max_length=3)
    wheelchair_access = models.TextField()
    entrances_desc = models.TextField()
    opening_hours = models.TextField()
    booth_info = models.TextField()


class Elections(models.Model):
    "Our information about each election we've covered."

    old_id = models.IntegerField()
    geom = models.PointField()
    default_zoom_level = models.IntegerField()
    name = models.TextField()
    is_active = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    polling_places_loaded = models.BooleanField(default=False)
    election_day = models.DateTimeField()


class MailgunEvents(models.Model):
    "Information sent back about emails delivered, opened, et cetera."

    timestamp = models.DateTimeField()
    event_type = models.TextField()
    payload = JSONField(default=None, blank=True)
