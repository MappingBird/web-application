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

from base.models import User
from rest_framework.authtoken.models import Token

for user in User.objects.all():
    Token.objects.get_or_create(user=user)
