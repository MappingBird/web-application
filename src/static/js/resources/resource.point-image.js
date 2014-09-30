/**
 * MappingBird Service
 * Point Image resource
 */
mappingbird.resources.factory('PointImage', ['$resource', function($resource) {

    return $resource('/api/images/:id', { id: '@id' });

}]);