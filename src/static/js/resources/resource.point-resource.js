/**
 * MappingBird Service
 * Point resource
 */
mappingbird.resources.factory('PointResource', ['$resource', function($resource) {

    return $resource('/api/points/:id', { id: '@id' }, {
        // not really in use, because of not sending payload as JSON
        update: {
            method: "PUT",
            params: {
                id: "@id",
                title: "@title",
                description: "@description",
                type: "@type",
                collection: "@collection"
            },
            headers: {
                'Content-type': 'application/json'
            }
        }
    });

}]);