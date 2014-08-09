# Create your views here.
from django.shortcuts import redirect
from django.contrib.staticfiles.views import serve

def home(request):
    '''
    stay = request.GET.get('stay')
    if request.user.is_authenticated() and stay != '1' and stay != 1:
        return redirect('/static/app.html')
    '''

    return serve(request, path='/index.html')
