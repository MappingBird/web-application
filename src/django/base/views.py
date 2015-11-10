# Create your views here.
from django.shortcuts import redirect, render
from django.utils.translation import activate

def home(request):
    '''
    stay = request.GET.get('stay')
    if request.user.is_authenticated() and stay != '1' and stay != 1:
        return redirect('/static/app.html')
    '''

    # return serve(request, path='/index.html')
    if request.user.is_authenticated():
        return redirect('/app')

    lang = None
    try:
        lang = request.COOKIES.get('lang')
        if lang is None:
            lang = 'en'
    except Exception as e:
        lang = 'en'
    finally:
        activate(lang)

    return render(request, 'new_index.html')

def page(request, page=None):
    lang = None
    try:
        lang = request.COOKIES.get('lang')
        if lang is None:
            lang = 'en'
    except Exception as e:
        lang = 'en'
    finally:
        activate(lang)

    return render(request, '%s.swig' % page)


def partial_page(request):

    lang = None
    try:
        lang = request.COOKIES.get('lang')
        if lang is None:
            lang = 'en'
    except Exception as e:
        lang = 'en'
    finally:
        activate(lang)

    return render(request, 'partials/%s.html' % request.path)
