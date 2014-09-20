/**
 * MappingBird Service
 * User Logout resource
 */
mappingbird.services.factory('UserLogout', ['$resource', function($resource) {

    return $resource('/api/user/logout');

}]);