from demsausage.app.sausage.mailgun import make_confirmation_hash
from django.contrib.auth.models import AnonymousUser, User
from rest_framework import permissions


class AnonymousOnlyList(permissions.BasePermission):
    """
    Custom permission to allow read-only access to lists of objects for anonymous users.
    """

    def has_permission(self, request, view):
        if view.action == "list" or view.action == "polling_places" or view.action == "polling_places_nearby":
            return True
        return isinstance(request.user, User)


class AnonymousOnlyCreate(permissions.BasePermission):
    """
    Custom permission to allow the public to create certain entities (e.g. stalls).
    """

    def has_permission(self, request, view):
        if view.action == "create":
            return True
        return isinstance(request.user, User)


class AnonymousOnlyGET(permissions.BasePermission):
    """
    Custom permission to allow anonymous users to only make GET requests.
    """

    def has_permission(self, request, view):
        if request.method == "GET":
            return True
        elif isinstance(request.user, AnonymousUser) is False:
            return True
        return False


class StallEditingPermissions(permissions.BasePermission):
    """
    Custom permission to allow the public to retrieve and update the stalls they submitted.
    """

    def has_permission(self, request, view):
        if view.action == "create":
            return True
        elif view.action == "retrieve":
            stall = view.get_object()
            token = request.query_params.get("token", None)
            signature = request.query_params.get("signature", None)

            return make_confirmation_hash(stall.id, token) == signature
        elif view.action == "update_and_resubmit":
            stall = view.get_object()
            token = request.data.get("token", None)
            signature = request.data.get("signature", None)

            return make_confirmation_hash(stall.id, token) == signature
        return isinstance(request.user, User)


# class AllowAnyIfPublicSite(permissions.AllowAny):
#     """
#     Custom permission to modify the base AllowAny permission if this is a public Ealgis site.
#     """

#     def has_permission(self, request, view):
#         if is_private_site() is False:
#             return True

#         return isinstance(request.user, User)


# class IsAuthenticatedAndApproved(permissions.BasePermission):
#     """
#     Custom permission to limit access to authenticated users who have been approved.
#     """

#     def has_permission(self, request, view):
#         if isinstance(request.user, AnonymousUser):
#             return False

#         return request.user.profile.is_approved is True


# class IsMapOwnerOrReadOnly(permissions.BasePermission):
#     """
#     Custom permission to only allow owners of a map to modify it.
#     """

#     def has_object_permission(self, request, view, obj):
#         # Read permissions are allowed for all non-modifying requests.
#         # i.e. GET, HEAD, and OPTIONS
#         if request.method in permissions.SAFE_METHODS:
#             return True

#         # Write permissions are only allowed for map owners.
#         return obj.owner_user_id == request.user


# class IsMapOwner(permissions.BasePermission):
#     """
#     Custom permission to allow map owners through.
#     """

#     def has_object_permission(self, request, view, obj):
#         return obj.owner_user_id == request.user


# class CanViewOrCloneMap(permissions.BasePermission):
#     """
#     Custom permission to allow anyone to view stuff if this is a public Ealgis site.
#     """

#     def has_object_permission(self, request, view, obj):
#         if obj.owner_user_id == request.user:
#             return True

#         if obj.shared == MapDefinition.AUTHENTICATED_USERS_SHARED or obj.shared == MapDefinition.PUBLIC_SHARED:
#             return True
#         return False
