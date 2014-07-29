from rest_framework import serializers

from base.models import User
from bucketlist.models import Collection, Point, Image, Location, Tag


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', )


class ImageSerializer(serializers.HyperlinkedModelSerializer):
    point = serializers.PrimaryKeyRelatedField()

    class Meta:
        model = Image
        fields = ('id', 'url', 'thumb_path', 'point', 'create_time', 'update_time', )


class ImageShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'url', 'thumb_path', )


class LocationSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'place_name', 'place_address', 'place_phone', 'coordinates', 'category', 'create_time', 'update_time', )


class TagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', )


class PointSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    location = LocationSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Point
        fields = ('id', 'title', 'url', 'description', 'place_name', 'place_address', 'place_phone', 'coordinates', 'type', 'images', 'tags', 'collection', 'location', 'create_time', 'update_time', )


class PointShortSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    # location = LocationSerializer(read_only=True)
    location = serializers.PrimaryKeyRelatedField(read_only=True)
    images = ImageShortSerializer(many=True, read_only=True)

    class Meta:
        model = Point
        fields = ('id', 'title', 'coordinates', 'type', 'images', 'location', )



class PointWriteSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    location = serializers.PrimaryKeyRelatedField(required=False)
    images = ImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Point
        fields = ('id', 'title', 'url', 'description', 'place_name', 'place_address', 'place_phone', 'coordinates', 'type', 'images', 'tags', 'collection', 'location', 'create_time', 'update_time', )


class CollectionSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = PointSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time', )


class CollectionShortSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = PointShortSerializer(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', )


class CollectionByUserSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time', )
