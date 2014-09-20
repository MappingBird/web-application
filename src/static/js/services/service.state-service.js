/**
 * MappingBird Service
 * State Service
 */
mappingbird.services.factory('StateService', function() {

    var incomingParams;

    return {
        getParams: function() {
            return incomingParams;
        },
        setParams: function(params) {
            console.log('StateService setParams');
            console.log(params);
            incomingParams = params;
        }
    }
});