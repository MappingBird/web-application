# -*- coding: utf-8 -*-
from django import forms
from allauth.account.utils import (user_username, user_email)
from allauth.account.forms import SetPasswordField, PasswordField
from django.utils.translation import pgettext, ugettext_lazy as _, ugettext

from models import User

class SignupForm(forms.Form):
    password1 = SetPasswordField(label=_("Password"))
    password2 = PasswordField(label=_("Password (again)"))

    def clean(self):
        super(SignupForm, self).clean()
        if "password1" in self.cleaned_data and "password2" in self.cleaned_data:
            if self.cleaned_data["password1"] != self.cleaned_data["password2"]:
                raise forms.ValidationError(_("You must type the same password each time."))
        return self.cleaned_data

    def save(self, user):
        user.set_password(self.cleaned_data['password1'])
        user.save()
