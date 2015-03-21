/**
 * MappingBird Service
 * User Logout resource
 */
mappingbird.resources.factory('UserLogout', ['$resource', function($resource) {

    return $resource('/api/user/logout');

}]);