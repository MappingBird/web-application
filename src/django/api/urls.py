from django.conf.urls import patterns, url, include

from rest_framework import routers

import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', views.UserViewSet)
router.register(r'collections', views.CollectionViewSet)
router.register(r'col', views.CollectionShortViewSet)
router.register(r'points', views.PointViewSet)
router.register(r'locations', views.LocationViewSet)
router.register(r'images', views.ImageViewSet)
router.register(r'tags', views.TagViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^token$', 'api.views.token', name='token'),
    url(r'^user/current$', 'api.views.current_user', name='current_user'),
    url(r'^user/pointsbytag/(?P<name>\S+)?$', 'api.views.pointsbytag', name='user_pointsbytag'),
    url(r'^user/tags$', 'api.views.tags', name='user_tags'),
    url(r'^user/login$', 'api.views.login', name='login'),
    url(r'^user/logout$', 'api.views.logout', name='logout'),
    url(r'^scraper$', 'api.scraper.scraper', name='scraper'),
    url(r'^geocode$', 'api.views.geocode', name='geocode'),
    url(r'^upload$', 'api.views.upload_media', name='upload'),
    url(r'^places$', 'api.views.places', name='places'),
    url(r'^feedback$', 'api.uv.feedback', name='feedback'),
    url(r'^user/temp$', 'api.views.gen_temp', name='temp'),
    url(r'^user/temp2real$', 'api.views.mig_temp2real', name='temp2real'),
    url(r'^user/is_email_used$', 'api.views.is_email_used', name='is_email_used'),
)


# mobile
import mobile

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', mobile.UserViewSet)
router.register(r'collections', mobile.CollectionViewSet)
router.register(r'points', mobile.PointViewSet)
router.register(r'locations', mobile.LocationViewSet)
router.register(r'images', mobile.ImageViewSet)
router.register(r'tags', mobile.TagViewSet)

mobileurlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^token$', 'api.mobile.token', name='token'),
    url(r'^user/current$', 'api.mobile.current_user', name='current_user'),
    url(r'^user/pointsbytag/(?P<name>\S+)?$', 'api.mobile.pointsbytag', name='user_pointsbytag'),
    url(r'^user/tags$', 'api.mobile.tags', name='user_tags'),
    url(r'^scraper$', 'api.scraper.scraper', name='scraper'),
    url(r'^geocode$', 'api.mobile.geocode', name='geocode'),
    url(r'^upload$', 'api.mobile.upload_media', name='upload'),
    url(r'^places$', 'api.mobile.places', name='places'),
)

urlpatterns += (
    url(r'^mobile/', include(mobileurlpatterns, namespace='mobile')),
)
