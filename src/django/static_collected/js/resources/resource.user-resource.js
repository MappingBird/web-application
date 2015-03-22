/**
 * MappingBird Service
 * User resource
 */
mappingbird.resources.factory('UserResource', ['$resource', function($resource) {

    return $resource('/api/users/:id/', { id: '@id' });

}]);