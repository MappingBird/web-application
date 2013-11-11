from django.conf.urls import patterns, include, url

urlpatterns = patterns('bucketlist.views',
    # Examples:
    # url(r'^$', 'pingismo.views.home', name='home'),
    # url(r'^pingismo/', include('pingismo.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^scraper', 'scraper', name='scraper'),
)
