# -*- coding: utf-8 -*-　　　←表示使用 utf-8 編碼
# Create your views here.
import json
import os
import os.path
import time
import uuid
import Queue
import threading
from urlparse import urlparse
import datetime

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
import langid
from PIL import Image as PImage

from serializers import UserSerializer, CollectionSerializer, CollectionShortSerializer, PointShortSerializer, PointSerializer, PointWriteSerializer, ImageSerializer, CollectionByUserSerializer, LocationSerializer, TagSerializer
from api.forms import UserCreationForm, UserChangeForm
from base.models import User
from base.mail import send_mail
from bucketlist.models import Collection, Point, Image, Location, Tag, ResetPasswordRecord
from permissions import IsOwner, IsOwnerOrAdmin

import owl

import logging

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

            send_mail([user.email], 'welcome.html', {}, 'Welcome to MappingBird')
            return Response(request.DATA, status=status.HTTP_201_CREATED)

        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        self.permission_classes = [IsAdminUser]
        self.initial(request, args, kwargs)

        return super(UserViewSet, self).list(request, args, kwargs)

    @link(permission_classes=[IsOwnerOrAdmin])
    def collections(self, request, pk=None):
        user = self.get_object()

        # Legacy issue orz
        try:
            original_default = Collection.objects.get(user=user, name='default')
            original_default.name = 'Uncategorized'
            original_default.save()
        except Collection.DoesNotExist:
            pass

        # Try to create default if it does not exist
        try:
            default_collection = Collection.objects.get(user=user, name='Uncategorized')
        except Collection.DoesNotExist:
            default_collection = Collection(user=user, name='Uncategorized')
            default_collection.save()
        except Collection.MultipleObjectsReturned:
            pass

        queryset = user.collection_set.all()
        collections = user.collection_set.exclude(name='Uncategorized')
        serializer = CollectionByUserSerializer([default_collection] + list(collections.order_by('name')), many=True)

        data = {'collections': serializer.data, }
        try:
#            data['most_recent_modified_collection'] = queryset.order_by('-points__update_time')[0].id
            data['most_recent_modified_collection'] = queryset.latest('update_time').id
        except Exception, e:
            data['most_recent_modified_collection'] = None

        return Response(data)

    @link(permission_classes=[IsOwnerOrAdmin])
    def points(self, request, pk=None):
        user = self.get_object()

        queryset = Point.objects.filter(collection__user=user)
        serializer = PointSerializer(queryset, many=True)

        data = {'points': serializer.data, }
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        self.permission_classes = [IsOwnerOrAdmin]
        self.initial(request, args, kwargs)

        return super(UserViewSet, self).retrieve(request, args, kwargs)

    @csrf_exempt
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

        if 'collection' not in data:
            # Legacy issue orz
            try:
                original_default = Collection.objects.get(user=request.user, name='default')
                original_default.name = 'Uncategorized'
                original_default.save()
            except Collection.DoesNotExist:
                pass

            try:
                collection = Collection.objects.get(user=request.user, name='Uncategorized')
            except Collection.DoesNotExist:
                collection = Collection(user=request.user, name='Uncategorized')
                collection.save()
            data['collection'] = collection.id
        else:
            #-- update collection update_time
            c_id = data['collection']
            collection = Collection.objects.get(pk=c_id)
            collection.save()


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


class DLWorker(threading.Thread):
    def __init__(self, q):
        threading.Thread.__init__(self)
        threading.Thread.daemon = True

        self.q_ = q

    def run(self):
        while True:
            try:
                dic = self.q_.get()
                req = dic['req'] if 'req' in dic else None
                imgVS = dic['imgVS'] if 'imgVS' in dic else None
                data = req.DATA.copy()

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
                    data['thumb_path'] = req.build_absolute_uri(url_path)

                serializer = imgVS.get_serializer(data=data, files=req.FILES)

                if serializer.is_valid():
                    imgVS.pre_save(serializer.object)
                    imgVS.object = serializer.save(force_insert=True)
                    imgVS.post_save(imgVS.object, created=True)
                    headers = imgVS.get_success_headers(serializer.data)
#                    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

#                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                print e

            finally:
                self.q_.task_done()


class ImageViewSet(APIViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication, )
    permission_classes = (IsOwnerOrAdmin,)

    #-- threading image download
    img_q = Queue.Queue()
    dlWorkerPool = None
    SIZE_DLWorkers = 20

    def create(self, request, *args, **kwargs):
        data = request.DATA.copy()

#        # save thumbnail
#        url = data.get('url')
#        r = requests.get(url, stream=True)
#        if r.status_code == 200:
#
#            # path: media/images/$id
#            images_upload_path = os.path.join(settings.MEDIA_ROOT, 'images')
#
#            if not os.path.exists(images_upload_path):
#                os.mkdir(images_upload_path)
#
#            images_upload_path = os.path.join(images_upload_path, data.get('point'))
#
#            if not os.path.exists(images_upload_path):
#                os.mkdir(images_upload_path)
#
#            path = '%s/%f' % (images_upload_path, time.time())
#            with open(path, 'wb') as f:
#                for chunk in r.iter_content():
#                    f.write(chunk)
#
#            f.close()
#
#            im = PImage.open(path)
#            # im.thumbnail((512, 512), PImage.ANTIALIAS)
#            im.thumbnail((96, 96), PImage.ANTIALIAS)
#
#            format_map = {
#                'JPEG': 'jpg',
#                'PNG': 'png',
#                'GIF': 'gif',
#                'TIFF': 'tiff',
#            }
#            final_path = '%s_thumb.%s' % (path, format_map[im.format])
#            im.save('%s' % final_path, format=im.format, quality=90)
#
#            split_index = final_path.find('/media')
#            url_path = final_path[split_index:]
#            data['thumb_path'] = request.build_absolute_uri(url_path)
        data['thumb_path'] = ''

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
    geolocator = GoogleV3(api_key=settings.GOOGLE_API_KEY)
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
    out['places'] = []

    #-- query placeDB only
    onlyPlaceDB = request.GET.get('onlyPlaceDB')
    if onlyPlaceDB and 'true' == onlyPlaceDB.lower():
        q_str = request.GET.get('q')
        if q_str:
            b = owl.BarnOwl()
            points = b.getPointByKeyword(q_str)
            try:
                for p in points:
                    entry = {
                        'name': p['place_name'][0],
                        'address': p['address'],
                        'coordinates': {
                            'lat': float(p['latlng'].split(',')[0]),
                            'lng': float(p['latlng'].split(',')[1])
                        },
                        'url': p['url'],
                        'image_url': p['image_url'][:5],
                        'isKnowUrl': True
                    }

                    out['places'].append(entry)
            except Exception, e:
                print e

            return Response(out)

    if request.GET.get('url'):
        url = request.GET.get('url')

        #-- query placeDB
        b = owl.BarnOwl()
        points = b.getPointByUrl(url)
        try:
            for p in points:
                entry = {
                    'name': p['place_name'][0],
                    'address': p['address'],
                    'coordinates': {
                        'lat': float(p['latlng'].split(',')[0]),
                        'lng': float(p['latlng'].split(',')[1])
                    },
                    'url': p['url'],
                    'image_url': p['image_url'][:5],
                    'isKnowUrl': True
                }

                out['places'].append(entry)
                break
        except Exception, e:
            print e

    if request.GET.get('q'):
        gp = GooglePlaces(settings.GOOGLE_API_KEY)

        q = request.GET.get('q')
        lang = request.GET.get('language')
        
        out['kw'] = q

        if lang is None or len(lang.strip()) <= 0:
            lang = langid.classify(q)[0]

        if 'zh' == lang:
            lang = 'zh-TW'
            
        result = gp.text_search(query=q, language=lang)

        for place in result.places:
            place.get_details()

            phone_number = None
            if 'international_phone_number' in place.details:
                phone_number = place.details['international_phone_number']

            business_hours = None
            if 'opening_hours' in place.details:
                business_hours = place.details['opening_hours']

            entry = {
                'place_id': place.place_id,
                'name': place.name,
                'address': place.formatted_address,
                'coordinates': place.geo_location,
                'phone_number': phone_number,
                'business_hours': business_hours
            }

            out['places'].append(entry)

        return Response(out)

    if len(out['places']) <= 0:
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

@api_view(['GET'])
def gen_temp (request):
    #-- gen random Account and Password
    id4 = uuid.uuid4()
    acc = "{0}@mb.tempacc".format(str(id4.time_low))
    pwd = str(id4.node)

    url = urlparse(request.build_absolute_uri())
    apiRoot = "{0}://{1}".format(url[0], url[1])

    #-- sign-up to valid this account
    payload = {'email' : acc, 'password' : pwd}
    r = requests.post("{0}/api/users".format(apiRoot), data=payload)
    if 201 == r.status_code :
       out = {
           'email' : acc,
           'password' : pwd,
       }
       return Response(out)

    return Response('please retry', status=status.HTTP_503_SERVICE_UNAVAILABLE)

@api_view(['POST'])
def mig_temp2real (request):
    out = {}

    try :
        o = json.loads(request.body)
        if 'temp_email' not in o or 'email' not in o or 'temp_password' not in o or 'password' not in o:
            raise ValueError('request parses error, e.g. {"temp_email":"...", "temp_password":"...", "email":"...", "password":"..."}')

        acc = o['email'].strip()
        pwd = o['password'].strip()
        if len(pwd) <= 0 or len(acc) <= 0:
            raise ValueError('invalid Email or Password')
        #-- sign-up the new account
        payload = {'email' : acc, 'password' : pwd}
        url = urlparse(request.build_absolute_uri())
        apiRoot = "{0}://{1}".format(url[0], url[1])
        r = requests.post("{0}/api/users".format(apiRoot), data=payload)
        if 201 != r.status_code :
            raise ValueError('password error or {0} has already been used'.format(acc))

        #-- move collections from temp to real account
        tmp_acc = o['temp_email'].strip()
        u = User.objects.get(email=acc)
        u_tmp = User.objects.get(email=tmp_acc)
        u.collection_set = u_tmp.collection_set.all()

        out = {
            'email' : acc,
            'password' : pwd,
            'status' : 'migration ok'
        }
    except ValueError, e:
        err_out = {
            'error' : str(e)
        }
        return Response(err_out, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist, e:
        err_out = {
            'error' : str(e)
        }
        return Response(err_out, status=status.HTTP_400_BAD_REQUEST)
    except:
        err_out = {
            'error' : str("unexpected error")
        }
        return Response(err_out, status=status.HTTP_400_BAD_REQUEST)

    return Response(out)

@api_view(['GET'])
def is_email_used (request):
    email = request.GET.get('email')
    resp = None

    try:
        u = User.objects.get(email=email)
        out = {
            'msg' : "{0} is used".format(email)
        }
        resp = Response(out, status=status.HTTP_400_BAD_REQUEST)
    except User.DoesNotExist, e:
        out = {
            'msg' : str(e) + '({0})'.format(email)
        }
        resp =  Response(out, status=status.HTTP_200_OK)


    return resp


@api_view(['POST'])
def forget_password (request):

    email = None
    resp = None

    try:
        json_data=json.loads(request.body)
        email = json_data['email']
    except ValueError:
        out = {
            'msg': 'You forget to pass User Email.'
        }
        resp = Response(out, status=status.HTTP_400_BAD_REQUEST)
        return resp

    try:
        now = datetime.datetime.today()
        nextdate = get_reset_password_expire_date();

        # 先檢查之前有沒有發送過（一天內），沒有才繼續做下去
        try:
            # 可能會有一個帳號可能有多筆重設的紀錄，一個個檢查
            record_list = ResetPasswordRecord.objects.filter(email=email, is_updated=False)

            for i, record in enumerate(record_list):

                if record.expired_time > now:
                    out = {
                        'msg': "Have sent reset response. Please check the Email."
                    }
                    resp = Response(out, status=status.HTTP_200_OK)
                    return resp

        except Exception as e:
            print e


        user = User.objects.get(email=email)
        out = {
            'msg': "Get reset password request. Please check the Email."
        }
        resp = Response(out, status=status.HTTP_200_OK)
        request_code = uuid.uuid4()

        record = ResetPasswordRecord(email=email, request_code=request_code)
        record.save()

        # send email here
        # use this if developing
        # resetUrl = 'localhost:9999/reset_password?request_code=' + str(request_code)
        # otherwise use this
        resetUrl = 'https://mappingbird.com/reset_password?request_code=' + str(request_code)

        send_mail([email], 'ResetPassword.html', {'account': email, 'resetUrl': resetUrl}, 'Reset your MappingBird password')


    except User.DoesNotExist, e:
        out = {
            'msg': 'User Account({0}) does not exist'.format(email)
        }
        resp = Response(out, status=status.HTTP_400_BAD_REQUEST)

    return resp


def get_reset_password_expire_date():
    return datetime.datetime.today() + datetime.timedelta(days=1)

@api_view(['POST'])
def reset_password(request):

    password = None
    request_code = None
    resp = None

    try:
        json_data = json.loads(request.body)
        request_code = json_data['request_code']
        password = json_data['password']

    except ValueError:
        out = {
            'msg': 'no valid request_code found'
        }
        resp = Response(out, status=status.HTTP_400_BAD_REQUEST)
        return resp

    try:
        now = datetime.datetime.today()
        record = ResetPasswordRecord.objects.get(request_code=request_code)

        if record.expired_time > now:

            if(record.is_updated == True):
                out = {
                    'msg': 'User\'s password has been updated before, no need to update.'
                }
                resp = Response(out, status=status.HTTP_400_BAD_REQUEST)
                return resp

            user = User.objects.get(email=record.email)

            user.set_password(password)
            user.save()

            out = {
                'msg': 'Update password success'
            }
            resp = Response(out, status=status.HTTP_200_OK)
            record.is_updated = True
            record.save()

        else:
            out = {
                'msg': 'Time for reset password is expired'
            }
            resp = Response(out, status=status.HTTP_400_BAD_REQUEST)

    except ResetPasswordRecord.DoesNotExist, e:
        out = {
            'msg': 'User did\'t request reset password'
        }
        resp = Response(out, status=status.HTTP_400_BAD_REQUEST)

    return resp
