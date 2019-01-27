from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.contrib.gis.geos import Point

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny

from demsausage.app.serializers import UserSerializer
from demsausage.app.models import Elections, PollingPlaces
from demsausage.app.serializers import ElectionsSerializer, PollingPlacesGeoJSONSerializer, PollingPlaceSearchResultsSerializer
from demsausage.app.permissions import AnonymousOnlyList
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

    @detail_route(methods=['get'])
    @method_decorator(cache_page(None, key_prefix="polling_places_"))
    def polling_places(self, request, pk=None, format=None):
        election = self.get_object()
        polling_places = PollingPlaces.objects.filter(election_id=election.id).all()
        polling_places_geojson = PollingPlacesGeoJSONSerializer(polling_places, many=True).data
        return Response(polling_places_geojson)

    @detail_route(methods=['get'])
    def polling_places_nearby(self, request, pk=None, format=None):
        election = self.get_object()

        qp = request.query_params
        lat = float(qp["lat"]) if "lat" in qp else None
        lon = float(qp["lon"]) if "lon" in qp else None
        search_point = Point(lon, lat, srid=4326)

        polling_places = PollingPlaces.objects.find_by_distance(election.id, search_point, distance_threshold_km=50, limit=15)
        if polling_places.count() == 0:
            polling_places = PollingPlaces.objects.find_by_distance(election.id, search_point, distance_threshold_km=1000, limit=15)

        return Response(PollingPlaceSearchResultsSerializer(polling_places, many=True).data)


class PollingPlacesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows polling places to be viewed and edited.
    """
    queryset = PollingPlaces.objects.all().order_by("-id")
    # serializer_class = PollingPlacesSerializer
    permission_classes = (AllowAny,)
