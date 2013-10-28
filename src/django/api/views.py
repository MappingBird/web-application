# Create your views here.
from rest_framework import viewsets

from serializers import UserSerializer, CollectionSerializer, PointSerializer, ImageSerializer
from base.models import User
from bucketlist.models import Collection, Point, Image


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer


class CollectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer


class PointViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Point.objects.all()
    serializer_class = PointSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
