/**
 * MappingBird Service
 * Search resource
 */
mappingbird.resources.factory('Search', ['$resource', function($resource) {

    return $resource('/api/search_point', { q: '@query', cid: '@' });

}]);
