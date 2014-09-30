/**
 * MappingBird Service
 * User Login resource
 */
mappingbird.resources.factory('UserLogin', ['$resource', function($resource) {

    return $resource('/api/user/login');

}]);