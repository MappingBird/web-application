/**
 * MappingBird Service
 * Collections By User resource
 */
mappingbird.services.factory('CollectionsByUserResource', ['$resource', function($resource) {

    return $resource('/api/users/:user_id/collections', { user_id: '@user_id' });

}]);