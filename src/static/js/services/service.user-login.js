/**
 * MappingBird Service
 * User Login resource
 */
mappingbird.services.factory('UserLogin', ['$resource', function($resource) {

    return $resource('/api/user/login');

}]);