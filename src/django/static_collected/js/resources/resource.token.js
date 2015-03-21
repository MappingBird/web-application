/**
 * MappingBird Service
 * Token resource
 */
mappingbird.resources.factory('Token', ['$resource', function($resource) {

    return $resource('/api/token');

}]);