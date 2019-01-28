from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from demsausage.app.models import Profile, Elections, PollingPlaces


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


class NomsBooleanJSONField(serializers.JSONField):
    """ Serializer for JSONField -- required to remove `free_text` for the GeoJSON response"""

    def to_representation(self, value):
        if "free_text" in value:
            del value["free_text"]
        return value


class PollingPlacesSerializer(serializers.ModelSerializer):
    noms = serializers.JSONField(source="noms.noms", allow_null=True)
    chance_of_sausage = serializers.FloatField(source="noms.chance_of_sausage", allow_null=True)
    stall_name = serializers.CharField(source="noms.stall_name", default="")
    stall_description = serializers.CharField(source="noms.stall_description", default="")
    stall_website = serializers.CharField(source="noms.stall_website", default="")
    stall_extra_info = serializers.CharField(source="noms.stall_extra_info", default="")
    first_report = serializers.DateTimeField(source="noms.first_report", allow_null=True)
    latest_report = serializers.DateTimeField(source="noms.latest_report", allow_null=True)
    source = serializers.CharField(source="noms.source", default="")

    facility_type = serializers.CharField(source="facility_type.name", allow_null=True)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "geom", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "noms", "chance_of_sausage", "stall_name", "stall_description", "stall_website", "stall_extra_info", "first_report", "latest_report", "source")


class PollingPlacesGeoJSONSerializer(GeoFeatureModelSerializer):
    noms = NomsBooleanJSONField(source="noms.noms", allow_null=True)

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "noms")


class PollingPlaceSearchResultsSerializer(PollingPlacesSerializer):
    distance_metres = serializers.CharField()

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "noms", "chance_of_sausage", "stall_name", "stall_description", "stall_website", "stall_extra_info", "first_report", "latest_report", "source", "distance_metres")
