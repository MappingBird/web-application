# Create your views here.
import json
import os
import os.path
import time

from django.middleware import csrf
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.contrib.auth import login as django_login, logout as django_logout, authenticate
from django.db.models import Count
from django.conf import settings

from rest_framework import viewsets, status
from rest_framework.decorators import link, action, api_view, parser_classes, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import FileUploadParser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from geopy.geocoders import GoogleV3
from googleplaces import GooglePlaces

import requests
from PIL import Image as PImage

from serializers import UserSerializer, CollectionSerializer, CollectionShortSerializer, PointShortSerializer, PointSerializer, PointWriteSerializer, ImageSerializer, CollectionByUserSerializer, LocationSerializer, TagSerializer
from api.forms import UserCreationForm, UserChangeForm
from base.models import User
from base.mail import send_mail
from bucketlist.models import Collection, Point, Image, Location, Tag
from permissions import IsOwner, IsOwnerOrAdmin


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

    def list(self, request, *args, **kwargs):
        self.permission_classes = [IsAdminUser]
        self.initial(request, args, kwargs)

        return super(UserViewSet, self).list(request, args, kwargs)

    @link(permission_classes=[IsOwnerOrAdmin])
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

    def retrieve(self, request, *args, **kwargs):
        self.permission_classes = [IsOwnerOrAdmin]
        self.initial(request, args, kwargs)

        return super(UserViewSet, self).retrieve(request, args, kwargs)

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

    @action(permission_classes=[IsOwnerOrAdmin])
    def destroy(self, request, *args, **kwargs):
        return super(UserViewSet, self).list(request, args, kwargs)

class CollectionViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication, )
    permission_classes = (IsOwnerOrAdmin,)


class CollectionShortViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Collection.objects.all()
    serializer_class = CollectionShortSerializer

    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication, )
    permission_classes = (IsOwnerOrAdmin,)


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

    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication, )
    permission_classes = (IsOwnerOrAdmin,)

    def create(self, request, *args, **kwargs):
        data = request.DATA.copy()
        tags = None
        if data.get('tags'):
            tags = data.get('tags')
            del data['tags']

        data['category'] = data['type']

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
        del data['category']

        # Need to use Write Serializer for related field (location)
        serializer = PointWriteSerializer(data=data, files=request.FILES)
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

    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication, )
    permission_classes = (IsOwnerOrAdmin,)

    def create(self, request, *args, **kwargs):
        data = request.DATA.copy()

        # save thumbnail
        url = data.get('url')
        r = requests.get(url, stream=True)
        if r.status_code == 200:

            # path: media/images/$id
            images_upload_path = os.path.join(settings.MEDIA_ROOT, 'images')

            if not os.path.exists(images_upload_path):
                os.mkdir(images_upload_path)

            images_upload_path = os.path.join(images_upload_path, data.get('point'))

            if not os.path.exists(images_upload_path):
                os.mkdir(images_upload_path)

            path = '%s/%f' % (images_upload_path, time.time())
            with open(path, 'wb') as f:
                for chunk in r.iter_content():
                    f.write(chunk)

            f.close()

            im = PImage.open(path)
            # im.thumbnail((512, 512), PImage.ANTIALIAS)
            im.thumbnail((96, 96), PImage.ANTIALIAS)

            format_map = {
                'JPEG': 'jpg',
                'PNG': 'png',
                'GIF': 'gif',
                'TIFF': 'tiff',
            }
            final_path = '%s_thumb.%s' % (path, format_map[im.format])
            im.save('%s' % final_path, format=im.format, quality=90)

            split_index = final_path.find('/media')
            url_path = final_path[split_index:]
            data['thumb_path'] = request.build_absolute_uri(url_path)

        serializer = self.get_serializer(data=data, files=request.FILES)

        if serializer.is_valid():
            self.pre_save(serializer.object)
            self.object = serializer.save(force_insert=True)
            self.post_save(self.object, created=True)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED,
                            headers=headers)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_success_headers(self, data):
        try:
            return {'Location': data['url']}
        except (TypeError, KeyError):
            return {}


@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def pointsbytag(request, name=None):
    points = Point.objects.filter(collection__user=request.user, tags__name=name)
    serializer = PointSerializer(points, many=True)

    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes((SessionAuthentication, TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def tags(request):
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
    token = request.DATA.get('token')
    user = authenticate(email=email, password=password)
    if user is not None:
        serializer = UserSerializer(user)

        if user.is_active:
            data = {
                'user': serializer.data,
            }
            if token == '1' or token == 1:
                token = Token.objects.get_or_create(user=user)[0]
                data['token'] = token.key
            else:
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

@api_view(['GET'])
def geocode(request):
    geolocator = GoogleV3()
    out = {}
    if request.GET.get('q'):
        out['results'] = []
        query = request.GET.get('q')
        results = geolocator.geocode(query, exactly_one=False)

        for result in results:
            out_result = {
                'address': result[0].encode('utf-8'),
                'lat': result[1][0],
                'lng': result[1][1],
            }
            out['results'].append(out_result)

        return Response(out)

    elif request.GET.get('lat') and request.GET.get('lng'):
        out['results'] = []
        results = geolocator.reverse('%s, %s' % (request.GET.get('lat'), request.GET.get('lng')), exactly_one=False)

        for result in results:
            out_result = {
                'address': result[0].encode('utf-8'),
                'lat': result[1][0],
                'lng': result[1][1],
            }
            out['results'].append(out_result)

        return Response(out)

    out['error'] = 'No q or lat lng provided'
    return Response(out)

@api_view(['GET'])
def places(request):
    out = {}
    if request.GET.get('q'):
        gp = GooglePlaces(settings.GOOGLE_API_KEY)
        result = gp.text_search(query=request.GET.get('q').encode('utf-8'))
        out['places'] = []

        for place in result.places:
            place.get_details()
            entry = {
                'name': place.name,
                'address': place.formatted_address,
                'coordinates': place.geo_location
            }

            out['places'].append(entry)

        return Response(out)

    out['error'] = 'No q is provided'
    return Response(out)

@api_view(['POST'])
@parser_classes((FileUploadParser,))
@authentication_classes((SessionAuthentication, TokenAuthentication, BasicAuthentication))
@permission_classes((IsAuthenticated, ))
def upload_media(request):
    out = {}
    file_obj = request.FILES['media']

    # path: media/users/$id
    user_upload_path = os.path.join(settings.MEDIA_ROOT, 'users')

    if not os.path.exists(user_upload_path):
        os.mkdir(user_upload_path)

    user_upload_path = os.path.join(user_upload_path, str(request.user.id))

    if not os.path.exists(user_upload_path):
        os.mkdir(user_upload_path)

    orig_fn, orig_ext = os.path.splitext(file_obj.name)
    filename = u'%s.%s' % (orig_fn, time.time())
    outpath = u'users/%d/%s%s' % (request.user.id, filename, orig_ext)

    f = open(os.path.join(settings.MEDIA_ROOT, outpath), 'wb+')
    for chunk in file_obj.chunks():
        f.write(chunk)
    f.close()

    url = 'http%s://%s%s%s' % ('s' if request.is_secure() else '', request.META.get('HTTP_HOST'), settings.MEDIA_URL, outpath)
    out['url'] = url

    if request.REQUEST.get('point'):
        try:
            point = Point.objects.get(pk=request.REQUEST.get('point'))
            if point.collection.user == request.user:
                image = Image()
                image.url = url
                image.point = point
                image.save()

                serialized = ImageSerializer(image)
                return Response(serialized.data)

        except Point.DoesNotExist:
            pass

    return Response(out)
