from demsausage.app.serializers import UserSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth import logout
from django.contrib.auth.models import User


class CurrentUserView(APIView):
    permission_classes = (AllowAny,)
    schema = None

    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user, context={"request": request})

            return Response({"is_logged_in": True, "user": serializer.data})
        else:
            return Response({"is_logged_in": False, "user": None})


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)
        return Response({})


class ProfileViewSet(viewsets.ViewSet):
    """
    API endpoint that allows user profiles to be viewed and edited.
    """

    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=["post"])
    def update_settings(self, request):
        request.user.profile.merge_settings(request.data)
        request.user.profile.save()
        return Response({"settings": request.user.profile.settings})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = (IsAdminUser,)
