# Create your views here.
import json
import os
import os.path
import time

from django.conf import settings

from rest_framework.decorators import link, api_view, parser_classes, authentication_classes, permission_classes
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response

from geopy.geocoders import GoogleV3

from api import views
from base.models import User
from bucketlist.models import Collection, Point, Image, Location, Tag


class UserViewSet(views.UserViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


class CollectionViewSet(views.CollectionViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


class LocationViewSet(views.LocationViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


class TagViewSet(views.TagViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


class PointViewSet(views.PointViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


class ImageViewSet(views.ImageViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    authentication_classes = (BasicAuthentication, )


@api_view(['GET'])
@authentication_classes((BasicAuthentication,))
@permission_classes((IsAuthenticated, ))
def pointsbytag(request, name=None):
    return views.pointsbytag(request, name)


@api_view(['GET'])
@authentication_classes((BasicAuthentication,))
@permission_classes((IsAuthenticated, ))
def tags(request):
    return views.tags(request)


@api_view(['GET'])
@authentication_classes((BasicAuthentication,))
@permission_classes((IsAuthenticated, ))
def current_user(request):
    serializer = UserSerializer(request.user)

    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes((BasicAuthentication,))
def geocode(request):
    return views.geocode(request)


@api_view(['POST'])
@parser_classes((FileUploadParser,))
@authentication_classes((BasicAuthentication,))
@permission_classes((IsAuthenticated, ))
def upload_media(request):
    return views.upload_media(request)
