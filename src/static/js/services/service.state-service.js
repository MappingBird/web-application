/**
 * MappingBird Service
 * State Service
 */
services.factory('StateService', function() {

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