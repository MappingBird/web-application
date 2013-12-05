var services = angular.module('IndexApp.services', ['ngResource']);

services.factory('Presets', function(){
    return {
        baseUrl: '/',
        parseUrl: '/scraper',
        userUrl: '/api/users',
        savePanelVisible: true,
        mapZoom: 13
    };
});

services.factory('User', function(){
    return {
        data: {
            id: 0,
            emailAddress: '',
            isRegisteredUser: false,
            collections: [],
            isLoggedIn: false
        }
    };
});

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


services.factory('UserResource', ['$resource', function($resource) {

    var UserResource = $resource('/api/users/:id/', { id: '@id' });

    return UserResource;

}]);

services.factory('CurrentUser', ['$resource', function($resource) {

    return $resource('/api/user/current');

}]);

services.factory('UserLogout', ['$resource', function($resource) {

    return $resource('/api/user/logout');

}]);

services.factory('BroadcastService', function($rootScope) {
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
});