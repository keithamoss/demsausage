from django.conf.urls import url, include
from .views import (
    UserViewSet,
    ProfileViewSet,
    CurrentUserView,
    LogoutUserView,
    ElectionsViewSet,
    PollingPlacesViewSet,
    PollingPlacesNearbyViewSet,
    PollingPlacesGeoJSONViewSet,
    api_not_found)
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profile', ProfileViewSet, 'ProfileViewSet')
router.register(r'elections', ElectionsViewSet, 'ElectionsViewSet')
router.register(r'polling_places', PollingPlacesViewSet, 'PollingPlacesViewSet')

# Need to set base_name because Reasons
# http://www.django-rest-framework.org/api-guide/routers/#usage (see note re `base_name`)
# http://stackoverflow.com/questions/22083090/what-base-name-parameter-do-i-need-in-my-route-to-make-this-django-api-work
# router.register(r'profile', ProfileViewSet, 'ProfileViewSet')

urlpatterns = [
    url(r'^api/0.1/polling_places/nearby/$', PollingPlacesNearbyViewSet.as_view(), name='api-polling-places-nearby'),
    url(r'^api/0.1/polling_places/geojson/$', PollingPlacesGeoJSONViewSet.as_view(), name='api-polling-places-geojson'),
    url(r'^api/0.1/', include(router.urls)),
    url(r'^api/0.1/self$', CurrentUserView.as_view(), name='api-self'),
    url(r'^api/0.1/logout$', LogoutUserView.as_view(), name='api-logout'),
    # make sure that the API never serves up the react app
    url(r'^api/0.1/.*', api_not_found),
]
