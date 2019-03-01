
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from jsonschema import validate
from jsonschema.exceptions import ValidationError as JSONSchemaValidationError

from demsausage.app.models import Profile, Elections, PollingPlaceFacilityType, PollingPlaceNoms, PollingPlaces, Stalls, MailgunEvents, PollingPlaceLoaderEvents
from demsausage.app.schemas import noms_schema, stall_location_info_schema
from demsausage.app.enums import PollingPlaceStatus, StallStatus
from demsausage.util import get_or_none

from datetime import datetime, timedelta
import pytz


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = ('is_approved', 'settings')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    is_approved = serializers.BooleanField(source='profile.is_approved')
    settings = serializers.JSONField(source='profile.settings')

    name = serializers.SerializerMethodField()
    initials = serializers.SerializerMethodField()

    def get_name(self, obj):
        return "{} {}".format(obj.first_name, obj.last_name)

    def get_initials(self, obj):
        return "{}{}".format(obj.first_name[:1], obj.last_name[:1])

    class Meta:
        model = User
        fields = (
            'id',
            # 'url',
            'username',
            'first_name',
            'last_name',
            'name',
            'initials',
            'email',
            'is_staff',
            'date_joined',
            'groups',
            'is_approved',
            'settings')


class ElectionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Elections
        fields = ("id", "name", "short_name", "geom", "default_zoom_level", "is_hidden", "is_primary", "election_day", "polling_places_loaded")

    def validate_election_day(self, value):
        if value.date() <= datetime.now(pytz.utc).date():
            raise serializers.ValidationError("Election day must be a day in the future")
        return value


class ElectionsStatsSerializer(ElectionsSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Elections
        fields = ("id", "name", "short_name", "geom", "default_zoom_level", "is_hidden", "is_primary", "election_day", "polling_places_loaded", "stats")

    def get_stats(self, obj):
        return {
            "with_data": PollingPlaces.objects.filter(election=obj.id, status=PollingPlaceStatus.ACTIVE).filter(noms__isnull=False).count(),
            "total": PollingPlaces.objects.filter(election=obj.id, status=PollingPlaceStatus.ACTIVE).count(),
        }


class NomsBooleanJSONField(serializers.JSONField):
    """ Serializer for JSONField -- required to create the `other` boolean flag for the GeoJSON response"""

    def to_representation(self, value):
        def has_other(value):
            for key, val in value.items():
                if key not in core_fields:
                    if key != "free_text":
                        if val is True:
                            return True
                    else:
                        if val != "":
                            return True
            return False

        if len(value) == 0:
            return value

        core_fields = ["bbq", "cake", "nothing", "run_out"]
        new_value = {
            "bbq": True if "bbq" in value and value["bbq"] is True else False,
            "cake": True if "cake" in value and value["cake"] is True else False,
            "nothing": True if "nothing" in value and value["nothing"] is True else False,
            "run_out": True if "run_out" in value and value["run_out"] is True else False,
        }
        new_value["other"] = has_other(value)
        return new_value


class JSONSchemaField(serializers.JSONField):
    # Custom field that validates incoming data against JSONSchema,
    # Then, if successful, will store it as a string.
    # https://stackoverflow.com/a/37769847

    def __init__(self, schema, *args, **kwargs):
        super(JSONSchemaField, self).__init__(*args, **kwargs)
        self.schema = schema

    def to_internal_value(self, data):
        try:
            validate(data, self.schema)
        except JSONSchemaValidationError as e:
            raise serializers.ValidationError(e.message)

        return super(JSONSchemaField, self).to_internal_value(data)


class PollingPlaceFacilityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollingPlaceFacilityType

        fields = ("name",)


class PollingPlaceNomsSerializer(serializers.ModelSerializer):
    noms = JSONSchemaField(noms_schema, default=dict)
    name = serializers.CharField(default="", allow_blank=True)
    description = serializers.CharField(default="", allow_blank=True)
    website = serializers.CharField(default="", allow_blank=True)
    extra_info = serializers.CharField(default="", allow_blank=True)
    first_report = serializers.DateTimeField(allow_null=True, read_only=True)
    latest_report = serializers.DateTimeField(allow_null=True, read_only=True)
    source = serializers.CharField(default="", allow_blank=True)

    class Meta:
        model = PollingPlaceNoms

        fields = ("noms", "name", "description", "website", "extra_info", "first_report", "latest_report", "source", "polling_place")


class PollingPlacesSerializer(serializers.ModelSerializer):
    chance_of_sausage = serializers.FloatField(allow_null=True, read_only=True)
    facility_type = serializers.CharField(source="facility_type.name", allow_null=True)
    stall = PollingPlaceNomsSerializer(source="noms", required=False)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "chance_of_sausage", "stall", "facility_type")

    def _update_facility_type(self, validated_data):
        try:
            if "facility_type" in validated_data and validated_data["facility_type"]["name"] is not None:
                return PollingPlaceFacilityType.objects.get(name=validated_data.pop("facility_type")["name"])
        except Exception as e:
            raise serializers.ValidationError("Polling place facility type validation error: {}".format(e))

    def _update_or_create_stall(self, instance, validated_data):
        try:
            if "noms" in validated_data:
                data = {**dict(validated_data.pop("noms")), **{"polling_place": instance.id}}

                # A polling place with an existing noms record that's changing
                if instance.noms is not None:
                    stall_serializer = PollingPlaceNomsSerializer(PollingPlaceNoms.objects.get(id=instance.noms.id), data=data)
                else:
                    # A polling place that's adding a new noms record
                    stall_serializer = PollingPlaceNomsSerializer(data=data)

                if stall_serializer.is_valid(raise_exception=True):
                    stall_serializer.save()
                    return stall_serializer.instance
                else:
                    raise serializers.ValidationError(stall_serializer.errors)
        except Exception as e:
            raise serializers.ValidationError("Polling place noms validation error: {}".format(e))

    def update(self, instance, validated_data):
        if "facility_type" in validated_data:
            validated_data["facility_type"] = self._update_facility_type(validated_data)

        if "noms" in validated_data:
            validated_data["noms"] = self._update_or_create_stall(instance, validated_data)

        return super(PollingPlacesSerializer, self).update(instance, validated_data)

    def create(self, validated_data):
        if "facility_type" in validated_data:
            validated_data["facility_type"] = self._update_facility_type(validated_data)

        if "noms" in validated_data:
            validated_data["noms"] = self._update_or_create_stall(None, validated_data)

        return super(PollingPlacesSerializer, self).create(validated_data)


class PollingPlacesManagementSerializer(PollingPlacesSerializer):
    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "stall", "facility_type", "status", "election")


class PollingPlacesInfoSerializer(PollingPlacesSerializer):
    class Meta:
        model = PollingPlaces
        fields = ("id", "name", "premises", "address", "state")


class PollingPlacesGeoJSONSerializer(GeoFeatureModelSerializer):
    noms = NomsBooleanJSONField(source="noms.noms", allow_null=True)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "noms", )

    def get_properties(self, instance, fields):
        props = {}
        for field in fields:
            if field.source == "noms.noms":
                if instance.noms is not None:
                    props = {**props, **field.to_representation(instance.noms.noms)}
            else:
                props = {**props, **{field.source: field.to_representation(getattr(instance, field.source))}}
        return props


class DistanceField(serializers.CharField):
    """
    Make the result of the distance calculation friendlier for humans to read. 
    """

    def to_representation(self, value):
        return round(float(value.km), 2)


class PollingPlaceSearchResultsSerializer(PollingPlacesSerializer):
    distance_km = DistanceField(source="distance")

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "chance_of_sausage", "stall", "facility_type", "distance_km")


class StallsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, allow_blank=False)
    description = serializers.CharField(required=True, allow_blank=False)
    website = serializers.CharField(required=False, allow_blank=True)
    noms = JSONSchemaField(noms_schema, required=True)
    location_info = JSONSchemaField(stall_location_info_schema, required=False)
    email = serializers.EmailField(required=True, allow_blank=False)
    election = serializers.PrimaryKeyRelatedField(queryset=Elections.objects)

    class Meta:
        model = Stalls
        fields = ("id", "name", "description", "website", "noms", "location_info", "email", "election", "polling_place", "status")

    def create(self, validated_data):
        return Stalls.objects.create(**validated_data)

    def validate_noms(self, value):
        if len(value.keys()) == 0:
            raise serializers.ValidationError("One or more food/drink options must be selected")
        return value

    def validate(self, data):
        if "election" in self.initial_data and isinstance(self.initial_data["election"], int):
            election = get_or_none(Elections, id=self.initial_data["election"])
            if election is not None:
                if election.polling_places_loaded is True:
                    if "location_info" in self.initial_data:
                        raise serializers.ValidationError("Stall location information not required when polling places are loaded")

                    if "polling_place" not in self.initial_data:
                        raise serializers.ValidationError("Polling place information is required when polling places are loaded")

                else:
                    if "location_info" not in self.initial_data:
                        raise serializers.ValidationError("Stall location information is required when polling places are loaded")

        return data


class StallsUserEditSerializer(StallsSerializer):
    id = serializers.IntegerField(read_only=True)
    location_info = JSONSchemaField(stall_location_info_schema, read_only=True)
    election = serializers.PrimaryKeyRelatedField(read_only=True)
    polling_place = PollingPlacesInfoSerializer(read_only=True)
    status = serializers.CharField()

    class Meta:
        model = Stalls
        fields = ("id", "name", "description", "website", "noms", "location_info", "email", "election", "polling_place", "status")


class StallsManagementSerializer(StallsSerializer):
    class Meta:
        model = Stalls
        fields = ("name", "description", "website", "noms", "location_info", "email", "election", "polling_place", "status", "approved_on")


class PendingStallsSerializer(StallsSerializer):
    polling_place = PollingPlacesInfoSerializer(read_only=True)
    diff = serializers.SerializerMethodField()

    class Meta:
        model = Stalls
        fields = ("id", "name", "description", "website", "noms", "location_info", "email", "election_id", "approved_on", "polling_place", "diff")

    def get_diff(self, obj):
        fields_to_include_in_diff = ("name", "description", "website", "noms", "email")

        if obj.approved_on is not None:
            filter = obj.history.all().filter(history_date__gt=obj.approved_on)
            most_recent = filter.first()
            least_recent = filter.last()

            delta = most_recent.diff_against(least_recent)

            return [{
                "field": c.field,
                "old": c.old,
                "new": c.new,
            } for c in delta.changes if c.field in fields_to_include_in_diff]


class MailgunEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailgunEvents
        fields = ("id", "timestamp", "event_type", "payload")


class PollingPlaceLoaderEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollingPlaceLoaderEvents
        fields = ("id", "timestamp", "payload")

