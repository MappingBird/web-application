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
)
