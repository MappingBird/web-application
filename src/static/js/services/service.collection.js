/**
 * MappingBird Service
 * Collection resource
 */
mappingbird.services.factory('Collection', ['$resource', function($resource) {

    return $resource('/api/collections/:id', { id: '@id' });

}]);