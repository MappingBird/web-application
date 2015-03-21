/**
 * MappingBird Service
 * Point Loader resource
 */
mappingbird.services.factory('PointLoader', ['PointResource', '$stateParams', 'StateService', '$q', function(PointResource, $stateParams, StateService, $q) {
    return function() {

        var delay = $q.defer(),
            params = StateService.getParams();

        PointResource.get({ 'id': params.point_id }, function(point){
            delay.resolve(point);
        }, function() {
            delay.reject('Unable to fetch point ' + params.point_id)
        });
        return delay.promise;
    };
}]);