/**
 * MappingBird Service
 * Token resource
 */
mappingbird.services.factory('Token', ['$resource', function($resource) {

    return $resource('/api/token');

}]);