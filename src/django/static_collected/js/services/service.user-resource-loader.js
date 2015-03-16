/**
 * MappingBird Service
 * User Resource Loader resource
 */
mappingbird.services.factory('UserResourceLoader', ['UserResource', '$cookies', '$q', function(UserResource, $cookies, $q) {
    return function() {
        if ($cookies.bkl_user) {
            console.log('UserResourceLoader + cookie');
            var delay = $q.defer();
            UserResource.get({ 'id': $cookies.bkl_user }, function(user){
                delay.resolve(user);
            }, function() {
                delay.reject('Unable to fetch user ' + $cookies.bkl_user)
            });
            return delay.promise;
        } else {
            console.log('UserResourceLoader + no cookie');
            return false;
        }
    };
}]);