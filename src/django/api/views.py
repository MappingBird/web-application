# Create your views here.
import json

from django.middleware import csrf
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

from rest_framework import viewsets, status
from rest_framework.decorators import link
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response

from serializers import UserSerializer, CollectionSerializer, PointSerializer, ImageSerializer, CollectionByUserSerializer
from api.forms import UserCreationForm
from base.models import User
from bucketlist.models import Collection, Point, Image
from permissions import IsOwner


class APIViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        response = super(APIViewSet, self).list(request, *args, **kwargs)
        self.check_object_permissions(self.request, None)

        return response


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @csrf_exempt
    def create(self, request):
        form = UserCreationForm(request.DATA)

        if form.is_valid():
            user = form.save()
            return Response(request.DATA, status=status.HTTP_201_CREATED)

        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    @link(permission_classes=[IsOwner])
    def collections(self, request, pk=None):
        user = self.get_object()
        queryset = user.collection_set.all()
        serializer = CollectionByUserSerializer(queryset, many=True)

        data = {'collections': serializer.data, }
        try:
            data['most_recent_modified_collection'] = queryset.order_by('-points__update_time')[0].id
        except Exception, e:
            data['most_recent_modified_collection'] = None

        return Response(data)


class CollectionViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)


class PointViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Point.objects.all()
    serializer_class = PointSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)


class ImageViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)


def token(request):
    out = {
        'token': csrf.get_token(request),
    }

    return HttpResponse(json.dumps(out), content_type="application/json")
