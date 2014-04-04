# -*- coding: utf-8 -*-
from django.db import models

from base.models import User

# Create your models here.
class Collection(models.Model):
    name = models.CharField(max_length=512, blank=True)
    user = models.ForeignKey(User)

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Location(models.Model):
    title = models.CharField(max_length=512, blank=True)
    description = models.TextField(blank=True)
    place_name = models.CharField(max_length=512, blank=True)
    place_address = models.CharField(max_length=128, blank=True)
    place_phone = models.CharField(max_length=64, blank=True)
    coordinates = models.CharField(max_length=64, blank=True)
    type = models.CharField(max_length=32, blank=True) # Should define the choices afterwards

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Tag(models.Model):
    name = models.CharField(max_length=32)


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

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)


class Image(models.Model):
    url = models.URLField(blank=True)
    point = models.ForeignKey(Point, related_name='images')

    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)
