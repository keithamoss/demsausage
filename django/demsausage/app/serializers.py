import re
import urllib.parse
from datetime import datetime

import pytz
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import (Elections, MailgunEvents,
                                   PollingPlaceFacilityType,
                                   PollingPlaceLoaderEvents, PollingPlaceNoms,
                                   PollingPlaces, Profile, Stalls)
from demsausage.app.schemas import noms_schema, stall_location_info_schema
from demsausage.util import get_or_none
from jsonschema import validate
from jsonschema.exceptions import ValidationError as JSONSchemaValidationError
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from django.contrib.auth.models import User


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

class ElectionURLSafeNameCharField(serializers.CharField):
    """ Serializer for CharField -- creates a URL safe version of the election name"""
    # "New South Wales Election 2023" to "new_south_wales_election_2023"

    def to_representation(self, value):
        return urllib.parse.quote(re.sub("\s", "_", value).lower())

class ElectionsSerializer(serializers.ModelSerializer):
    name_url_safe = ElectionURLSafeNameCharField(source="name", allow_null=False)
    
    class Meta:
        model = Elections
        fields = ("id", "name", "name_url_safe", "short_name", "geom", "is_hidden", "is_primary", "is_federal", "election_day", "polling_places_loaded", "jurisdiction")

    # Prevents us from editing existing elections (e.g. When we were setting the new bounding boxes)
    # def validate_election_day(self, value):
    #     if value.date() <= datetime.now(pytz.utc).date():
    #         raise serializers.ValidationError("Election day must be a day in the future")
    #     return value


class ElectionsStatsSerializer(ElectionsSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Elections
        fields = ("id", "name", "short_name", "geom", "is_hidden", "is_primary", "is_federal", "election_day", "polling_places_loaded", "stats")

    def get_stats(self, obj):
        return {
            "with_data": PollingPlaces.objects.filter(election=obj.id, status=PollingPlaceStatus.ACTIVE).filter(noms__isnull=False).count(),
            "total": PollingPlaces.objects.filter(election=obj.id, status=PollingPlaceStatus.ACTIVE).count(),
        }


class NomsBooleanJSONField(serializers.JSONField):
    """ Serializer for JSONField -- required to create the `other` boolean flag for the GeoJSON response"""

    def to_representation(self, value):
        if len(value) == 0:
            return value

        # Filter out "no data" reports (i.e. For the purposes of the map we don't care that a polling place doesn't have sausage, only that it does)
        new_value = {}
        for key, val in value.items():
            if key == "free_text":
                if val is not None:
                    new_value[key] = True
            elif val is True:
                new_value[key] = val
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
    opening_hours = serializers.CharField(default="", allow_blank=True)
    favourited = serializers.BooleanField(required=False, default=False)
    website = serializers.CharField(default="", allow_blank=True)
    extra_info = serializers.CharField(default="", allow_blank=True)
    first_report = serializers.DateTimeField(allow_null=True, read_only=True)
    latest_report = serializers.DateTimeField(allow_null=True, read_only=True)
    source = serializers.CharField(default="", allow_blank=True)

    class Meta:
        model = PollingPlaceNoms

        fields = ("noms", "name", "description", "opening_hours", "favourited", "website", "extra_info", "first_report", "latest_report", "source", "polling_place")


class PollingPlacesSerializer(serializers.ModelSerializer):
    chance_of_sausage = serializers.IntegerField(allow_null=True, read_only=True)
    facility_type = serializers.CharField(source="facility_type.name", allow_null=True)
    stall = PollingPlaceNomsSerializer(source="noms", required=False)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "wheelchair_access_description", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "chance_of_sausage", "stall", "facility_type", "ec_id", "extras")

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

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "wheelchair_access_description", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "stall", "facility_type", "status", "election", "ec_id", "extras")


class PollingPlacesInfoSerializer(PollingPlacesSerializer):
    class Meta:
        model = PollingPlaces
        fields = ("id", "name", "premises", "address", "state")


class PollingPlacesGeoJSONSerializer(GeoFeatureModelSerializer):
    noms = NomsBooleanJSONField(source="noms.noms", allow_null=True)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "noms", "name", "premises", "state", "ec_id")

    def get_properties(self, instance, fields):
        props = {"noms": None}
        for field in fields:
            if field.source == "noms.noms":
                if instance.noms is not None:
                    props = {**props, "noms": field.to_representation(instance.noms.noms)}
            else:
                value = getattr(instance, field.source)
                props = {**props, **{field.source: field.to_representation(value) if value is not None else None}}
        return props


class PollingPlacesFlatJSONSerializer(PollingPlacesSerializer):
    def to_representation(self, obj):
        representation = super().to_representation(obj)

        geom_representation = representation.pop("geom")
        if geom_representation is not None and geom_representation["type"] == "Point":
            representation["lon"] = geom_representation["coordinates"][0]
            representation["lat"] = geom_representation["coordinates"][1]

        stall_representation = representation.pop("stall")
        if stall_representation is not None:
            if "noms" in stall_representation:
                noms_representation = stall_representation.pop("noms")
                for noms_name, prop in noms_schema["properties"].items():
                    if noms_name == "free_text":
                        representation[f"stall_noms_{noms_name}"] = noms_representation[noms_name] if "free_text" in noms_representation else ""
                    else:
                        representation[f"stall_noms_{noms_name}"] = 1 if noms_name in noms_representation and noms_representation[noms_name] is True else 0

            for key in stall_representation:
                representation[f"stall_{key}"] = stall_representation[key]

        extras_representation = representation.pop("extras")
        if extras_representation is not None:
            for key in extras_representation:
                representation[f"extras_{key.lower()}"] = extras_representation[key]

        representation["divisions"] = ", ".join(representation["divisions"]) if representation["divisions"] is not None else ""

        return representation


class DistanceField(serializers.CharField):
    """
    Make the result of the distance calculation friendlier for humans to read.
    """

    def to_representation(self, value):
        return round(float(value.km), 2)


class PollingPlaceSearchResultsSerializer(PollingPlacesSerializer):
    distance_km = DistanceField(source="distance")
    stall = PollingPlaceNomsSerializer(source="noms", required=False)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "wheelchair_access_description", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "chance_of_sausage", "stall", "facility_type", "distance_km")


class StallsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, allow_blank=False)
    description = serializers.CharField(required=True, allow_blank=False)
    opening_hours = serializers.CharField(required=False, allow_blank=True)
    website = serializers.CharField(required=False, allow_blank=True)
    noms = JSONSchemaField(noms_schema, required=True)
    location_info = JSONSchemaField(stall_location_info_schema, required=False)
    email = serializers.EmailField(required=True, allow_blank=False)
    election = serializers.PrimaryKeyRelatedField(queryset=Elections.objects)

    class Meta:
        model = Stalls
        fields = ("id", "name", "description", "opening_hours", "website", "noms", "location_info", "email", "election", "polling_place", "status")

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
        fields = ("id", "name", "description", "opening_hours", "website", "noms", "location_info", "email", "election", "polling_place", "status")


class StallsManagementSerializer(StallsSerializer):
    class Meta:
        model = Stalls
        fields = ("name", "description", "opening_hours", "website", "noms", "location_info", "email", "election", "polling_place", "status", "approved_on", "submitter_type")


class StallsOwnerManagementSerializer(StallsManagementSerializer):
    pass


class StallsTipOffManagementSerializer(StallsSerializer):
    class Meta:
        model = Stalls
        fields = ("noms", "location_info", "email", "election", "polling_place", "status", "approved_on", "submitter_type")


class PendingStallsSerializer(StallsSerializer):
    polling_place = PollingPlacesInfoSerializer(read_only=True)
    diff = serializers.SerializerMethodField()
    current_stall = serializers.SerializerMethodField()

    class Meta:
        model = Stalls
        fields = ("id", "name", "description", "opening_hours", "website", "noms", "location_info", "email", "election_id", "approved_on", "polling_place", "current_stall", "diff")

    def get_diff(self, obj):
        fields_to_include_in_diff = ("name", "description", "opening_hours", "website", "noms", "email")

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

    def get_current_stall(self, obj):
        return PollingPlaceNomsSerializer(PollingPlaceNoms.objects.get(id=obj.polling_place.noms_id)).data if obj.polling_place is not None and obj.polling_place.noms_id is not None else None


class MailgunEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MailgunEvents
        fields = ("id", "timestamp", "event_type", "payload")


class PollingPlaceLoaderEventsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollingPlaceLoaderEvents
        fields = ("id", "timestamp", "payload")
