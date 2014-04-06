# Create your views here.
import json

from django.middleware import csrf
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth import login as django_login, logout as django_logout, authenticate
from django.db.models import Count

from rest_framework import viewsets, status
from rest_framework.decorators import link, api_view
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response

from serializers import UserSerializer, CollectionSerializer, PointSerializer, ImageSerializer, CollectionByUserSerializer, LocationSerializer, TagSerializer
from api.forms import UserCreationForm, UserChangeForm
from base.models import User
from base.mail import send_mail
from bucketlist.models import Collection, Point, Image, Location, Tag
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

            send_mail([user.email], 'hello.html', {}, 'Welcome to Pingismo')
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

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', None)
        self.object = self.get_object_or_none()

        if self.object == None:
            # Error
            return Response('Cannot find the user with the corresponding id', status=status.HTTP_400_BAD_REQUEST)
        elif self.object != request.user:
            # Error
            return Response('The logined in user does not match the PUT user id', status=status.HTTP_400_BAD_REQUEST)
        else:
            email = request.DATA.get('email')
            if email and not self.object.email.endswith('@gu.mappingbird.com') and email != self.object.email:
                # Error
                return Response('Trying to change email with a normal account', status=status.HTTP_400_BAD_REQUEST)

            form = UserChangeForm(request.DATA, user=self.object)
            if form.is_valid():
                user = form.save()

                serializer = self.get_serializer(user, data=request.DATA,
                        files=request.FILES, partial=partial)

                return Response(serializer.data, status=status.HTTP_200_OK)

            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

class CollectionViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)


class LocationViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


class TagViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class PointViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Point.objects.all()
    serializer_class = PointSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)

    def create(self, request, *args, **kwargs):
        data = request.DATA.copy()
        tags = None
        if data.get('tags'):
            tags = data.get('tags')
            del data['tags']

        # Deal with Location first
        try:
            location = Location.objects.get(place_name=data.get('place_name'), coordinates=data.get('coordinates'))
        except Location.DoesNotExist:
            location_serializer = LocationSerializer(data=data)
            if location_serializer.is_valid():
                location = location_serializer.save(force_insert=True)
            else:
                return Response(location_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data['location'] = location.id
        del data['place_name']
        del data['place_address']
        del data['place_phone']
        del data['coordinates']

        serializer = self.get_serializer(data=data, files=request.FILES)
        if serializer.is_valid():
            self.pre_save(serializer.object)
            self.object = serializer.save(force_insert=True)
            self.post_save(self.object, created=True)
            headers = self.get_success_headers(serializer.data)

            # Deal with the tags
            # tags need to be separated by commas
            if tags:
                tags_splitted = tags.split(',')
                for tag in tags_splitted:
                    try:
                        tag_model = Tag.objects.get(name=tag)
                    except Tag.DoesNotExist:
                        tag_model = Tag(name=tag)
                        tag_model.save()

                    self.object.tags.add(tag_model)

            serializer = self.get_serializer(self.object)
            return Response(serializer.data, status=status.HTTP_201_CREATED,
                                        headers=headers)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImageViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsOwner,)


@api_view(['GET'])
def pointsbytag(request, name=None):
    if request.user.is_authenticated():
        points = Point.objects.filter(collection__user=request.user, tags__name=name)
        serializer = PointSerializer(points, many=True)

        return Response(serializer.data)

    return Response({})


@api_view(['GET'])
def tags(request):
    if request.user.is_authenticated():
        tags = Point.objects.filter(collection__user=request.user).values('tags__name', 'tags__id').annotate(count=Count('tags')).order_by('-count')
        output = []
        for t in tags:
            record = {
                'id': t['tags__id'],
                'name': t['tags__name'],
                'count': t['count'],
            }

            output.append(record)

        return Response({'tags': output})

    return Response({})


@api_view(['GET'])
def token(request):
    out = {
        'token': csrf.get_token(request),
    }

    return Response(out)

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated():
        serializer = UserSerializer(request.user)

        return Response(serializer.data)

    return Response({})

@api_view(['POST'])
def login(request):
    email = request.DATA.get('email')
    password = request.DATA.get('password')
    print email, password
    user = authenticate(email=email, password=password)
    if user is not None:
        serializer = UserSerializer(user)
        data = {'user': serializer.data}

        if user.is_active:
            django_login(request, user)

            return Response(data)
        else:
            data['error'] = 'not_active'
            return Response(data)

    return Response({'error': 'authentication_error'})

@api_view(['GET'])
def logout(request):
    django_logout(request)

    return Response({})
