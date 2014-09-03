/**
 * MappingBird Service
 * User Login resource
 */
services.factory('UserLogin', ['$resource', function($resource) {

    return $resource('/api/user/login');

}]);