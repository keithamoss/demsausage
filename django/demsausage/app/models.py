from datetime import datetime

import pytz
from demsausage.app.enums import (
    PollingPlaceChanceOfSausage,
    PollingPlaceJurisdiction,
    PollingPlaceState,
    PollingPlaceStatus,
    PollingPlaceWheelchairAccess,
    ProfileSettings,
    StallStatus,
    StallSubmitterType,
    StallTipOffSource,
    TaskStatus,
)
from demsausage.app.managers import PollingPlacesManager
from demsausage.app.schemas import noms_schema, stall_location_info_schema
from demsausage.app.validators import JSONSchemaValidator
from demsausage.util import make_logger
from model_utils import FieldTracker
from simple_history.models import HistoricalRecords

from django.contrib.auth.models import User
from django.contrib.gis.db import models
from django.contrib.postgres.indexes import GinIndex
from django.db.models import JSONField

logger = make_logger(__name__)

# Create your models here.


class CompilationError(Exception):
    pass


def default_profile_settings():
    return {}


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


class Elections(models.Model):
    "Our information about each election we've covered."

    old_id = models.IntegerField(null=True)
    geom = models.PolygonField(null=False)
    name = models.TextField(unique=True)
    short_name = models.TextField(unique=True)
    is_test = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    is_federal = models.BooleanField(default=False)
    is_state = models.BooleanField(default=False)
    polling_places_loaded = models.BooleanField(default=False)
    election_day = models.DateTimeField()
    jurisdiction = models.TextField(
        choices=[(tag, tag.value) for tag in PollingPlaceJurisdiction]
    )
    analytics_stats_saved = models.BooleanField(default=False, blank=True, null=True)

    def is_active(self):
        return datetime.now(pytz.utc).date() <= self.election_day.date()


class PollingPlaceFacilityType(models.Model):
    "Our list of known types of polling place (e.g. Community Hall, Public School, ..."

    name = models.TextField()


class PollingPlaceNoms(models.Model):
    "Our crowdsauced information about the food, drink, et cetera that's available at a given polling place."

    noms = JSONField(
        default=None,
        blank=True,
        validators=[JSONSchemaValidator(limit_value=noms_schema)],
    )
    name = models.TextField(blank=True)
    description = models.TextField(blank=True)
    opening_hours = models.TextField(blank=True)
    favourited = models.BooleanField(default=False)
    website = models.TextField(blank=True)
    extra_info = models.TextField(blank=True)
    first_report = models.DateTimeField(auto_now_add=True, null=True)
    latest_report = models.DateTimeField(auto_now=True, null=True)
    source = models.TextField(blank=True)
    deleted = models.BooleanField(default=False)
    internal_notes = models.TextField(blank=True)

    history = HistoricalRecords()
    tracker = FieldTracker()

    class Meta:
        indexes = [GinIndex(fields=["noms"])]


class PollingPlaces(models.Model):
    "Our information about each polling place sauced from the relevant Electoral Commission."

    old_id = models.IntegerField(null=True)
    election = models.ForeignKey(Elections, on_delete=models.PROTECT)
    noms = models.OneToOneField(
        PollingPlaceNoms,
        on_delete=models.PROTECT,
        null=True,
        related_name="polling_place",
    )
    geom = models.PointField(geography=True)
    name = models.TextField()
    facility_type = models.ForeignKey(
        PollingPlaceFacilityType, on_delete=models.PROTECT, null=True
    )
    premises = models.TextField(blank=True)
    address = models.TextField()
    divisions = JSONField(default=list, blank=True)
    state = models.TextField(choices=[(tag, tag.value) for tag in PollingPlaceState])
    wheelchair_access = models.TextField(
        choices=[(tag, tag.value) for tag in PollingPlaceWheelchairAccess]
    )
    wheelchair_access_description = models.TextField(blank=True)
    entrance_desc = models.TextField(blank=True)
    opening_hours = models.TextField(blank=True)
    booth_info = models.TextField(blank=True)
    status = models.TextField(
        choices=[(tag, tag.value) for tag in PollingPlaceStatus],
        default=PollingPlaceStatus.DRAFT,
    )
    chance_of_sausage = models.IntegerField(
        choices=[(tag, tag.value) for tag in PollingPlaceChanceOfSausage], null=True
    )
    chance_of_sausage_stats = JSONField(default=dict, blank=True)
    extras = JSONField(default=dict, blank=True)
    ec_id = models.IntegerField(null=True)

    tracker = FieldTracker(fields=["noms"])
    objects = PollingPlacesManager()

    class Meta:
        indexes = [models.Index(fields=["election"])]


class IPAddressHistoricalModel(models.Model):
    """
    Abstract model for history models tracking the IP address.
    """

    # Doesn't work with CloudFlare in production (we get two comma separated IP addresses - CloudFlare's and the users)
    # This is just for record keeping, so we'll just store it as a text field for now.
    # ip_address = models.GenericIPAddressField(_('IP address'), null=True)
    ip_address = models.TextField(null=True)

    class Meta:
        abstract = True


class Stalls(models.Model):
    "Stalls submitted to us by users."

    old_id = models.IntegerField(null=True)
    election = models.ForeignKey(Elections, on_delete=models.PROTECT)
    name = models.TextField(blank=False)
    description = models.TextField()
    opening_hours = models.TextField(blank=True)
    website = models.TextField(blank=True)
    noms = JSONField(
        default=None, validators=[JSONSchemaValidator(limit_value=noms_schema)]
    )
    location_info = JSONField(
        default=None,
        null=True,
        validators=[JSONSchemaValidator(limit_value=stall_location_info_schema)],
    )
    email = models.EmailField()
    polling_place = models.ForeignKey(
        PollingPlaces, on_delete=models.PROTECT, null=True
    )
    reported_timestamp = models.DateTimeField(auto_now_add=True)
    owner_edit_timestamp = models.DateTimeField(null=True)
    triaged_on = models.DateTimeField(null=True)
    triaged_by = models.ForeignKey(User, on_delete=models.PROTECT, null=True)
    status = models.TextField(
        choices=[(tag, tag.value) for tag in StallStatus], default=StallStatus.PENDING
    )
    previous_status = models.TextField(
        choices=[(tag, tag.value) for tag in StallStatus], default=None, null=True
    )
    mail_confirmed = models.BooleanField(default=True)
    submitter_type = models.TextField(
        choices=[(tag, tag.value) for tag in StallSubmitterType], blank=True
    )
    tipoff_source = models.TextField(
        choices=[(tag, tag.value) for tag in StallTipOffSource], blank=True
    )
    tipoff_source_other = models.TextField(blank=True)

    history = HistoricalRecords(
        bases=[
            IPAddressHistoricalModel,
        ]
    )
    tracker = FieldTracker()


class MailgunEvents(models.Model):
    "Information sent back about emails delivered, opened, et cetera."

    timestamp = models.DateTimeField()
    event_type = models.TextField()
    payload = JSONField(default=None, blank=True)


class PollingPlaceLoaderEvents(models.Model):
    "Logs from the polling place loader."

    timestamp = models.DateTimeField()
    payload = JSONField(default=None, blank=True)


class ElectoralBoundaries(models.Model):
    "Federal and state electoral boundaries"

    loader_id = models.TextField()
    geom = models.MultiPolygonField(null=False)
    election_ids = JSONField(default=list, blank=True)
    division_name = models.TextField()
    state = models.TextField(choices=[(tag, tag.value) for tag in PollingPlaceState])
    extras = JSONField(default=dict, blank=True)
    loaded = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ("division_name", "loader_id")


class TaskResults(models.Model):
    "The result store for our task queue"

    job_id = models.TextField()
    job_name = models.TextField()
    job_func_name = models.TextField()
    queue = models.TextField()
    worker = models.TextField()
    status = models.TextField(choices=[(tag, tag.value) for tag in TaskStatus])
    result = JSONField(default=None, blank=True, null=True)
    meta = JSONField(default=None, blank=True, null=True)
    job_args = JSONField(default=None, blank=True, null=True)
    job_kwargs = JSONField(default=None, blank=True, null=True)
    date_enqueued = models.DateTimeField()
    date_done = models.DateTimeField()
