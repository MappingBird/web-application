from django.conf.urls import patterns, url, include

from rest_framework import routers

import views

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'users', views.UserViewSet)
router.register(r'collections', views.CollectionViewSet)
router.register(r'points', views.PointViewSet)
router.register(r'images', views.ImageViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^token$', 'api.views.token', name='token'),
    url(r'^user/current$', 'api.views.current_user', name='current_user'),
    url(r'^user/login$', 'api.views.login', name='login'),
    url(r'^user/logout$', 'api.views.logout', name='logout'),
    url(r'^scraper$', 'api.scraper.scraper', name='scraper'),
)
