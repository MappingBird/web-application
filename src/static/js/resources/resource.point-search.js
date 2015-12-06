/**
 * MappingBird Service
 * Point resource
 */
mappingbird.resources.factory('PointSearch', ['$resource', function($resource) {

    return $resource('/api/search_point', { q: '@id',cid: '@cid' });

}]);