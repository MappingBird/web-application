/**
 * MappingBird Service
 * User Logout resource
 */
services.factory('UserLogout', ['$resource', function($resource) {

    return $resource('/api/user/logout');

}]);