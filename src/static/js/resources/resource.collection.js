/**
 * MappingBird Service
 * Collection resource
 */
mappingbird.resources.factory('Collection', ['$resource', function($resource) {

    return $resource('/api/collections/:id', { id: '@id' });

}]);
