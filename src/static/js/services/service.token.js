/**
 * MappingBird Service
 * Token resource
 */
services.factory('Token', ['$resource', function($resource) {

    return $resource('/api/token');

}]);