/**
 * MappingBird Service
 * Point Image resource
 */
mappingbird.services.factory('PointImage', ['$resource', function($resource) {

    return $resource('/api/images/:id', { id: '@id' });

}]);