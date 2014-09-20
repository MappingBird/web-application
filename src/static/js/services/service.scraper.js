/**
 * MappingBird Service
 * Scraper resource
 */
mappingbird.services.factory('Scraper', ['$resource', function($resource) {

    return $resource('/api/scraper');

}]);