// HTTP solution from
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
var SaveApp = angular.module('SaveApp', ['SaveApp.directives', 'SaveApp.services', 'ngCookies', 'ngSanitize', 'ui.bootstrap', 'ui.router'], function($httpProvider, $dialogProvider) {
    // angular bootstrap
    //$dialogProvider.options({dialogFade: true});

    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data)
    {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj)
        {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for(name in obj)
            {
                value = obj[name];

                if(value instanceof Array)
                {
                    for(i=0; i<value.length; ++i)
                    {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value instanceof Object)
                {
                    for(subName in value)
                    {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value !== undefined && value !== null)
                {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});


// Routing
SaveApp.config(function($stateProvider, $urlRouterProvider) {

    // states
    $stateProvider
        .state('savePoint', {
            url: '/save?url&search',
            template: '<span></span>',
            controller: ['BroadcastService', 'User', '$stateParams', '$scope', function(BroadcastService, User, $stateParams, $scope) {

                function b () {
                    BroadcastService.prepForBroadcast({
                        type: 'pointSavingMode',
                        data: {
                            url: $stateParams.url,
                            search: $stateParams.search
                        }
                    });
                }

                if (User.data.isLoggedIn == true) {
                    b();
                } else {
                    $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'userLoaded') {
                            b();
                        }
                    });
                }


            }]
        })
        .state('viewCollection', {
            url: '/collection/:collectionId',
            template: '<span></span>',
            controller: ['BroadcastService', 'User', '$stateParams', '$scope', function(BroadcastService, User, $stateParams, $scope) {

                function b () {
                    BroadcastService.prepForBroadcast({
                        type: 'viewingCollection',
                        data: {
                            collectionId: $stateParams.collectionId
                        }
                    });
                }

                if (User.data.isLoggedIn == true) {
                    b();
                } else {
                    $scope.$on('stateChange', function() {
                        if (BroadcastService.message.type == 'userLoaded') {
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

                function b () {
                    // use Collections.mostRecentModifiedCollection) since no activeCollection set
                    BroadcastService.prepForBroadcast({
                        type: 'viewingCollection',
                        data: {
                            collectionId: Collections.mostRecentModifiedCollection
                        }
                    });
                }

                if (Collections.activeCollectionId !== -1) {
                    b();
                } else {
                    $scope.$on('stateChange', function() {
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
                        if (BroadcastService.message.type == 'collectionsLoaded') {
                            b();
                        }
                    });
                }


            }]
            /*
            views: {
                'collectionlist' : {
                    templateUrl: 'js/save-app/templates/partials/collection_list.html',
                    controller: 'collectionsController',

                },
                'pointdetail' : {
                    templateUrl: 'js/save-app/templates/partials/point_detail.html',
                    controller: 'pointDetailController',
                    resolve: {
                        // using this dummy service so that PointLoader can access stateParams before
                        // the controller is rendered
                        dummy: ['$stateParams', 'StateService', function($stateParams, StateService) {
                            StateService.setParams($stateParams);
                        }],
                        activeViewPointObj: function(PointLoader) {
                            return PointLoader();
                        },
                        // set the activeViewPoint
                        dummy2: ['$stateParams', 'MapPoints', function($stateParams, MapPoints) {
                            if (MapPoints.activeViewPoints && MapPoints.activeViewPoints.length > 0) {
                                for (var x in MapPoints.activeViewPoints) {
                                    if ($stateParams.point == x.id) {
                                        MapPoints.activeViewPoint = x;
                                        break;
                                    }
                                }
                            }
                        }]

                    }
                }
            }
            */
        });

    // fallback
    $urlRouterProvider.otherwise("/");

});

SaveApp.run(function($http, $cookies) {
    $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
});


SaveApp.controller('userController', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogin, UserLogout) {

    $scope.user = CurrentUser.get(function(data) {

        console.log('user data');
        console.log(data);

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {

            console.log('user logged in');

            User.data.emailAddress = data.email;
            User.data.id = data.id;

            if (!/@gu.pingismo.com/.test(data.email)) {
                User.data.isRegisteredUser = true;
                User.data.isLoggedIn = true;
                $scope.isLoggedIn = true;
            } else {
                User.data.isRegisteredUser = false;
            }

            // send event
            BroadcastService.prepForBroadcast({
                type: 'userLoaded',
                data: { userId: data.id }
            });

        } else {

            console.log('user not logged in');

            // even though they are generated and can save points
            // they are not technically logged in
            $scope.isLoggedIn = false;

            var time = new Date().getTime(),
                userCredentials = {
                    email: getRandomInt(0,100) + time + '@gu.pingismo.com',
                    password: 'pword' + getRandomInt(0,1000000000)
                };

            // generate user
            UserResource.save(userCredentials, function(data, headers) {

                // login this generated user
                UserLogin.save(userCredentials, function(data, headers) {
                    if (typeof data !== 'undefined'
                        && typeof data.user !== 'undefined'
                        && typeof data.user.email !== 'undefined'
                        && typeof data.user.id !==  'undefined') {

                        $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;

                        console.log(headers);
                        BroadcastService.prepForBroadcast({
                            type: 'userLoaded',
                            data: { userId: data.id }
                        });
                    } else {
                        // TODO: login error
                        console.log('Login error with generated user');
                    }
                });

            });

        }

    });

    $scope.goToSignUpPage = function() {
        $window.location.href = '/static/signup.html';
    };

    $scope.logout = function() {

        UserLogout.get(function(data, headers) {

            delete $cookies['sessionid'];
            $window.location.href = "/static/index.html";

        });

    };

});

/**
    Overall page controller
 */
SaveApp.controller('savePageController', function($scope, $timeout, Presets, BroadcastService, Collections, CollectionsByUserResource, User) {

    $scope.collectionsByUser = [];

    // page layout defaults
    $scope.mapVisible = true;
    $scope.saveMode = false;
    $scope.collectionsMode = false;
    $scope.mapMode = false;
    $scope.pointMode = false;

    function resetMapSize() {
        console.log('resetMapSize');
        setTimeout(function() {
            $scope.$broadcast('mapChange');
        }, 500);
    }


    // map viewing mode
    function mapViewingMode () {
        $scope.mapMode = true;
        $scope.saveMode = false;
        $scope.collectionsMode = false;
        $scope.showCollectionList = true;
        $scope.showSavePanel = false;
        $scope.showPointDetailPanel = false;
        $scope.fullMap = true;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = false;
        $scope.halfMap = false;
        resetMapSize();
    }

    // point saving mode
    function pointSavingMode () {
        $scope.mapMode = false;
        $scope.saveMode = true;
        $scope.collectionsMode = false;
        $scope.showCollectionList = false;
        $scope.showSavePanel = true;
        $scope.showPointDetailPanel = false;
        $scope.fullMap = false;
        $scope.mapRetracted = true;
        $scope.semiRetractedMap = false;
        $scope.halfMap = false;
        resetMapSize();
    }

    // point viewing mode
    function pointViewingMode () {
        $scope.mapMode = false;
        $scope.saveMode = false;
        $scope.collectionsMode = false;
        $scope.showCollectionList = true;
        $scope.showSavePanel = false;
        $scope.showPointDetailPanel = true;
        $scope.fullMap = false;
        $scope.mapRetracted = true;
        $scope.semiRetractedMap = false;
        $scope.halfMap = true;
        resetMapSize();
    }

    // collection viewing mode
    function collectionViewingMode() {
        $scope.mapMode = false;
        $scope.saveMode = false;
        $scope.collectionsMode = true;
        $scope.showCollectionList = true;
        $scope.showSavePanel = false;
        $scope.showPointDetailPanel = false;
        $scope.fullMap = false;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = true;
        $scope.halfMap = false;
        resetMapSize();
    }

    function reloadCollections() {
        // collections
        $scope.collectionsByUser = CollectionsByUserResource.get({user_id: User.data.id}, function(data) {
            console.log('reloadCollections');
            Collections.collections = data.collections;
            if (typeof data.most_recent_modified_collection != 'undefined') {
                Collections.mostRecentModifiedCollection = data.most_recent_modified_collection;
            };
            console.log(Collections);
            BroadcastService.prepForBroadcast({
                type: 'collectionsLoaded',
                data: { }
            });
        });
    }


    $scope.$on('stateChange', function() {
        console.log('[[[stateChange in savePageController]]]');
        console.log(BroadcastService.message.type);
        switch(BroadcastService.message.type) {
            case 'pointSelected':
                pointViewingMode();
                break;
            case 'pointClosed':
            case 'viewingCollection':
                mapViewingMode();
                break;
            case 'pointSavingMode':
                pointSavingMode();
                break;
            case 'pointSaveComplete':
                mapViewingMode();
                break;
            case 'viewingCollections':
                collectionViewingMode();
                break;
            case 'userLoaded':
                if (Collections.collections && Collections.collections.length == 0) {
                    reloadCollections();
                }
                break;
            case 'collectionUpdate':
                reloadCollections();
                break;
        }
    });

});

SaveApp.controller('searchResultsController', function($scope, $dialog, $http, Presets, MapPoints, User, UserResource, Collection, Collections, PointResource, BroadcastService, PointImage, Scraper) {

    console.log('init searchResultsController');

    var map;

    $scope.presets = Presets;
    $scope.numResults = 0;
    $scope.searchQuery = ''; // decodeURIComponent(getParameterByName('search'))
    $scope.targetUrl = ''; // decodeURIComponent(getParameterByName('url'))
    $scope.placesApiUrl = '';
    $scope.searchResultsLoading = false;
    $scope.searchResultsLoaded = false;
    $scope.searchResultSelected = false;
    $scope.places = [];
    $scope.newCollectionName = "";
    $scope.activeCollectionName = "";
    $scope.pageData = {};
    $scope.pageImages = [];
    $scope.selectedPageImages = [];
    $scope.deselectedPageImages = [];
    $scope.noSearchQuery = false;
    $scope.noSearchResults = false;
    $scope.activeSearchResult = -1;
    $scope.showSelectCollection = false;
    $scope.saveCollectionId;
    $scope.saveCollectionName;
    $scope.noCollectionError = false;

    // service watchers
    $scope.$watch( function () { return Collections.collections; }, function ( collections ) {
        console.log('Collections watcher: ' + $scope.activeCollectionId);

        $scope.collections = collections;

        // set active collection (only set if not already set)
        if ($scope.activeCollectionId == -1
            && $scope.collections
            && $scope.collections.length > 0) {
            console.log('setting active collection');
            console.log($scope.collections);
            console.log($scope.collections.length);
            if ($scope.collections.length > 1
                && Collections.mostRecentModifiedCollection !== -1
                ) {
                console.log('mostRecentModifiedCollection');
                $scope.activeCollectionId = Collections.mostRecentModifiedCollection;
            } else {
                console.log('active collection is the first collection');
                console.log($scope.collections[0].id);
                $scope.activeCollectionId = $scope.collections[0].id;
            }
            // set save collection id to the activecollectionid
            $scope.saveCollectionId = $scope.activeCollectionId;
        } else {
            console.log('activeCollectionId already set');
        }
    }, true);

    $scope.$watch('collections', function(collections) {
        Collections.collections = collections;
    });

    $scope.$watch(function(){return MapPoints.activeSavePoint;}, function(activeSavePoint) {
        $scope.activeSavePoint = activeSavePoint;
        console.log('set scope.activeSavePoint');
        console.log($scope.activeSavePoint);
    });

    $scope.$watch('activeSavePoint', function(activeSavePoint) {
        MapPoints.activeSavePoint = activeSavePoint;
    });

    $scope.$watch(function(){return Collections.activeCollectionId;}, function(activeCollectionId) {
        $scope.activeCollectionId = activeCollectionId;
    });

    $scope.$watch('activeCollectionId', function(activeCollectionId){
        console.log('triggered watcher of activeCollectionId');
        Collections.activeCollectionId = activeCollectionId;

        // update activeCollectionName
        if ($scope.collections.length > 0) {
            for (var c in $scope.collections) {
                if ($scope.collections[c].id == activeCollectionId) {
                    $scope.activeCollectionName = $scope.collections[c].name;
                    break;
                }
            }
        }

    });

    $scope.$watch('saveCollectionId', function(saveCollectionId) {
        if ($scope.collections.length > 0) {
            for (var c in $scope.collections) {
                if ($scope.collections[c].id == saveCollectionId) {
                    $scope.saveCollectionName = $scope.collections[c].name;
                    break;
                }
            }
        }
    });

    $scope.$watch('activeSavePoint.type', function(pointType) {

        BroadcastService.prepForBroadcast({
            type: 'savePointTypeChange',
            data: {
                savePointType: pointType
            }
        });

    });

    $scope.$watch('pageImages', function(pageImages) {

        if (typeof pageImages !== 'undefined'
            && pageImages.length > 0) {
            BroadcastService.prepForBroadcast({
                type: 'savePointSetImage',
                data: {
                    imageUrl: pageImages[0]
                }
            });
        }

    });

    // functions
    $scope.getPageData = function() {
        console.log('getPageData');
        if ($scope.targetUrl) {

            Scraper.get({ 'url': $scope.targetUrl }, function(data, headers) {
                console.log('getPageData return');
                console.log(data);
                $scope.pageData = {
                    title: data.title,
                    text: data.text
                };
                $scope.pageImages = data.images;
            });

        } else {
            console.log('no url');
            // TODO: show error?
        }

    };

    function placesSearchCallback (data, textStatus){
        console.log('placesSearchCallback');
        console.log(data);
        var len = data.length,
            d;

        $scope.$apply(function(){
            $scope.numResults = data.length;
            $scope.searchResultsLoading = false;
            $scope.searchResultsLoaded = true;
        });

        if (typeof data !== 'undefined' && len > 0) {
            console.log('there are search results');
            console.log(len);
            // if there's only one result, select search result
            $scope.$apply(function(){
                $scope.searchResultsLoaded = true;
            });

            if (len === 1) {
                len--;
                $scope.$apply(function(){
                    $scope.activeSavePoint = {
                        index: 0,
                        icon: data[len].icon,
                        name: data[len].name,
                        address: data[len].formatted_address,
                        phone: '',
                        coords: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng(),
                        type: data[len].type || 'misc',
                        lat: data[len].geometry.location.lat(),
                        lng: data[len].geometry.location.lng()
                    };
                    $scope.searchResultSelected = true;
                    console.log('set activeSavePoint');
                    console.log($scope.activeSavePoint);
                });

            // otherwise display results in multi-result page
            } else {
                $scope.$apply(function(){
                    while (len--) {
                        $scope.places.unshift({
                            index: len,
                            icon: data[len].icon,
                            name: data[len].name,
                            address: data[len].formatted_address,
                            phone: '',
                            coords: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng(),
                            type: data[len].type || 'misc',
                            lat: data[len].geometry.location.lat(),
                            lng: data[len].geometry.location.lng()
                        });
                    }

                    $scope.activeSavePoint = $scope.places[0];
                    $scope.activeSearchResult = 0;
                    console.log($scope.activeSavePoint);

                });

            }

        } else {
            // TODO: show error
            console.log('no places search result');
            $scope.noSearchResults = true;
        }
    }

    $scope.fetchPlacesSearchResults = function (){
        console.log('fetchPlacesSearchResults');
        console.log('fetchPlacesSearchResults map');
        $scope.searchResultsLoading = true;
        console.log(map);

        var center = new google.maps.LatLng(25.035061,121.53986), // default coords
            geocoder = new google.maps.Geocoder(),
            placesRequest;

            // TODO: map needs to be moved to directive
            // TODO: mapOptions is duplicated from mapController
            map = map || new google.maps.Map($('#map')[0], {
                zoom: Presets.mapZoom,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                panControl: true,
                streetViewControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE
                },
                scaleControl: false
            });
            placesRequest = new google.maps.places.PlacesService(map);

        console.log(map);

        placesRequest.textSearch({ query: [$scope.searchQuery]}, placesSearchCallback);

    };


    $scope.setActiveSavePoint = function(index) {
        console.log('setactiveSavePoint ' + index);

        var image,
            point = $scope.places[index];

        if (typeof $scope.pageImages !== 'undefined'
            && $scope.pageImages.length > 0) {

            point.image = $scope.pageImages[0];

            BroadcastService.prepForBroadcast({
                type: 'savePointSetImage',
                data: {
                    imageUrl: image
                }
            });
        }

        $scope.activeSavePoint = point;
        $scope.activeSearchResult = index;

    };

    $scope.prepSaveActiveSearchResult = function () {
        $scope.searchResultSelected = true;
    };

    $scope.cancelSaveActiveSearchResult = function () {
        $scope.searchResultSelected = false;
    };

    $scope.saveNewCollection = function($e) {
        if (typeof $e.stopPropagation === 'function') {
            $e.stopPropagation();
        }
        console.log('saveNewCollection');
        console.log($scope.newCollectionName);
        console.log($scope.newCollectionName.length);

        function save(d) {
            //var newCollection = new Collection();
            Collection.save(d, function(data, headers){
                console.log('saveNewCollection successful');
                console.log(data);
                $scope.collections.push(data);

                // set this collection as active collection
                $scope.selectCollection(data.id);

                // blank the form
                $scope.newCollectionName = '';
            });

            // send event
            BroadcastService.prepForBroadcast({
                type: 'collectionUpdate',
                data: { }
            });
        }

        // check that collection name is entered
        if ($scope.newCollectionName.length > 0) {

            // if is logged in
            // use current user
            if (User.data.id !== 0) {
                save({ name: $scope.newCollectionName, user: User.data.id });
            } else {
            // if not logged in
            // generate a user
                UserResource.save({email_address: '', password: ''}, function(data, headers) {
                    console.log('generate new user successful');
                    console.log(data);
                    // set cookie
                    $cookies.bkl_user = data.id;
                    // set user data
                    if (typeof data.email_address !== 'undefined') {
                        User.data.emailAddress = data.email_address;
                        if (!/@gu.pingismo.com/.test(data.email_address)) {
                            User.data.isRegisteredUser = true;
                        } else {
                            User.data.isRegisteredUser = false;
                        }
                        User.data.id = data.id;
                    }

                    save({ name: $scope.newCollectionName, user: data.id });
                });
            }

        } else {

            // error
            console.log('no new collection name error');
            $scope.noCollectionError = true;

        }


    };

    $scope.clickShowSelectCollection = function() {
        $scope.showSelectCollection = true;
        $scope.saveCollectionId = undefined;
    };

    $scope.selectCollection = function(id, $e) {
        if ($e && typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
            $e.stopPropagation();
        }
        console.log('selectCollection');
        console.log('saveCollectionId: ' + id);
        $scope.saveCollectionId = id;
        $scope.showSelectCollection = false; // close the selector
    };

    $scope.setPointType = function($e, t){
        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }
        $scope.activeSavePoint.type = t;
    };

    $scope.savePoint = function($e){

        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }

        var pointData;

        // check if saveCollectionId is set
        if (typeof $scope.saveCollectionId !== 'undefined') {

            $scope.noCollectionError = false;

            pointData = {
                title: $scope.pageData.title,
                url: $scope.targetUrl,
                description: $scope.pageData.text,
                place_name: $scope.activeSavePoint.name,
                place_address: $scope.activeSavePoint.address,
                place_phone: $scope.activeSavePoint.phone,
                coordinates: $scope.activeSavePoint.coords,
                type: $scope.activeSavePoint.type,
                collection: $scope.saveCollectionId
            };

            PointResource.save(pointData, function(data, headers){
                console.log('save point successful');
                console.log(data);

                var pointId = data.id,
                    imageData;

                // save images
                for (var p in $scope.selectedPageImages) {
                    imageData = {
                        url: $scope.selectedPageImages[p],
                        thumb_path: '',
                        point: pointId
                    };

                    PointImage.save(imageData, function(data, headers) {
                        console.log('save image successful');
                    });
                }

                $scope.activeCollectionId = $scope.saveCollectionId;

                // send event
                BroadcastService.prepForBroadcast({
                    type: 'pointSaveComplete',
                    data: {
                        savedCollectionId: $scope.saveCollectionId,
                        savedCollectionName: $scope.saveCollectionName
                    }
                });

                // send event
                BroadcastService.prepForBroadcast({
                    type: 'collectionUpdate',
                    data: { }
                });

            });

        } else {
            // error, no collection set
            // show error
            console.log ('error: no collection selected - cannot save');

            // show select collection with error message
            $scope.noCollectionError = true;
        }

    };

    $scope.searchPlaces = function () {
        if ($scope.searchQuery && $scope.searchQuery.length > 0 && $scope.searchQuery !== 'undefined') {
            $scope.placesApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCixleTjJLXPDQs9AIG6-18Gvx1X6M7If8&sensor=false&query=' + $scope.searchQuery + '&callback=?';
            $scope.noSearchQuery =  false;

            $scope.fetchPlacesSearchResults();
            $scope.getPageData();
        } else {
            $scope.noSearchQuery = true;

            BroadcastService.prepForBroadcast({
                type: 'noSearchQuery',
                data: {}
            });
        }

    };


    // init code
    $scope.$on('stateChange', function() {
        switch(BroadcastService.message.type) {
            case 'pointSavingMode':
                $scope.targetUrl = BroadcastService.message.data.url;
                $scope.searchQuery = BroadcastService.message.data.search;

                $scope.searchPlaces();
                break;
            case 'pointSelected':
                if (BroadcastService.message.data.collectionId != -1) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                }
                break;
        }

    });


});

SaveApp.controller('collectionsController', function($scope, Collection, Collections, MapPoints, BroadcastService, $state) {

    $scope.activeCollectionId;
    $scope.activeCollectionPoints = [];
    $scope.activeCollectionPointLength = 0;
    $scope.activeCollectionName = '';
    $scope.editMode = false;

    // watchers
    $scope.$watch(function(){return Collections.activeCollectionId;}, function(activeCollectionId, oldActiveCollectionId) {
        console.log('Collections.activeCollectionId watcher: ' + activeCollectionId);
        console.log(activeCollectionId + ' ' + oldActiveCollectionId);

        $scope.activeCollectionId = activeCollectionId;

        if ($scope.collections
            && $scope.collections.length > 0) {

            console.log('get collectionName');
            for (var c in $scope.collections) {
                if ($scope.activeCollectionId == $scope.collections[c].id) {
                    $scope.activeCollectionName = $scope.collections[c].name;
                    break;
                }
            }

        }

    });

    $scope.$watch('activeCollectionId', function(activeCollectionId) {
        console.log('activeCollectionId watcher triggered: ' + activeCollectionId);
        Collections.activeCollectionId = $scope.activeCollectionId;
    });

    $scope.$watch( function () { return Collections.collections; }, function ( collections ) {
        console.log('collections Collections.collections watcher triggered: ' + $scope.activeCollectionId);
        $scope.collections = collections;

        // set active collection (only set where hasn't been set yet)
        if ($scope.collections
            && $scope.collections.length > 0) {

            console.log('setting active collection');
            if ($scope.activeCollectionId == -1) {
                if ($scope.collections.length > 1
                    && Collections.mostRecentModifiedCollection !== -1
                    ) {
                    console.log('mostRecentModifiedCollection');
                    $scope.activeCollectionId = Collections.mostRecentModifiedCollection;
                } else {
                    console.log('setting active collection to first collection as default');
                    $scope.activeCollectionId = $scope.collections[0].id;
                }
            }

            console.log('get collectionName');
            for (var c in $scope.collections) {
                if ($scope.activeCollectionId == $scope.collections[c].id) {
                    $scope.activeCollectionName = $scope.collections[c].name;
                    break;
                }
            }

        } else {
            console.log('activeCollectionId: ' + $scope.activeCollectionId);
        }

    });

    $scope.$watch('collections', function(collections) {
        console.log('collections local collections watcher triggered');
        Collections.collections = collections;
    });

    // changes to active collection will be reflected
    $scope.$watch('activeCollectionPoints', function(activeCollectionPoints) {
        console.log('activeCollectionPoints changed');
        console.log(activeCollectionPoints);
        MapPoints.activeViewPoints = activeCollectionPoints;

        BroadcastService.prepForBroadcast({
            type: 'mapPointsLoaded',
            data: { }
        });
    });

    $scope.$on('stateChange', function() {
        console.log('[stateChange in collectionsController]');
        console.log(BroadcastService.message.type);
        console.log(BroadcastService.message.data);
        switch (BroadcastService.message.type) {
            case 'pointSaveComplete':
                if (typeof BroadcastService.message.data.savedCollectionId !== 'undefined') {
                    $scope.activeCollectionName = BroadcastService.message.data.savedCollectionName;
                    refreshCollectionPointLength(BroadcastService.message.data.savedCollectionId);
                }
                break;
            case 'viewingCollection':
                if (BroadcastService.message.data.collectionId != -1) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
            case 'pointSelected':
                if (BroadcastService.message.data.collectionId != -1) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
        }

    });

    $scope.setActiveCollection = function(id) {
        console.log('setActiveCollection: ' + id);
        $scope.activeCollectionId = id;
    };

    $scope.clickCollection = function(id) {
        console.log('clickCollection');
        console.log(id);

        // edit mode - delete collection
        if ($scope.editMode) {
            console.log('delete collection: ' + id);
            Collection.delete({id: id}, function(data, headers){
                BroadcastService.prepForBroadcast({
                    type: 'collectionUpdate',
                    data: {}
                });
            });
        } else {
            console.log('viewCollection ' + id);
            $state.go('viewCollection', { collectionId: id});
        }
    };

    $scope.showCollections = function() {
        // toggle between map and collection viewing
        console.log('showCollections');
        if ($scope.mapMode === true) {
            BroadcastService.prepForBroadcast({
                type: 'viewingCollections',
                data: {}
            });
        } else {
            $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
        }

    }

    // functions
    function refreshCollectionPoints (collectionId) {
        console.log('refreshCollectionPoints');

        Collection.get({id: collectionId}, function(data, headers){
            console.log('loading points for collection');
            console.log(data);
            if (typeof data.points !== 'undefined') {
                $scope.activeCollectionPoints = data.points;
                $scope.activeCollectionPointLength = data.points.length;
            }
        });
    }

    function refreshCollectionPointLength (collectionId) {
        console.log('refreshCollectionPointLength');

        Collection.get({id: collectionId}, function(data, headers){
            console.log('getting number of points for collection');
            console.log(data);
            if (typeof data.points !== 'undefined') {
                $scope.activeCollectionPointLength = data.points.length;
            }
        });
    }

    $scope.toggleEditMode = function() {
        $scope.editMode = !$scope.editMode;
    };


});

SaveApp.controller('mapController', function($scope, Presets, MapPoints, BroadcastService, $state) {

    var saveOverlay,
        saveMarker,
        lat = 0,
        lng = 0,
        type = '',
        myLatLng = new google.maps.LatLng(lat, lng),
        mapOptions = {
            zoom: Presets.mapZoom,
            center: myLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            panControl: true,
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE
            },
            scaleControl: false
        },
        map,
        bounds,
        srcImage = '', // TODO
        viewOverlays = [],
        viewMarkers = []
        ;

    $scope.$watch(function() { return MapPoints.activeSavePoint; }, function(activeSavePoint) {

        console.log ('activeSavePoint change');
        console.log ($scope.saveMode);
        $scope.activeSavePoint = activeSavePoint;

        if ($scope.saveMode) {
            displayActiveSavePoint();
        }
    });

    $scope.$watch(function() { return MapPoints.activeViewPoints; }, function(activeViewPoints) {

        console.log('MapPoints.activeViewPoints changed');
        console.log($scope.activeViewPoints);
        console.log(activeViewPoints);

        if (!angular.equals($scope.activeViewPoints, activeViewPoints)) {
            console.log('not equal');
            $scope.activeViewPoints = activeViewPoints;
            if (!$scope.saveMode) {
                console.log('displayActiveViewPoints');
                displayActiveViewPoints();
            }
        }
    });

    $scope.$watch(function() { return MapPoints.activeViewPoint; }, function(activeViewPoint) {
        $scope.activeViewPoint = activeViewPoint;
    });

    $scope.$watch('activeViewPoint', function(activeViewPoint) {
        MapPoints.activeViewPoint = activeViewPoint;
    });

    function resetMapSize() {
        console.log('resetMapSize');
        if (typeof map !== 'undefined') {
            google.maps.event.trigger(map, "resize");
        }
    }

    function displayActiveSavePoint () {
        console.log('displayActiveSavePoint');
        console.log($scope.activeSavePoint);
        if ($scope.activeSavePoint) {
            lat = $scope.activeSavePoint.lat;
            lng = $scope.activeSavePoint.lng;
            type = $scope.activeSavePoint.type || 'scenicspot';
            myLatLng = new google.maps.LatLng(lat, lng);
            mapOptions.center = myLatLng;
            if (map) {
                map.panTo(new google.maps.LatLng(lat, lng));
                saveOverlay.setMap(null);
                saveMarker.setMap(null);
            } else {
                map = new google.maps.Map($('#map')[0], mapOptions);
            }
            bounds = map.getBounds();
            srcImage = $scope.activeSavePoint.image;

            saveOverlay = new BucketListSmallOverlay(bounds, Presets.mapZoom, srcImage, map, myLatLng, type, $scope.activeSavePoint.name, $scope.activeSavePoint.address, $scope.activeSavePoint.phone, 'open', 'save');
            saveMarker = new BucketListPin(bounds, Presets.mapZoom, srcImage, map, myLatLng);
        }
    }

    function displayActiveViewPoints () {

        // clear existing pins
        if (saveOverlay) {
            saveOverlay.setMap(null);
        }

        if (saveMarker) {
            saveMarker.setMap(null);
        }

        if (viewOverlays.length > 0) {
            var l = viewOverlays.length;
            while (l--) {
                viewOverlays[l].setMap(null);
            }
        }

        if (viewMarkers.length > 0) {
            var x = viewMarkers.length;
            while (x--) {
                viewMarkers[x].setMap(null);
            }
        }

        // clear map
        // viewOverlays.splice(0, viewOverlays.length);
        // viewMarkers.splice(0, viewMarkers.length);

        if ($scope.activeViewPoints && $scope.activeViewPoints.length > 0) {

            console.log('activeViewPoints');
            console.log($scope.activeViewPoints);

            var len = $scope.activeViewPoints.length,
                len2 = len,
                lat,
                lng,
                type,
                name,
                address,
                phone,
                firstPoint = $scope.activeViewPoints[0],
                split,
                srcImage;

                myLatLng = new google.maps.LatLng(firstPoint.lat, firstPoint.lng);
                mapOptions.center = myLatLng;
                map = map || new google.maps.Map($('#map')[0], mapOptions);
                bounds;

            // get bounds
            bounds = new google.maps.LatLngBounds();
            while (len2--) {
                split = $scope.activeViewPoints[len2].coordinates.split(',');
                $scope.activeViewPoints[len2].lat = Number(split[0]);
                $scope.activeViewPoints[len2].lng = Number(split[1]);
                bounds.extend(new google.maps.LatLng($scope.activeViewPoints[len2].lat, $scope.activeViewPoints[len2].lng));
            }

            map.fitBounds(bounds);


            // place markers
            while (len--) {
                lat = $scope.activeViewPoints[len].lat;
                lng = $scope.activeViewPoints[len].lng;
                type = $scope.activeViewPoints[len].type || 'scenicspot';
                name = $scope.activeViewPoints[len].place_name;
                address = $scope.activeViewPoints[len].place_address;
                phone = $scope.activeViewPoints[len].phone || '';
                if ($scope.activeViewPoints[len].images && $scope.activeViewPoints[len].images.length > 0) {
                    srcImage = $scope.activeViewPoints[len].images[0].url || '';
                }
                marker = new BucketListSmallOverlay(
                        bounds,
                        Presets.mapZoom,
                        srcImage,
                        map,
                        new google.maps.LatLng(lat, lng),
                        type,
                        name,
                        address,
                        phone,
                        'closed',
                        'view',
                        (function(point) {
                            return function() {
                                $state.go('viewPoint', { pointId: point.id, collectionId: point.collection});

                                /*
                                $scope.activeViewPoint = point;
                                console.log(point);
                                */
                                google.maps.event.addListener(map, 'bounds_changed', function() {
                                    map.panTo(new google.maps.LatLng(lat, lng));
                                    google.maps.event.clearListeners(map, 'bounds_changed');
                                });
                                return false;
                            };
                        })($scope.activeViewPoints[len])
                    );

                viewOverlays.unshift(marker);
                viewMarkers.unshift(new BucketListPin(bounds, Presets.mapZoom, srcImage, map, myLatLng));
            }

            resetMapSize();

        }
    }

    function updateSavePointType (newType) {
        if (saveOverlay && saveOverlay.changeType) {
            saveOverlay.changeType(newType);
        }
    }

    function updateSavePointImage (imageUrl) {
        if (saveOverlay && saveOverlay.setImage) {
            saveOverlay.setImage(imageUrl);
        }
    }

    function showNoSearchQueryPoint () {

        var title, message;

        lat = 25.033580;
        lng = 121.564820;
        type = 'misc';
        myLatLng = new google.maps.LatLng(lat, lng);
        mapOptions.center = myLatLng;
        map = map || new google.maps.Map($('#map')[0], mapOptions);
        bounds = map.getBounds();
        srcImage = '';
        title = "Where were you searching for?";
        message = "Provide the name or address of a place in the search bar";

        saveOverlay = new BucketListMessageOverlay(bounds, Presets.mapZoom, map, myLatLng, type, title, message);
        saveMarker = new BucketListPin(bounds, Presets.mapZoom, srcImage, map, myLatLng);
    }

    $scope.$on('stateChange', function() {
        console.log ('[[[stateChange mapController]]]');
        console.log (BroadcastService.message.type);
        switch (BroadcastService.message.type) {
            case 'pointSaveComplete':
                if (saveOverlay) {
                    saveOverlay.save();
                }
                break;
            case 'collectionViewingMode':
                displayActiveViewPoints();
                break;
            case 'pointSavingMode':
                displayActiveSavePoint();
                break;
            case 'savePointTypeChange':
                updateSavePointType(BroadcastService.message.data.savePointType);
                break;
            case 'savePointSetImage': console.log(BroadcastService.message.data.imageUrl);
                updateSavePointImage(BroadcastService.message.data.imageUrl);
                break;
            case 'noSearchQuery':
                showNoSearchQueryPoint();
                break;
        }
    });

    $scope.$on('mapChange', function(){
        resetMapSize();
    });

});

SaveApp.controller('pointDetailController', function($scope, Presets, MapPoints, Collections, BroadcastService, $state, PointResource, PointImage) {

    $scope.selectedPointImages = [];
    $scope.deselectedPointImages = [];
    $scope.pointEditMode = false;
    $scope.activeViewPointId = -1;
    $scope.showSelectCollection = false;
    $scope.showDeletePoint = false;
    $scope.activeViewPoint;
    $scope.activeViewPointResource;

    function fillActiveViewPoint (activeViewPointId) {

        /*
        if (activeViewPointId != -1) {
            console.log('load PointResource');
            $scope.activeViewPointResource = PointResource.get({id: activeViewPointId});
        }
        */

        var x = MapPoints.activeViewPoints,
            len = x.length;
        if (len > 0) {
            while (len--) {
                if (x[len].id == activeViewPointId) {
                    $scope.activeViewPoint = x[len];
                    BroadcastService.prepForBroadcast({
                        type: 'pointLoaded',
                        data: {}
                    })
                    break;
                }
            }
        }


    }

    // watchers
    $scope.$watch('activeViewPointId', function(activeViewPointId) {
        console.log('activeViewPointId changed');
        console.log(activeViewPointId);
        fillActiveViewPoint(activeViewPointId);

    });

    $scope.$watch(function() { return MapPoints.activeViewPoint; }, function(activeViewPoint) {
        $scope.activeViewPoint = activeViewPoint;
        $scope.activeViewPoint.date_created = moment(activeViewPoint.create_time).fromNow();
        $scope.activeCollectionId = activeViewPoint.collection;
    });

    $scope.$watch('activeViewPoint', function(activeViewPoint) {
        MapPoints.activeViewPoint = activeViewPoint;
    });

    $scope.$watch( function () { return Collections.collections; }, function ( collections ) {
        $scope.collections = collections;
    }, true);

    $scope.$watch(function(){return Collections.activeCollectionId;}, function(activeCollectionId) {

        console.log('Collections.activeCollectionId watcher');

        $scope.activeCollectionId = activeCollectionId;

        if ($scope.collections
            && $scope.collections.length > 0) {
            for (var c in $scope.collections) {
                if (activeCollectionId == $scope.collections[c].id) {
                    $scope.activeCollectionName = $scope.collections[c].name;
                    break;
                }
            }
        }

    });

    $scope.$watch('activeCollectionId', function(activeCollectionId) {
        Collections.activeCollectionId = activeCollectionId;
    });

    $scope.$on('stateChange', function() {
        console.log('mofo');
        console.log(BroadcastService.message.data);
        switch (BroadcastService.message.type) {
            case 'pointSelected':
                if (typeof BroadcastService.message.data.pointId !== 'undefined') {
                    $scope.activeViewPointId = BroadcastService.message.data.pointId;
                }
                break;
            case 'mapPointsLoaded':
                if ($scope.activeViewPointId !== -1) {
                    fillActiveViewPoint($scope.activeViewPointId);
                }
                break;
        }
    });

    $scope.closePoint = function() {

        $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
    };

    $scope.setPointType = function($e, t){
        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }
        $scope.activeViewPoint.type = t;
    };

    $scope.selectPointCollection = function(new_id) {
        console.log('new collection id: ' + new_id);
        $scope.activeViewPoint.collection = new_id;
    };

    $scope.togglePointEditMode = function() {

        // saved / clicked "Done"
        if ($scope.pointEditMode == false) {

            console.log($scope.activeViewPoint);

        }

        // toggle
        $scope.pointEditMode = !$scope.pointEditMode;

    };

    $scope.savePointChanges = function() {

        PointResource.update({
            id: $scope.activeViewPointId,
            title: $scope.activeViewPoint.title,
            description: $scope.activeViewPoint.description,
            type: $scope.activeViewPoint.type,
            collection: $scope.activeViewPoint.collection
        }, function(data, headers) {
            $scope.togglePointEditMode();
        });

        console.log($scope.deselectedPointImages);
        console.log(typeof $scope.deselectedPointImages);

        var len2;

        for (var x in $scope.deselectedPointImages) {


            len2 = $scope.activeViewPoint.images.length;

            while (len2--) {

                if (typeof $scope.activeViewPoint.images[len2] !== 'undefined'
                    && $scope.activeViewPoint.images[len2].url == $scope.deselectedPointImages[x]) {
                    console.log('delete image: ' + $scope.activeViewPoint.images[len2].id);
                    PointImage.delete({id: $scope.activeViewPoint.images[len2].id});
                    console.log('delete image from activeViewPoint: ' + $scope.activeViewPoint.images[len2]);
                    delete $scope.activeViewPoint.images[len2];
                    break;
                }

            }

        }


    };

    // TODO: make directive for the dropdown
    $scope.selectPointCollection = function(id, $e) {
        if ($e && typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
            $e.stopPropagation();
        }
        console.log('selectCollection');
        console.log('saveCollectionId: ' + id);
        $scope.activeCollectionId = id;
        $scope.showSelectCollection = false; // close the selector
    };

    // user has selected to delete point, show confirm dialog
    $scope.selectPointForDelete = function() {
        $scope.showDeletePoint = true;
        $scope.showPointDetailPanel = false;
    };

    // user has cancelled point deletion, hide confirm dialog
    $scope.unselectPointForDelete = function () {
        $scope.showDeletePoint = false;
        $scope.showPointDetailPanel = true;
    };

    $scope.deletePoint = function() {
        PointResource.delete({ id: $scope.activeViewPoint.id }, function() {
            $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
            $scope.pointEditMode = false;
            $scope.unselectPointForDelete();
        })
    };

});

