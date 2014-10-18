mappingbird.SaveApp = angular.module('SaveApp', ['Initialization', 'ui.router', 'ngTagsInput', 'angularMoment']);

// Routing
mappingbird.SaveApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    // states
    $stateProvider
        .state('savePoint', {
            url: '/save?url&search',
            template: '<span></span>',
            controller: ['BroadcastService', 'User', '$stateParams', '$scope', function(BroadcastService, User, $stateParams, $scope, $location) {

                var killHandler;

                function b () {
                    BroadcastService.prepForBroadcast({
                        type: 'viewSearchResults',
                        data: {
                            url: $stateParams.url,
                            search: $stateParams.search
                        }
                    });

                    if (typeof killHandler === 'function') {
                        killHandler();
                    }
                }

                if (User.data.isLoggedIn == true) {
                    b();
                } else {
                    killHandler = $scope.$on('stateChange', function() {
                        // redirect to map app if come from mappingbird site without
                        // search text
                        if (BroadcastService.message.type == 'collectionsLoaded'
                            && BroadcastService.message.data.isFirstTime) {
                            if (BroadcastService.message.data.hasCollectionsSaved
                                && /(^http:\/\/www.mappingbird.com|^http:\/\/localhost)/.test($stateParams.url)
                                && $stateParams.search.length == 0) {
                                window.location.href = '/static/app.html#/';
                            } else {
                                b();
                            }
                        }
                    });
                }


            }]
        })
        .state('viewCollection', {
            url: '/collection/:collectionId',
            template: '<span></span>',
            controller: ['BroadcastService', 'User', '$stateParams', '$scope', function(BroadcastService, User, $stateParams, $scope) {

                var killHandler;

                function b () {
                    BroadcastService.prepForBroadcast({
                        type: 'viewingCollection',
                        data: {
                            collectionId: $stateParams.collectionId
                        }
                    });

                    if (typeof killHandler === 'function') {
                        killHandler();
                    }
                }

                if (User.data.isLoggedIn == true) {
                    b();
                } else {
                    killHandler = $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'collectionsLoaded' &&
                            BroadcastService.message.data.hasCollectionsSaved) {
                            b();
                        }
                    });
                }


            }]
        })
        .state('viewCollectionList', {
            url: '/collection/:collectionId/list',
            template: '<span></span>',
            controller: ['BroadcastService', 'User', '$stateParams', '$scope', function(BroadcastService, User, $stateParams, $scope) {

                var killHandler;

                function b () {
                    BroadcastService.prepForBroadcast({
                        type: 'viewingCollectionList',
                        data: {
                            collectionId: $stateParams.collectionId
                        }
                    });

                    if (typeof killHandler === 'function') {
                        killHandler();
                    }
                }

                if (User.data.isLoggedIn == true) {
                    b();
                } else {
                    killHandler = $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'collectionsLoaded' &&
                            BroadcastService.message.data.hasCollectionsSaved) {
                            b();
                        }
                    });
                }


            }]
        })
        .state('default', {
            url: '/',
            template: '<span></span>',
            controller: ['BroadcastService', 'Collections', '$stateParams', '$scope', function(BroadcastService, Collections, $stateParams, $scope) {

                var killHandler;

                function b () {
                    // use Collections.mostRecentModifiedCollection) since no activeCollection set
                    BroadcastService.prepForBroadcast({
                        type: 'viewingCollection',
                        data: {
                            collectionId: Collections.mostRecentModifiedCollection
                        }
                    });

                    if (typeof killHandler === 'function') {
                        killHandler();
                    }
                }

                if (Collections.activeCollectionId !== -1) {
                    b();
                } else {
                    killHandler = $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'collectionsLoaded') {
                            b();
                        }
                    });
                }


            }]
        })
        .state('viewPoint', {
            url: '/point/:pointId/:collectionId',
            template: '<span></span>',
            controller: ['BroadcastService', 'Collections', '$stateParams', '$scope', function(BroadcastService, Collections, $stateParams, $scope) {

                var killHandler;

                function b () {
                    // use Collections.mostRecentModifiedCollection) since no activeCollection set
                    BroadcastService.prepForBroadcast({
                        type: 'pointSelected',
                        data: {
                            collectionId: $stateParams.collectionId,
                            pointId: $stateParams.pointId
                        }
                    });

                    if (typeof killHandler === 'function') {
                        killHandler();
                    }
                }

                if (Collections.activeCollectionId !== -1) {
                    b();
                } else {
                    killHandler = $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'collectionsLoaded' &&
                            BroadcastService.message.data.hasCollectionsSaved) {
                            b();
                        }
                    });
                }


            }]
        });

    // fallback
    $urlRouterProvider.otherwise("/");

}]);