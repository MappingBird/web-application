from rest_framework import permissions

from bucketlist.models import Collection, Point, Image, User

class IsOwner(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to view and edit it
    """

    def has_object_permission(self, request, view, obj):
        if not obj:
            # Should be a list
            return request.user.is_superuser

        if isinstance(obj, Collection):
            return request.user == obj.user

        if isinstance(obj, Point):
            return request.user == obj.collection.user

        if isinstance(obj, Image):
            return request.user == obj.point.collection.user

        if isinstance(obj, User):
            return request.user == obj

        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to view and edit it
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser or request.user.is_staff:
            return True

        if not obj:
            # Should be a list
            return request.user.is_superuser

        if isinstance(obj, Collection):
            return request.user == obj.user

        if isinstance(obj, Point):
            return request.user == obj.collection.user

        if isinstance(obj, Image):
            return request.user == obj.point.collection.user

        if isinstance(obj, User):
            return request.user == obj

        return False
