// HTTP solution from
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
var SaveApp = angular.module('SaveApp', ['SaveApp.directives', 'SaveApp.services', 'ngCookies', 'ngSanitize', 'ui.bootstrap', 'ui.router', 'ngTagsInput'], function($httpProvider, $dialogProvider) {
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
        });

    // fallback
    $urlRouterProvider.otherwise("/");

});

SaveApp.run(function($http, $cookies) {
    $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
});


SaveApp.controller('userController', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogin, UserLogout, Token) {

    $scope.user = CurrentUser.get(function(data) {

        console.log('user data');
        console.log(data);

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {

            console.log('user logged in');

            User.data.emailAddress = data.email;
            User.data.id = data.id;

            if (!/@gu.mappingbird.com$/.test(data.email)) {
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
                    email: getRandomInt(0,100) + time + '@gu.mappingbird.com',
                    password: 'pword' + getRandomInt(0,1000000000)
                };

            function generateUser () {

                // generate user
                UserResource.save(userCredentials, function(data, headers) {

                    // login this generated user
                    UserLogin.save(userCredentials, function(data, headers) {
                        if (typeof data !== 'undefined'
                            && typeof data.user !== 'undefined'
                            && typeof data.user.email !== 'undefined'
                            && typeof data.user.id !==  'undefined') {

                            /**
                                We've decided to directly extract the csrftoken
                                from document.cookie because Angular can't detect
                                the updated csrftoken cookie value. Possibly b/c
                                of the fact there are multiple "Set-Cookie" headers
                                in the response.
                             */

                            console.log('UserLogin token');
                            var re = /csrftoken=([a-zA-Z0-9]*)/g,
                                cookieArray = document.cookie.match(re),
                                csrftoken;

                            if (re.test(document.cookie) && cookieArray.length == 1) {

                                csrftoken = cookieArray[0].replace("csrftoken=", "");

                                $http.defaults.headers.common['X-CSRFToken'] = csrftoken;

                                User.data.emailAddress = data.user.email;
                                User.data.id = data.user.id;

                                if (!/@gu.mappingbird.com$/.test(data.user.email)) {
                                    User.data.isRegisteredUser = true;
                                    User.data.isLoggedIn = true;
                                    $scope.isLoggedIn = true;
                                } else {
                                    User.data.isRegisteredUser = false;
                                }

                                BroadcastService.prepForBroadcast({
                                    type: 'userLoaded',
                                    data: { userId: data.user.id }
                                });

                            } else {
                                // TODO: multiple or no csrftoken error
                            }

                        } else {
                            // TODO: login error
                            console.log('Login error with generated user');
                        }
                    });

                });

            }

            if ($cookies.csrftoken) {
                generateUser();
            } else {
                Token.get(function(data, headers) {

                    $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;

                    generateUser();

                });
            }

        }

    });

    $scope.goToSignUpPage = function() {
        $window.location.href = '/static/signup.html';
    };

    $scope.logout = function($event) {

        $event.preventDefault();
        $event.stopPropagation();

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

    function changeMapParams () {
        $('#map').data('transitioning', true);
    }

    // map viewing mode
    function mapViewingMode () {
        changeMapParams();
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
    }

    // point saving mode
    function pointSavingMode () {
        changeMapParams();
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
    }

    // point viewing mode
    function pointViewingMode () {
        changeMapParams();
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
    }

    // collection viewing mode
    function collectionViewingMode() {
        changeMapParams();
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

SaveApp.controller('searchResultsController', function($scope, $dialog, $http, $cookieStore, Presets, MapPoints, User, UserResource, Collection, Collections, PointResource, BroadcastService, PointImage, Scraper) {

    console.log('init searchResultsController');

    var map,
        lat = 0,
        lng = 0;

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
    $scope.showSearchTip = false;

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

    $scope.$watch('noSearchResults', function(noSearchResults) {
        if ($scope.noSearchResults) {
            $scope.showSearchTip = true;
        } else {
            // $scope.showSearchTip = false;
        }
    });

    $scope.$watch('noSearchQuery', function(noSearchQuery) {
        if ($scope.noSearchQuery) {
            $scope.showSearchTip = true;
        } else {
            //$scope.showSearchTip = true;
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
            len2 = data.length,
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
                while (len--) {
                    $scope.places.unshift({
                        index: len,
                        icon: data[len].icon,
                        name: data[len].name,
                        address: data[len].formatted_address,
                        phone: '',
                        location: {
                            place_name: data[len].name,
                            place_address: data[len].formatted_address,
                            coordinates: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng()
                        },
                        coords: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng(),
                        type: data[len].type || 'misc',
                        lat: data[len].geometry.location.lat(),
                        lng: data[len].geometry.location.lng()
                    });
                }

                if (len2 === 1) {
                    $scope.setActiveSavePoint(null, 0);
                    console.log('set activeSavePoint single');
                    console.log($scope.activeSavePoint);
                } else {
                    $scope.setActiveSavePoint(null, 0, true);
                    console.log('set activeSavePoint multiple');
                    console.log($scope.activeSavePoint);
                }

            });

            $scope.$emit("placesLoaded");

        } else {
            // TODO: show error
            console.log('no places search result');
            $scope.noSearchResults = true;

            BroadcastService.prepForBroadcast({
                type: 'noSearchResults',
                data: {}
            });
        }
    }

    $scope.fetchPlacesSearchResults = function (){
        console.log('fetchPlacesSearchResults');
        console.log('fetchPlacesSearchResults map');
        $scope.searchResultsLoading = true;
        console.log(map);

        var center = new google.maps.LatLng(0, 0), // default coords
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


    $scope.setActiveSavePoint = function($event, index, $forceShowSearchResults) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        console.log('setactiveSavePoint ' + index);

        var image,
            place = $scope.places[index],
            point = {};

        // build point object to match structure of saved points
        // so can display correctly on map
        point.title = place.name;
        point.type = place.type;
        point.location = {
            place_name: place.name,
            place_address: place.address,
            coordinates: place.coords
        }
        point.isSavePoint = true;

        // images
        if (typeof $scope.pageImages !== 'undefined'
            && $scope.pageImages.length > 0) {

            point.images = [ { url: $scope.pageImages[0] }];

            BroadcastService.prepForBroadcast({
                type: 'savePointSetImage',
                data: {
                    imageUrl: image
                }
            });
        }

        $scope.activeSavePoint = point;
        $scope.activeSearchResult = index;

        // in the case of multiple search results
        // where we want to load a map but still
        // show the search results in the side.
        // A single search result will automatically
        // show the save form.
        if (!$forceShowSearchResults) {
            $scope.prepSaveActiveSearchResult();
        }

        BroadcastService.prepForBroadcast({
            type: 'setSaveCollection',
            data: {
                collectionId: $scope.activeCollectionId
            }
        });

    };

    $scope.prepSaveActiveSearchResult = function () {
        //$event.preventDefault();
        //$event.stopPropagation();
        $scope.searchResultSelected = true;
    };

    $scope.cancelSaveActiveSearchResult = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.searchResultSelected = false;
    };

    $scope.saveNewCollection = function($e) {
        if (typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
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
                        if (!/@gu.mappingbird.com$/.test(data.email_address)) {
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

    $scope.clickShowSelectCollection = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.showSelectCollection = true;
        $scope.saveCollectionId = undefined;
    };

    $scope.selectCollection = function($e, id) {
        if ($e && typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
            $e.stopPropagation();
        }
        console.log('selectCollection');
        console.log('saveCollectionId: ' + id);
        $scope.saveCollectionId = id;
        $scope.showSelectCollection = false; // close the selector
        $scope.activeCollectionId = id; // set the active collection id

        BroadcastService.prepForBroadcast({
            type: 'saveCollectionChanged',
            data: {
                collectionId: id
            }
        });
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

        var pointData,
            tags = $scope.pageData.tags,
            saveTags = "",
            x;

        // check if saveCollectionId is set
        if (typeof $scope.saveCollectionId !== 'undefined') {

            $scope.noCollectionError = false;

            // prep tags
            if (typeof tags.length != 'undefined' && tags.length > 0) {
                for (x in tags) {
                    saveTags += tags[x].text + ",";
                }
            } else {
                saveTags = "";
            }

            pointData = {
                title: $scope.pageData.title,
                url: $scope.targetUrl,
                description: $scope.pageData.text,
                tags: saveTags,
                place_name: $scope.activeSavePoint.location.place_name,
                place_address: $scope.activeSavePoint.location.place_address,
                place_phone: "", // empty
                coordinates: $scope.activeSavePoint.location.coordinates,
                type: $scope.activeSavePoint.type,
                collection: $scope.saveCollectionId
            };

            // send event
            BroadcastService.prepForBroadcast({
                type: 'pointSaveRequested',
                data: {}
            });

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

    $scope.searchPlaces = function ($event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        $scope.noSearchResults = false;

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

    $scope.displaySearchTip = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $cookieStore.remove('dontShowSearchTip');
        $scope.showSearchTip = true;
        $scope.searchPlaces();
    }

    $scope.hideSearchTip = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $cookieStore.put('dontShowSearchTip', true);
        $scope.showSearchTip = false;
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

    // init show search tip
    if ($cookieStore.get('dontShowSearchTip') ||
        $scope.noSearchQuery ||
        $scope.noSearchResults) {
        $scope.showSearchTip = false;
    } else {
        $scope.showSearchTip = true;
    }


});

SaveApp.controller('collectionsController', function($scope, Collection, Collections, MapPoints, BroadcastService, $state) {

    $scope.activeCollectionId;
    $scope.activeCollectionPoints = [];
    $scope.activeCollectionPointLength = 0;
    $scope.activeCollectionName = '';
    $scope.collectionsListVisible = false;
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
            case 'saveCollectionChanged':
            case 'viewingCollection':
                if (BroadcastService.message.data.collectionId != -1
                    && $scope.activeCollectionId != BroadcastService.message.data.collectionId) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
            case 'setSaveCollection':
                if (BroadcastService.message.data.collectionId != -1) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
            case 'pointSelected':
                if (BroadcastService.message.data.collectionId != -1
                    && $scope.activeCollectionId != BroadcastService.message.data.collectionId) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
        }

    });

    $scope.setActiveCollection = function($event, id) {
        $event.preventDefault();
        $event.stopPropagation();
        console.log('setActiveCollection: ' + id);
        $scope.activeCollectionId = id;
    };

    $scope.clickCollection = function($event, id, name) {
        $event.preventDefault();
        $event.stopPropagation();
        console.log('clickCollection');
        console.log(id);

        // edit mode - delete collection
        if ($scope.editMode) {
            console.log('delete collection: ' + id);
            BroadcastService.prepForBroadcast({
                type: 'requestDeleteCollection',
                data: {
                    collectionToBeDeletedId: id,
                    collectionToBeDeletedName: name
                }
            });
        } else {
            console.log('viewCollection ' + id);
            $scope.collectionsListVisible = false;
            $state.go('viewCollection', { collectionId: id});
            BroadcastService.prepForBroadcast({
                type: 'viewingCollection',
                data: {}
            });
        }
    };

    $scope.showCollections = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        // toggle between map and collection viewing
        console.log('showCollections');
        // hide collections list
        if (!$scope.collectionsMode) {
            $scope.collectionsListVisible = true;
            BroadcastService.prepForBroadcast({
                type: 'viewingCollections',
                data: {}
            });
        // show collections list
        } else {
            $scope.collectionsListVisible = false;
            $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
            BroadcastService.prepForBroadcast({
                type: 'viewingCollection',
                data: {}
            });
        }

    }

    // functions
    function refreshCollectionPoints (collectionId) {
        console.log('refreshCollectionPoints');

        Collection.get({id: collectionId}, function(data, headers){
            console.log('loading points for collection');
            console.log(data);
            if (typeof data.points !== 'undefined') {
                if ($scope.saveMode && MapPoints.activeSavePoint.name != '') {
                    data.points.push(MapPoints.activeSavePoint);
                }
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

    $scope.toggleEditMode = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.editMode = !$scope.editMode;
    };


    $scope.$on('stateChange', function() {
        console.log ('[[[stateChange collectionsController]]]');
        console.log (BroadcastService.message.type);
        switch (BroadcastService.message.type) {
            case 'deleteCollection':
                Collection.delete({id: BroadcastService.message.data.id}, function(data, headers){
                    BroadcastService.prepForBroadcast({
                        type: 'collectionUpdate',
                        data: {}
                    });
                });
                break;
        }
    });


});

SaveApp.controller('mapController', function($scope, Presets, MapPoints, BroadcastService, $state, $timeout) {

    var saveOverlay,
        saveMarker,
        overlay,
        marker,
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
        viewOverlays = {}
        ;

    $scope.$watch(function() { return MapPoints.activeSavePoint; }, function(activeSavePoint) {

        console.log ('activeSavePoint change');
        console.log ($scope.saveMode);
        $scope.activeSavePoint = activeSavePoint;

    });

    $scope.$watch(function() { return MapPoints.activeViewPoints; }, function(activeViewPoints) {

        console.log('MapPoints.activeViewPoints changed');
        console.log($scope.activeViewPoints);
        console.log(activeViewPoints);

        if (!angular.equals($scope.activeViewPoints, activeViewPoints)) {
            console.log('not equal');
            $scope.activeViewPoints = activeViewPoints;
            console.log('map height: ' + (function() { return $('#map').height()})());
        console.log('map width: ' + (function() { return $('#map').width()})());
            if ($('#map').data('transitioning')) {
                resetMapSize(displayActiveViewPoints);
            } else {
                displayActiveViewPoints();
            }

            //displayActiveViewPoints();

        }
    });

    $scope.$watch(function() { return MapPoints.activeViewPoint; }, function(activeViewPoint) {
        $scope.activeViewPoint = activeViewPoint;
    });

    $scope.$watch('activeViewPoint', function(activeViewPoint) {
        MapPoints.activeViewPoint = activeViewPoint;
    });

    function resetMapSize(callback) {
        console.log('resetMapSize');

        $('#map').data('transitioning', true);

        if (typeof map !== 'undefined') {
            $('#map').on('transitionend.resize', function() {
                google.maps.event.trigger(map, "resize");
                $('#map').off('transitionend.resize');
                $('#map').data('transitioning', false);
                //recenterMap();
            });
        }

        if (typeof callback === 'function') {
            $('#map').on('transitionend', function() {
                callback();
                $('#map').off('transitionend');
            });
        }
    }
/*
    map = new google.maps.Map($('#map')[0], mapOptions);

    google.maps.event.addListener(map, 'bounds_changed', function() {
        recenterMap();
    });
*/

    function recenterMap() {

        var len2 = $scope.activeViewPoints.length,
            bounds = new google.maps.LatLngBounds(),
            centerPoint = $scope.activeViewPoints[0];

        while (len2--) {
            split = $scope.activeViewPoints[len2].location.coordinates.split(',');
            $scope.activeViewPoints[len2].lat = Number(split[0]);
            $scope.activeViewPoints[len2].lng = Number(split[1]);

            // set bounds
            bounds.extend(new google.maps.LatLng($scope.activeViewPoints[len2].lat, $scope.activeViewPoints[len2].lng));
        }

        myLatLng = new google.maps.LatLng(centerPoint.lat, centerPoint.lng);
        mapOptions.center = myLatLng;
        map = map || new google.maps.Map($('#map')[0], mapOptions);
        map.fitBounds(bounds);
        map.panTo(myLatLng)

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
            map = new google.maps.Map($('#map')[0], mapOptions);
            if (saveOverlay) {
                saveOverlay.setMap(null);
            }
            if (saveMarker) {
                saveMarker.setMap(null);
            }
            bounds = map.getBounds();
            srcImage = $scope.activeSavePoint.image;

            saveOverlay = new BucketListSmallOverlay(bounds, Presets.mapZoom, srcImage, map, myLatLng, type, $scope.activeSavePoint.name, $scope.activeSavePoint.address, $scope.activeSavePoint.phone, 'open', 'save');
            saveMarker = new BucketListPin(bounds, Presets.mapZoom, srcImage, map, myLatLng);
        }
    }

    // http://stackoverflow.com/questions/10656743/how-to-offset-the-center-point-in-google-maps-api-v3
    function offsetCenter(latlng,offsetx,offsety) {

        // latlng is the apparent centre-point
        // offsetx is the distance you want that point to move to the right, in pixels
        // offsety is the distance you want that point to move upwards, in pixels
        // offset can be negative
        // offsetx and offsety are both optional

        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
            map.getBounds().getNorthEast().lat(),
            map.getBounds().getSouthWest().lng()
        );

        var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
        var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)

        var worldCoordinateNewCenter = new google.maps.Point(
            worldCoordinateCenter.x - pixelOffset.x,
            worldCoordinateCenter.y + pixelOffset.y
        );

        var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

        map.panTo(newCenter);

    }

    function displayActiveViewPoints () {
        console.log('map height: ' + (function() { return $('#map').height()})());
        console.log('map width: ' + (function() { return $('#map').width()})());
        // clear existing pins
        if (saveOverlay) {
            saveOverlay.setMap(null);
        }

        if (saveMarker) {
            saveMarker.setMap(null);
        }

        // clear overlays
        var l;
        for (l in viewOverlays) {
            console.log('clearing overlays');
            if (Object.prototype.hasOwnProperty.call(viewOverlays, l)) {
                console.log('clearing overlay: ' + l);
                viewOverlays[l].setMap(null);
            }
        }
        viewOverlays = {};
        console.log(viewOverlays);

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
                centerPoint = $scope.activeViewPoints[0],
                split,
                srcImage,
                activePoint,
                bounds = new google.maps.LatLngBounds(),
                overlayHelper = new google.maps.OverlayView(),
                projection,
                point,
                widestPoint = $('#map').width() - 332,
                highestPoint = 130;

            // http://stackoverflow.com/questions/10339365/googlemaps-api-3-fitbounds-padding
            overlayHelper.onAdd = function() {};
            overlayHelper.onRemove = function() {};
            overlayHelper.draw = function() {};
            overlayHelper.setMap(map);
            projection = overlayHelper.getProjection();

            while (len2--) {
                split = $scope.activeViewPoints[len2].location.coordinates.split(',');
                $scope.activeViewPoints[len2].lat = Number(split[0]);
                $scope.activeViewPoints[len2].lng = Number(split[1]);

                // if saving a point, center the map around the point to be saved
                console.log('len2: ' + len2);
                if (typeof $scope.activeViewPoints[len2].isSavePoint != 'undefined' && $scope.activeViewPoints[len2].isSavePoint) {
                    console.log('savepoint: ' + len2);
                    centerPoint = $scope.activeViewPoints[len2];
                }

                // set bounds
                bounds.extend(new google.maps.LatLng($scope.activeViewPoints[len2].lat, $scope.activeViewPoints[len2].lng));
            }

            myLatLng = new google.maps.LatLng(centerPoint.lat, centerPoint.lng);
            mapOptions.center = myLatLng;
            map = map || new google.maps.Map($('#map')[0], mapOptions);
            map.fitBounds(bounds);

            // place markers
            while (len--) {
                lat = $scope.activeViewPoints[len].lat;
                lng = $scope.activeViewPoints[len].lng;
                type = $scope.activeViewPoints[len].type || 'scenicspot';
                name = $scope.activeViewPoints[len].title;
                address = $scope.activeViewPoints[len].location.place_address;
                phone = $scope.activeViewPoints[len].location.place_phone || '';
                if ($scope.activeViewPoints[len].images && $scope.activeViewPoints[len].images.length > 0) {
                    srcImage = $scope.activeViewPoints[len].images[0].url;
                } else {
                    srcImage = '';
                }

                // special rendering for save point
                if (typeof $scope.activeViewPoints[len].isSavePoint != 'undefined' && $scope.activeViewPoints[len].isSavePoint) {

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
                        'open',
                        'save');

                    saveOverlay = marker;

                    // now check to see if any overlays go off the screen
                    console.log(marker);
                    console.log(marker.getPosition);
                    console.log(projection.fromLatLngToContainerPixel);
                    point = projection.fromLatLngToContainerPixel(new google.maps.LatLng(marker.latlng_.A, marker.latlng_.k));
                    if (point.x > widestPoint || point.y < highestPoint) {
                        widestPoint = point.x;
                    }

                    point = new google.maps.Point(
                                $('#map').width() + widestPoint,
                                -highestPoint); // middle of map height, since we only want to reposition bounds to the left and not up and down

                    latlng = projection.fromContainerPixelToLatLng(point);
                    bounds.extend(latlng);

                // else just show points
                } else {
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

                                // pan to offset if not full map, otherwise just pan to center
                                $('#map').on('transitionend.' + point.id, function() {
                                        if ($scope.fullMap) {
                                            map.panTo(new google.maps.LatLng(point.lat, point.lng));
                                        } else {
                                            offsetCenter(new google.maps.LatLng(point.lat, point.lng), -($('#map').width()/2));
                                        }

                                    $('#map').off('transitionend.' + point.id);
                                });

                                $state.go('viewPoint', { pointId: point.id, collectionId: point.collection});

                                return false;
                            };
                        })($scope.activeViewPoints[len]),
                        (function(point) {
                            return function(x, y) {
                                if (activePoint && activePoint !== point.id && viewOverlays[activePoint]) {
                                    viewOverlays[activePoint].hidePopup();
                                }
                                activePoint = point.id;

                                var mapWidth = $('#map').width(),
                                    mapHeight = $('#map').height(),
                                    mapOffsetLeft = $('#map').offset().left,
                                    mapOffsetTop = $('#map').offset().top,
                                    popupWidth = 310, // hard-coded from maps.css
                                    popupHeight = 100 // hard-coded from maps.css
                                    ;

                                if (mapOffsetLeft + mapWidth - x < popupWidth ||
                                    mapOffsetTop + mapHeight - y < popupHeight ||
                                    y - mapOffsetTop < popupHeight
                                    ) {
                                    if ($scope.fullMap) {
                                            map.panTo(new google.maps.LatLng(point.lat, point.lng));
                                        } else {
                                            offsetCenter(new google.maps.LatLng(point.lat, point.lng), -($('#map').width()/2));
                                        }
                                }

                                // show point information if point detail panel is already open
                                if ($scope.showPointDetailPanel) {
                                    $state.go('viewPoint', { pointId: point.id, collectionId: point.collection});
                                }

                                return false;
                            };
                        })($scope.activeViewPoints[len])
                    );
                }

                viewOverlays[$scope.activeViewPoints[len].id] = marker;

            }

            console.log('viewOverlays post marker');
            console.log(viewOverlays);

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

    function removeActiveViewPoint (id) {

        console.log('removeActiveViewPoint: ' + id);

        if (id) {

            if (viewOverlays[id]) {
                console.log('deleted overlay exists');
                viewOverlays[id].setMap(null);
                delete viewOverlays[id];
                console.log(typeof viewOverlays[id]);
            }

        }
    }

    function showNoSearchQueryPoint () {

        var title, message;

        type = 'misc';
        myLatLng = new google.maps.LatLng(lat, lng);
        mapOptions.center = myLatLng;
        map = new google.maps.Map($('#map')[0], mapOptions);
        bounds = map.getBounds();
        srcImage = '';
        title = "Where were you searching for?";
        message = "Provide the name or address of a place in the search bar";

        overlay = new BucketListMessageOverlay(bounds, Presets.mapZoom, map, myLatLng, type, title, message);
    }

    $scope.$on('stateChange', function() {
        console.log ('[[[stateChange mapController]]]');
        console.log (BroadcastService.message.type);
        switch (BroadcastService.message.type) {
            case 'pointSaveRequested':
                if (saveOverlay) {
                    saveOverlay.showSavedCheckmark();
                }
                break;
            case 'pointSaveComplete':
                if (saveOverlay) {
                    $timeout(function(){
                        saveOverlay.hideSavedCheckmark();
                    }, 3000);
                }
                break;
            case 'collectionViewingMode':
                displayActiveViewPoints();
                break;
            case 'pointDeleted':
                removeActiveViewPoint(BroadcastService.message.data.id);
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
            case 'noSearchResults':
                showNoSearchQueryPoint();
                break;
        }
    });

});

SaveApp.controller('pointDetailController', function($scope, Presets, MapPoints, Collections, BroadcastService, $state, PointResource, PointImage, User, Collection) {

    $scope.pointImages = [];
    $scope.selectedPointImages = [];
    $scope.deselectedPointImages = [];
    $scope.pointEditMode = false;
    $scope.pointDeleteError = false;
    $scope.activeViewPointId = -1;
    $scope.newCollectionName = '';
    $scope.showSelectCollection = false;
    $scope.showDeletePoint = false;
    $scope.activeViewPoint;
    $scope.activeViewPointResource;

    function fillActiveViewPoint (activeViewPointId) {

        var x = MapPoints.activeViewPoints,
            len = x.length,
            imglen = 0,
            images = [];

        if (len > 0) {
            while (len--) {
                if (x[len].id == activeViewPointId) {
                    $scope.activeViewPoint = x[len];

                    imglen = x[len].images.length;

                    while(imglen--) {
                        images.unshift(x[len].images[imglen].url);
                    }

                    $scope.pointImages = images;

                    BroadcastService.prepForBroadcast({
                        type: 'pointLoaded',
                        data: {}
                    });

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

    $scope.$watch('pointEditMode', function(pointEditMode) {
        console.log('pointEditMode changed');
        console.log(pointEditMode);
        BroadcastService.prepForBroadcast({
            type: 'pointEditModeChanged',
            data: {
                editMode: pointEditMode
            }
        });
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

    $scope.closePoint = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
    };

    $scope.setPointType = function($e, t){
        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }
        $scope.activeViewPoint.type = t;
    };

    $scope.togglePointEditMode = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        // toggle
        $scope.pointEditMode = !$scope.pointEditMode;

    };

    $scope.savePointChanges = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        PointResource.update({
            id: $scope.activeViewPointId,
            title: $scope.activeViewPoint.title,
            description: $scope.activeViewPoint.description,
            type: $scope.activeViewPoint.type,
            collection: $scope.activeViewPoint.collection
        }, function(data, headers) {
            $scope.togglePointEditMode($event);
        });

        console.log($scope.deselectedPointImages);
        console.log(typeof $scope.deselectedPointImages);

        var len2,
            deletedImageUrl;

        for (var x in $scope.deselectedPointImages) {

            len2 = $scope.activeViewPoint.images.length;

            while (len2--) {

                if (typeof $scope.activeViewPoint.images[len2] !== 'undefined'
                    && $scope.activeViewPoint.images[len2].url == $scope.deselectedPointImages[x]) {

                    deletedImageUrl = $scope.activeViewPoint.images[len2].url;

                    PointImage.delete({id: $scope.activeViewPoint.images[len2].id}, function(){

                        var lenImages = $scope.pointImages.length;

                        // remove deleted image from pointImages
                        if (lenImages) {
                            while (lenImages--) {
                                if ($scope.pointImages[lenImages] == deletedImageUrl) {
                                    $scope.pointImages.splice(lenImages, 1);
                                    break;
                                }
                            }
                        }

                        delete $scope.activeViewPoint.images[len2];

                    });

                    break;
                }

            }

        }


    };

    // TODO: make directive for the dropdown
    $scope.selectPointCollection = function($e, id) {
        if ($e && typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
            $e.stopPropagation();
        }
        console.log('selectCollection');
        console.log('saveCollectionId: ' + id);
        $scope.activeViewPoint.collection = id;
        $scope.activeCollectionId = id;
        $scope.showSelectCollection = false; // close the selector
    };

    $scope.saveNewCollection = function($e) {
        if (typeof $e.stopPropagation === 'function') {
            $e.preventDefault();
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
                $scope.selectPointCollection(data.id);

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

            save({ name: $scope.newCollectionName, user: User.data.id });

        } else {

            // error
            console.log('no new collection name error');
            $scope.noCollectionError = true;

        }


    };

    // user has selected to delete point, show confirm dialog
    $scope.selectPointForDelete = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.showDeletePoint = true;
        $scope.showPointDetailPanel = false;
    };

    // user has cancelled point deletion, hide confirm dialog
    $scope.unselectPointForDelete = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.showDeletePoint = false;
        $scope.showPointDetailPanel = true;
    };

    $scope.deletePoint = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        console.log('deletePoint');

        PointResource.delete({ id: $scope.activeViewPoint.id }, function() {

            console.log('deletePoint return true');

            BroadcastService.prepForBroadcast({
                type: 'collectionUpdate',
                data: { }
            });

            BroadcastService.prepForBroadcast({
                type: 'pointDeleted',
                data: {
                    'id' : $scope.activeViewPoint.id
                }
            });

            $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
            $scope.pointEditMode = false;
            $scope.unselectPointForDelete($event);
        }, function() {
            $scope.pointDeleteError = true;
        });
    };

});

