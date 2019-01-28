from rest_framework import renderers
from demsausage.app.serializers import PollingPlacesGeoJSONSerializer
import json


class PollingPlaceGeoJSONRenderer(renderers.BaseRenderer):
    media_type = "application/vnd.geo+json"
    format = "geojson"

    def render(self, data, media_type=None, renderer_context=None):
        return json.dumps(PollingPlacesGeoJSONSerializer(data, many=True).data)
