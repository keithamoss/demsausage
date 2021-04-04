from django.conf.urls import include, url
from django.urls import path
from drf_spectacular.views import (SpectacularAPIView, SpectacularRedocView,
                                   SpectacularSwaggerView)
from rest_framework import routers
from rest_framework.permissions import AllowAny

from .views import (CurrentUserView, ElectionsViewSet, LogoutUserView,
                    MailManagementViewSet, PendingStallsViewSet,
                    PollingPlaceFacilityTypeViewSet,
                    PollingPlacesGeoJSONViewSet, PollingPlacesNearbyViewSet,
                    PollingPlacesSearchViewSet, PollingPlacesViewSet,
                    ProfileViewSet, StallsViewSet, UserViewSet, api_not_found)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'profile', ProfileViewSet, 'ProfileViewSet')
router.register(r'elections', ElectionsViewSet, 'ElectionsViewSet')
router.register(r'polling_places', PollingPlacesViewSet, 'PollingPlacesViewSet')
router.register(r'map', PollingPlacesGeoJSONViewSet, 'PollingPlacesViewSet')
router.register(r'stalls', StallsViewSet, 'StallsViewSet')
router.register(r'polling_places_facility_types', PollingPlaceFacilityTypeViewSet, 'PollingPlaceFacilityTypeViewSet')
router.register(r'mail', MailManagementViewSet, 'MailManagementViewSet')

# Need to set base_name because Reasons
# http://www.django-rest-framework.org/api-guide/routers/#usage (see note re `base_name`)
# http://stackoverflow.com/questions/22083090/what-base-name-parameter-do-i-need-in-my-route-to-make-this-django-api-work
# router.register(r'profile', ProfileViewSet, 'ProfileViewSet')

urlpatterns = [
    url(r'^api/0.1/schema/$', SpectacularAPIView.as_view(), name='schema'),
    url(r'^api/0.1/schema/swagger-ui/$', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    url(r'^api/0.1/schema/redoc/$', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    url(r'^api/0.1/polling_places/search/$', PollingPlacesSearchViewSet.as_view(), name='api-polling-places-search'),
    url(r'^api/0.1/polling_places/nearby/$', PollingPlacesNearbyViewSet.as_view(), name='api-polling-places-nearby'),
    url(r'^api/0.1/stalls/pending/$', PendingStallsViewSet.as_view(), name='api-stalls-pending'),
    url(r'^api/0.1/', include(router.urls)),
    url(r'^api/0.1/self$', CurrentUserView.as_view(), name='api-self'),
    url(r'^api/0.1/logout$', LogoutUserView.as_view(), name='api-logout'),
    # make sure that the API never serves up the react app
    url(r'^api/0.1/.*', api_not_found),
]
