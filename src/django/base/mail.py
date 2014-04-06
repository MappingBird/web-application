# -*- coding: utf-8 -*-
from django.core.mail import EmailMessage
from django.template import Context, loader

def send_mail(recipient, template, context_dict, subject):
    from_email = 'Pingismo <no-reply@mappingbird.com>'
    # headers = {'Reply-To': 'service@house123.com.tw'}
    headers = {}
    to = recipient

    t = loader.get_template("email/%s" % template)
    c = Context(context_dict)
    html_content = t.render(c)

    msg = EmailMessage(subject, html_content, from_email, to, headers=headers)
    msg.content_subtype = 'html'
    msg.send()
