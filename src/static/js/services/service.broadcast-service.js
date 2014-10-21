/**
 * MappingBird Service
 * Broadcast Service
 */
mappingbird.services.factory('BroadcastService', ['$rootScope', function($rootScope) {
    var sharedService = {};

    sharedService.message = {
        type: '',
        data: ''
    };

    sharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    sharedService.broadcastItem = function() {
        $rootScope.$broadcast('stateChange');
    };

    return sharedService;
}]);