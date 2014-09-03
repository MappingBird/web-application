/**
 * MappingBird Service
 * Point Image resource
 */
services.factory('PointImage', ['$resource', function($resource) {

    return $resource('/api/images/:id', { id: '@id' });

}]);