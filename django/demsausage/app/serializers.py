from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from jsonschema import validate
from jsonschema.exceptions import ValidationError as JSONSchemaValidationError

from demsausage.app.models import Profile, Elections, PollingPlaces, Stalls
from demsausage.app.schemas import noms_schema, stall_location_info_schema
from demsausage.util import get_or_none


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


class ElectionsStatsSerializer(ElectionsSerializer):
    stats = serializers.SerializerMethodField()

    class Meta:
        model = Elections
        fields = ("id", "name", "short_name", "geom", "default_zoom_level", "is_hidden", "is_primary", "election_day", "polling_places_loaded", "stats")

    def get_stats(self, obj):
        return {
            "with_data": PollingPlaces.objects.filter(election=obj.id).filter(noms__isnull=False).count(),
            "total": PollingPlaces.objects.filter(election=obj.id).count(),
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

        core_fields = ["bbq", "cake", "nothing", "run_out"]
        new_value = {key: value[key] for key in core_fields}
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


class PollingPlacesSerializer(serializers.ModelSerializer):
    noms = JSONSchemaField(noms_schema, source="noms.noms", default=dict)
    chance_of_sausage = serializers.FloatField(source="noms.chance_of_sausage", allow_null=True)
    stall_name = serializers.CharField(source="noms.stall_name", default=None)
    stall_description = serializers.CharField(source="noms.stall_description", default=None)
    stall_website = serializers.CharField(source="noms.stall_website", default=None)
    stall_extra_info = serializers.CharField(source="noms.stall_extra_info", default=None)
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
    Color objects are serialized into 'rgb(#, #, #)' notation.
    """

    def to_representation(self, value):
        return round(float(value.km), 2)


class PollingPlaceSearchResultsSerializer(PollingPlacesSerializer):
    distance_km = DistanceField(source="distance")

    class Meta:
        model = PollingPlaces
        geo_field = "geom"

        fields = ("id", "name", "facility_type", "booth_info", "wheelchair_access", "entrance_desc", "opening_hours", "premises", "address", "divisions", "state", "noms", "chance_of_sausage", "stall_name", "stall_description", "stall_website", "stall_extra_info", "first_report", "latest_report", "source", "distance_km", )


class StallsSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, allow_blank=False)
    description = serializers.CharField(required=True, allow_blank=False)
    website = serializers.CharField(allow_blank=True)
    noms = JSONSchemaField(noms_schema, required=True)
    location_info = JSONSchemaField(stall_location_info_schema, required=False)
    email = serializers.EmailField(required=True, allow_blank=False)
    election = serializers.PrimaryKeyRelatedField(queryset=Elections.objects)
    polling_place = serializers.PrimaryKeyRelatedField(queryset=PollingPlaces.objects, required=False)

    class Meta:
        model = Stalls
        fields = ("name", "description", "website", "noms", "location_info", "email", "election", "polling_place")

    def create(self, validated_data):
        return Stalls.objects.create(**validated_data)

    def validate_noms(self, value):
        if len(value.keys()) == 0:
            raise serializers.ValidationError("One or more food/drink options must be selected")
        return value

    def validate(self, data):
        if isinstance(self.initial_data["election"], int):
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
