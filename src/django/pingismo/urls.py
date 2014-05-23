from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pingismo.views.home', name='home'),
    # url(r'^pingismo/', include('pingismo.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^api/', include('api.urls')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'', include('bucketlist.urls', namespace='bucketlist')),

    # home
    url(r'^$', 'base.views.home', name='home'),
)

urlpatterns += patterns('django.contrib.staticfiles.views',
        url(r'^app$', 'serve', {'path': '/app.html'}))
urlpatterns += patterns('django.contrib.staticfiles.views',
        url(r'^login$', 'serve', {'path': '/login.html'}))
urlpatterns += patterns('django.contrib.staticfiles.views',
        url(r'^signup$', 'serve', {'path': '/signup.html'}))
urlpatterns += patterns('django.contrib.staticfiles.views',
        url(r'^forget/password$', 'serve', {'path': '/forget_password.html'}))

urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
