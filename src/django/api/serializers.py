from rest_framework import serializers

from base.models import User
from bucketlist.models import Collection, Point, Image, Location, Tag, Business_Hour, BH_Period, BH_Open, BH_Close 


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


class LocationShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Location
        fields = ('id', 'coordinates', 'place_address', )


class TagSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', )


class BHCloseSerializer(serializers.ModelSerializer):
    class Meta:
        model = BH_Close
        fields = ('day', 'time', )
                    
class BHOpenSerializer(serializers.ModelSerializer):
    class Meta:
        model = BH_Open
        fields = ('day', 'time', )
                                        
class BHPeriodSerializer(serializers.ModelSerializer):
    open = BHOpenSerializer()
    close = BHCloseSerializer()
                                                    
    class Meta:
        model = BH_Period
        fields = ('open', 'close', )

class BHSerializer(serializers.ModelSerializer):
    periods = BHPeriodSerializer(many=True)
                                                                                
    class Meta:
        model = Business_Hour
        fields = ('periods', )

class BHPeriodWriteSerializer(serializers.ModelSerializer):
    open = serializers.PrimaryKeyRelatedField()
    close = serializers.PrimaryKeyRelatedField()
                                                                                                            
    class Meta:
        model = BH_Period
        fields = ('open', 'close', )

class BHWriteSerializer(serializers.ModelSerializer):
    periods = BHPeriodWriteSerializer(many=True)

    class Meta:
        model = Business_Hour
        fields = ('periods', )


class PointSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    location = LocationSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    business_hours = BHSerializer(read_only=True)
    
    class Meta:
        model = Point
        fields = ('id', 'title', 'url', 'description', 'place_name', 'place_address', 'place_phone', 'coordinates', 'type', 'images', 'tags', 'collection', 'location', 'business_hours', 'create_time', 'update_time', )


class PointShortSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    # location = LocationSerializer(read_only=True)
    location = LocationShortSerializer(read_only=True)
    images = ImageShortSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Point
        fields = ('id', 'title', 'coordinates', 'type', 'images', 'location', 'tags', )


class PointWriteSerializer(serializers.HyperlinkedModelSerializer):
    collection = serializers.PrimaryKeyRelatedField()
    location = serializers.PrimaryKeyRelatedField(required=False)
    images = ImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    business_hours = serializers.PrimaryKeyRelatedField(required=False)
    
    class Meta:
        model = Point
        fields = ('id', 'title', 'url', 'description', 'place_name', 'place_address', 'place_phone', 'coordinates', 'type', 'images', 'tags', 'collection', 'location', 'business_hours', 'create_time', 'update_time', )


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
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time',  )


class CollectionByUserSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.PrimaryKeyRelatedField()
    points = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Collection
        fields = ('id', 'name', 'user', 'points', 'create_time', 'update_time', )
