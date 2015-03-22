/**
 * MappingBird Service
 * Scraper resource
 */
mappingbird.resources.factory('Scraper', ['$resource', function($resource) {

    return $resource('/api/scraper');

}]);