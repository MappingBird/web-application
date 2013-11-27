var services = angular.module('SaveApp.services', ['ngResource']);

services.factory('Presets', function(){
    return {
        baseUrl: '/',
        mapsUrl: '/maps',
        collectionUrl: '/api/collection',
        userUrl: '/api/users',
        savePanelVisible: true,
        mapZoom: 13
    };
});

services.factory('MapPoints', function(){
    return {
        activeSavePoint: {
            icon: '',
            name: '',
            address: '',
            phone: '',
            coords: '',
            lat: 0,
            lng: 0,
            type: 'misc',
            image: ''
        },
        activeViewPoint: {
            id: -1,
            icon: '',
            name: '',
            address: '',
            phone: '',
            coords: '',
            lat: 0,
            lng: 0,
            type: 'misc',
            images: []
        },
        activeViewPoints: []
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

services.factory('Collections', function(){
    return {
        collections: [],
        mostRecentModifiedCollection: -1,
        activeCollectionId: -1
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

services.factory('Scraper', ['$resource', function($resource) {

    return $resource('/api/scraper');

}]);

services.factory('Collection', ['$resource', function($resource) {

    return $resource('/api/collections/:id', { id: '@id' });

}]);

services.factory('CollectionsByUserResource', ['$resource', function($resource) {

    return $resource('/api/users/:user_id/collections', { user_id: '@user_id' });

}]);

services.factory('CollectionsByUserLoader', ['CollectionsByUserResource', '$stateParams', '$q', function(CollectionsByUserResource, $stateParams, $q) {
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

services.factory('PointResource', ['$resource', function($resource) {

    return $resource('/api/points/:id', { id: '@id' }, {
        update: {
            method: "POST",
            params: {
                id: "@id",
                title: "@title",
                text: "@text",
                type: "@type",
                collection_id: "@collection_id"
            }
        }
    });

}]);

services.factory('PointLoader', ['PointResource', '$stateParams', 'StateService', '$q', function(PointResource, $stateParams, StateService, $q) {
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

services.factory('PointImage', ['$resource', function($resource) {

    return $resource('/api/images/:id', { id: '@id' });

}]);

services.factory('CurrentUser', ['$resource', function($resource) {

    return $resource('/api/user/current');

}]);

services.factory('UserResource', ['$resource', function($resource) {

    var UserResource = $resource('/api/users/:id', { id: '@id' });

    /*
    // doesn't work until angular 1.1.2 (not using it because it's not stable yet)
    var userResource = $resource('/api/user/id/:id', { id: '@id' }, {
        'get_user': {
            method: 'GET' //,

            transformResponse: function (data, headers) {
                console.log ('User transformResponse');
                console.log (data);
                console.log (headers);

                var x = JSON.parse(data);
                x.isRegisteredUser = false;

                if (typeof x.email_address !== 'undefined') {
                    if (!/@gu.pingismo.com/.test(x.email_address)) {
                        // self.userEmailAddress(x.email_address);
                        x.isRegisteredUser = true;
                    }
                }

                return {
                    id: x.id,
                    emailAddress: x.email_address,
                    collections: x.collections,
                    isRegisteredUser: x.isRegisteredUser
                };
            }
        }
    });
    */

    return UserResource;

}]);

services.factory('UserResourceLoader', ['UserResource', '$cookies', '$q', function(UserResource, $cookies, $q) {
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