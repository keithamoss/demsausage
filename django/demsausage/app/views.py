from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.http import HttpResponseNotFound
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework import generics

from demsausage.app.models import Elections, PollingPlaces, Stalls
from demsausage.app.serializers import UserSerializer, ElectionsSerializer, PollingPlacesSerializer, PollingPlacesGeoJSONSerializer, PollingPlaceSearchResultsSerializer, StallsSerializer
from demsausage.app.permissions import AnonymousOnlyList, AnonymousOnlyCreate
from demsausage.app.filters import PollingPlacesBaseFilter, PollingPlacesFilter, PollingPlacesNearbyFilter
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
    queryset = Elections.objects.filter(is_hidden=False).all().order_by("-id")
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


class PollingPlacesNearbyViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be searched by a lat,lon coordinate pair.
    """
    queryset = PollingPlaces.objects
    serializer_class = PollingPlaceSearchResultsSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesNearbyFilter


class PollingPlacesGeoJSONViewSet(generics.ListAPIView):
    """
    API endpoint that allows polling places to be retrieved as GeoJSON.
    """
    queryset = PollingPlaces.objects
    serializer_class = PollingPlacesGeoJSONSerializer
    permission_classes = (AllowAny,)
    filter_class = PollingPlacesBaseFilter

    @method_decorator(cache_page(None, key_prefix="polling_places_"))
    def list(self, request, format=None):
        return super(PollingPlacesGeoJSONViewSet, self).list(request, format)


class StallsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows stalls to be viewed and edited.
    """
    queryset = Stalls.objects
    serializer_class = StallsSerializer
    permission_classes = (AnonymousOnlyCreate,)
