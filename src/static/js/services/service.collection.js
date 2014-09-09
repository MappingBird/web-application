/**
 * MappingBird Service
 * Collection resource
 */
services.factory('Collection', ['$resource', function($resource) {

    return $resource('/api/collections/:id', { id: '@id' });

}]);