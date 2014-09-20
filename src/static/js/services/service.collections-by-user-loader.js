/**
 * MappingBird Service
 * Collections By User Loader service
 */
mappingbird.services.factory('CollectionsByUserLoader', ['CollectionsByUserResource', '$stateParams', '$q', function(CollectionsByUserResource, $stateParams, $q) {
    return function(user_id) {
        var delay = $q.defer();
        CollectionsByUserResource.get({ 'user_id': user_id}, function(collections) {
            delay.resolve(collections);
        }, function() {
            delay.reject('Unable to fetch collections for this user');
        });
        return delay.promise;
    };
}]);