/**
 * MappingBird Service
 * Current User resource
 */
services.factory('CurrentUser', ['$resource', function($resource) {

    return $resource('/api/user/current');

}]);