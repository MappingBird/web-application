# Create your views here.
from django.shortcuts import redirect
from django.contrib.staticfiles.views import serve

def home(request):
    if request.user.is_authenticated():
        return redirect('/static/app.html')

    return serve(request, path='/index.html')
