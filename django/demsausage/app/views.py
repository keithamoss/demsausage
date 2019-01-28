from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.core.cache import cache

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework import generics

from demsausage.app.serializers import UserSerializer
from demsausage.app.models import Elections, PollingPlaces
from demsausage.app.serializers import ElectionsSerializer, PollingPlacesSerializer, PollingPlaceSearchResultsSerializer
from demsausage.app.permissions import AnonymousOnlyList
from demsausage.app.filters import PollingPlacesFilter
from demsausage.app.renderers import PollingPlaceGeoJSONRenderer
from demsausage.util import make_logger

logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(
                request.user, context={'request': request}
            )

            return Response({
                "is_logged_in": True,
                "user": serializer.data
            })
        else:
            return Response({
                "is_logged_in": False,
                "user": None
            })


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)
        return Response({})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class ProfileViewSet(viewsets.ViewSet):
    """
    API endpoint that allows user profiles to be viewed and edited.
    """
    permission_classes = (IsAuthenticated,)

    @list_route(methods=['post'])
    def update_settings(self, request):
        request.user.profile.merge_settings(request.data)
        request.user.profile.save()
        return Response({"settings": request.user.profile.settings})

    @list_route(methods=['get'])
    def get_column_position(self, request, format=None):
        qp = request.query_params
        columnId = str(qp["id"]) if "id" in qp else None

        if "column_positions" in request.user.profile.settings and columnId in request.user.profile.settings["column_positions"]:
            return Response({"position": request.user.profile.settings["column_positions"][columnId]})
        else:
            return Response({"position": None})


class ElectionsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows elections to be viewed and edited.
    """
    queryset = Elections.objects.all().order_by("-id")
    serializer_class = ElectionsSerializer
    permission_classes = (AnonymousOnlyList,)


class PollingPlacesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows polling places to be viewed and edited.
    """
    queryset = PollingPlaces.objects.all().order_by("-id")
    serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesFilter
    renderer_classes = [JSONRenderer, BrowsableAPIRenderer, PollingPlaceGeoJSONRenderer, ]

    def list(self, request, format=None):
        cache_key = "election_{}_polling_places".format(self.request.query_params.get("election_id", None))
        is_geojson_response = self.request.query_params.get("format", None) == "geojson"

        if is_geojson_response is True and cache.get(cache_key) is not None:
            return Response(cache.get(cache_key))

        response = super(PollingPlacesViewSet, self).list(request, format)

        if is_geojson_response is True and cache.get(cache_key) is None:
            cache.set(cache_key, response.data)

        return response


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be viewed and edited.
    """
    queryset = PollingPlaces.objects
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesFilter
