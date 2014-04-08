#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.core.management import setup_environ

import os, sys, inspect
import re

cmd_folder = os.path.realpath(os.path.abspath(os.path.split(inspect.getfile( inspect.currentframe() ))[0]))
root_folder = os.path.realpath(os.path.join(cmd_folder, '..'))
if root_folder not in sys.path:
    sys.path.insert(0, root_folder)

os.environ["DJANGO_SETTINGS_MODULE"] = "pingismo.settings.local"

from bucketlist.models import Point, Location

for p in Point.objects.all():
    if not p.location:
        if p.place_name and p.coordinates:
            try:
                location = Location.objects.get(place_name=p.place_name, coordinates=p.coordinates)
            except Location.DoesNotExist:
                location = Location()
                location.place_name = p.place_name
                location.place_address = p.place_address
                location.place_phone = p.place_phone
                location.coordinates = p.coordinates
                location.save()

            print 'Point #%d transferred' % p.id
            p.location = location
            p.place_name = ''
            p.place_address = ''
            p.place_phone = ''
            p.coordinates = ''
            p.save()
    else:
        print 'Point #%d already transferred' % p.id
        p.place_name = ''
        p.place_address = ''
        p.place_phone = ''
        p.coordinates = ''
        p.save()
