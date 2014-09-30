/**
 * MappingBird Service
 * Tag resource
 */
mappingbird.resources.factory('TagResource', ['$resource', function($resource) {

    return $resource('/api/tags', {}, {
        'getTags' : {
            method : 'GET',
            isArray: true
        }
    });

}]);