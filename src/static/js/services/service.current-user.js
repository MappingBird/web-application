/**
 * MappingBird Service
 * Current User resource
 */
mappingbird.services.factory('CurrentUser', ['$resource', function($resource) {

    return $resource('/api/user/current');

}]);