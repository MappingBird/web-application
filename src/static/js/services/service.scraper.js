/**
 * MappingBird Service
 * Scraper resource
 */
services.factory('Scraper', ['$resource', function($resource) {

    return $resource('/api/scraper');

}]);