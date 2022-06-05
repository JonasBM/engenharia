from rest_framework import permissions


class IsUser(permissions.IsAuthenticated):
    """
    Permission only for User Model
    Allowed for own user profile
    """

    def has_object_permission(self, request, view, obj):
        return bool(obj == request.user)
