/**
 * MappingBird Service
 * Current User resource
 */
mappingbird.resources.factory('CurrentUser', ['$resource', function($resource) {

    return $resource('/api/user/current');

}]);