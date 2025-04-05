from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework import routers
from rest_framework.permissions import AllowAny

from django.urls import include, path, re_path

from .views import (
    CurrentUserView,
    ElectionMapStaticImageCurrentDefaultElectionViewSet,
    ElectionMapStaticImageViewSet,
    ElectionsViewSet,
    ImpossibilitiesViewSet,
    LogoutUserView,
    MailManagementViewSet,
    PendingStallsViewSet,
    PollingPlaceFacilityTypeViewSet,
    PollingPlacesGeoJSONViewSet,
    PollingPlacesJSONViewSet,
    PollingPlacesNearbyViewSet,
    PollingPlacesSearchViewSet,
    PollingPlacesViewSet,
    ProfileViewSet,
    StallsViewSet,
    UserViewSet,
    api_not_found,
)

router = routers.DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"profile", ProfileViewSet, "ProfileViewSet")
router.register(r"elections", ElectionsViewSet, "ElectionsViewSet")
router.register(r"polling_places", PollingPlacesViewSet, "PollingPlacesViewSet")
router.register(r"map", PollingPlacesGeoJSONViewSet, "PollingPlacesGeoJSONViewSet")
router.register(
    r"map_image", ElectionMapStaticImageViewSet, "ElectionMapStaticImageViewSet"
)
router.register(r"export", PollingPlacesJSONViewSet, "PollingPlacesJSONViewSet")
router.register(r"stalls", StallsViewSet, "StallsViewSet")
router.register(
    r"polling_places_facility_types",
    PollingPlaceFacilityTypeViewSet,
    "PollingPlaceFacilityTypeViewSet",
)
router.register(r"mail", MailManagementViewSet, "MailManagementViewSet")
router.register(r"impossibilities", ImpossibilitiesViewSet, "ImpossibilitiesViewSet")

# Need to set base_name because Reasons
# http://www.django-rest-framework.org/api-guide/routers/#usage (see note re `base_name`)
# http://stackoverflow.com/questions/22083090/what-base-name-parameter-do-i-need-in-my-route-to-make-this-django-api-work
# router.register(r'profile', ProfileViewSet, 'ProfileViewSet')

urlpatterns = [
    re_path(r"^api/0.1/schema/$", SpectacularAPIView.as_view(), name="schema"),
    re_path(
        r"^api/0.1/schema/swagger-ui/$",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    re_path(
        r"^api/0.1/schema/redoc/$",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    re_path(
        r"^api/0.1/polling_places/search/$",
        PollingPlacesSearchViewSet.as_view(),
        name="api-polling-places-search",
    ),
    re_path(
        r"^api/0.1/polling_places/nearby/$",
        PollingPlacesNearbyViewSet.as_view(),
        name="api-polling-places-nearby",
    ),
    re_path(
        r"^api/0.1/stalls/pending/$",
        PendingStallsViewSet.as_view(),
        name="api-stalls-pending",
    ),
    re_path(r"^api/0.1/", include(router.urls)),
    re_path(
        r"^api/0.1/current_map_image/$",
        ElectionMapStaticImageCurrentDefaultElectionViewSet.as_view(),
        name="current-map-image",
    ),
    re_path(r"^api/0.1/self$", CurrentUserView.as_view(), name="api-self"),
    re_path(r"^api/0.1/logout$", LogoutUserView.as_view(), name="api-logout"),
    # make sure that the API never serves up the react app
    re_path(r"^api/0.1/.*", api_not_found),
]
