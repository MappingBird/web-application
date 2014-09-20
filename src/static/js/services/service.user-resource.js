/**
 * MappingBird Service
 * User resource
 */
mappingbird.services.factory('UserResource', ['$resource', function($resource) {

    var UserResource = $resource('/api/users/:id/', { id: '@id' });

    return UserResource;

}]);