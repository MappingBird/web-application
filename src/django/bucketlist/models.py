# -*- coding: utf-8 -*-
import datetime
from django.db import models

from base.models import User

# Create your models here.
class Collection(models.Model):
    name = models.CharField(max_length=512, blank=True)
    user = models.ForeignKey(User)

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Location(models.Model):
    place_name = models.CharField(max_length=512, blank=True)
    place_address = models.CharField(max_length=128, blank=True)
    place_phone = models.CharField(max_length=64, blank=True)
    coordinates = models.CharField(max_length=64, blank=True)
    category = models.CharField(max_length=32, blank=True) # Should define the choices afterwards

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Tag(models.Model):
    name = models.CharField(max_length=64)


#
#'{"periods": [{"close": {"day": 0, "time": "1400"}, "open": {"day": 0, "time": "1130"}}, {"close": {"day": 0, "time": "2100"}, "open": {"day": 0, "time": "1730"}}, {"close": {"day": 1, "time": "1400"}, "open": {"day": 1, "time": "1130"}},{"close": {"day": 1, "time": "2100" }, "open": {"day": 1, "time": "1730"}}]}'
#
class BH_Close(models.Model):
    day = models.IntegerField(blank=True, null=True)
    time = models.CharField(max_length=16, blank=True, null=True)

    def __unicode__(self):
        return "close at {0} on {1}".format(self.time, self.day)

class BH_Open(models.Model):
    day = models.IntegerField(blank=True, null=True)
    time = models.CharField(max_length=16, blank=True, null=True)

    def __unicode__(self):
        return "open at {0} on {1}".format(self.time, self.day)

class Business_Hour(models.Model):
    pass

class BH_Period(models.Model):
    bh = models.ForeignKey(Business_Hour, related_name='periods', blank=True, null=True)
    open = models.ForeignKey(BH_Open, related_name='period', blank=True, null=True)
    close = models.ForeignKey(BH_Close, related_name='period', blank=True, null=True)


class Point(models.Model):
    title = models.CharField(max_length=512, blank=True)
    url = models.URLField(blank=True, max_length=4096)
    description = models.TextField(blank=True)
    place_name = models.CharField(max_length=512, blank=True)
    place_address = models.CharField(max_length=128, blank=True)
    place_phone = models.CharField(max_length=64, blank=True)
    coordinates = models.CharField(max_length=64, blank=True)
    type = models.CharField(max_length=32, blank=True) # Should define the choices afterwards
    collection = models.ForeignKey(Collection, related_name='points')
    location = models.ForeignKey(Location, related_name='points', null=True, blank=True)
    tags = models.ManyToManyField(Tag)
#    business_hours = models.ForeignKey(Business_Hour, related_name='points', null=True, blank=True)

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Image(models.Model):
    url = models.URLField(blank=True, max_length=4096)
    thumb_path = models.URLField(blank=True)
    point = models.ForeignKey(Point, related_name='images')

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


def get_reset_password_expire_date():
    return datetime.datetime.today() + datetime.timedelta(days=1)


class ResetPasswordRecord(models.Model):
    email = models.EmailField(u'E-mail', max_length=255)
    request_code = models.CharField(max_length=64)
    create_time = models.DateTimeField(auto_now_add=True)
    expired_time = models.DateTimeField(default=get_reset_password_expire_date)
    update_time = models.DateTimeField(auto_now=True)
    is_updated = models.BooleanField(default=False)



