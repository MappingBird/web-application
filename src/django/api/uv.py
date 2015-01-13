# Create your views here.
import json
import uservoice
from uservoice.client import APIError

from django.conf import settings
from django.http import HttpResponse

def feedback(request):
    SUBDOMAIN_NAME = 'pingismo'
    API_KEY = settings.USERVOICE_API_KEY
    API_SECRET = settings.USERVOICE_API_SECRET

    try:
        client = uservoice.Client(SUBDOMAIN_NAME, API_KEY, API_SECRET)
        out = client.post("/api/v1/tickets.json", {
            'email': request.REQUEST.get('email'),
            'ticket': {
                'subject': request.REQUEST.get('subject'),
                'message': request.REQUEST.get('message'),
            }
        })
    except APIError, e:
        out = e.message

    return HttpResponse(json.dumps(out), content_type='application/json')
