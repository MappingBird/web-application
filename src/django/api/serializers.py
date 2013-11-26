from rest_framework import serializers

from base.models import User
from bucketlist.models import Collection, Point, Image


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', )


class ImageSerializer(serializers.HyperlinkedModelSerializer):
    point = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = Image
        fields = ('id', 'url', 'point', 'create_time', 'update_time', )


class PointSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    images = ImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Point
        fields = ('id', 'title', 'url', 'description', 'place_name', 'place_address', 'place_phone', 'coordinates', 'type', 'images', 'collection', 'create_time', 'update_time', )


class CollectionSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = PointSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time', )


class CollectionByUserSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time', )
