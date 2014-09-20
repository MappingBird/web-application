mappingbird.SaveApp.controller('searchResultsController', ['$scope', '$dialog', '$http', '$q', '$cookieStore', 'Presets', 'MapPoints', 'User', 'UserResource', 'Collection', 'Collections', 'PointResource', 'BroadcastService', 'PointImage', 'Scraper', 'Analytics', function($scope, $dialog, $http, $q, $cookieStore, Presets, MapPoints, User, UserResource, Collection, Collections, PointResource, BroadcastService, PointImage, Scraper, Analytics) {

    console.log('init searchResultsController');

    var map,
        lat = 0,
        lng = 0,
        placesSearchTimeBeforeRequest,
        placesSearchTimeAfterRequest;

    $scope.presets = Presets;
    $scope.numResults = 0;
    $scope.searchQuery = ''; // decodeURIComponent(getParameterByName('search'))
    $scope.lastSearchQuery = '';
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
    $scope.pageAddresses = [];
    $scope.selectedPageImages = {};
    $scope.deselectedPageImages = {};
    $scope.noSearchQuery = false;
    $scope.noSearchResults = false;
    $scope.activeSearchResult = -1;
    $scope.showSelectCollection = false;
    $scope.saveCollectionId;
    $scope.saveCollectionName;
    $scope.noCollectionError = false;
    $scope.showSearchTip = false;
    $scope.userDontShowSearchTip = $cookieStore.get('dontShowSearchTip') || false;
    $scope.placeImagesLoaded = false;
    $scope.tags = [];

    // show search tip only if the user hasn't hidden them
    // and there is a search query
    // and there are search results
    function checkSearchTip () {
        if (!$scope.userDontShowSearchTip &&
            !$scope.noSearchQuery &&
            !$scope.noSearchResults) {
            $scope.showSearchTip = true;
        } else {
            $scope.showSearchTip = false;
        }
    }

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

    $scope.$watch(function(){return User.data.tags;}, function(tags) {
        $scope.tags = tags;
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

    $scope.$watch('userDontShowSearchTip', function(userDontShowSearchTip) {
        checkSearchTip();
    });

    $scope.$watch('noSearchResults', function(noSearchResults) {
        checkSearchTip();
    });

    $scope.$watch('noSearchQuery', function(noSearchQuery) {
        checkSearchTip();
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

                // remove duplicates which are being returned by the backend
                if (data.address && data.address.length > 0) {
                    /*
                    $.each(data.address, function(i, el){
                        if($.inArray(el, $scope.pageAddresses) === -1) $scope.pageAddresses.push(el);
                    });
*/

                }

            });

        } else {
            console.log('no url');
            // TODO: show error?

            // google analytics
            Analytics.registerEvent('Search', 'No URL', 'Save Panel');
        }

    };

    function placesSearchCallback (data, textStatus){
        console.log('placesSearchCallback');
        console.log(data);
        var len = data.length,
            len2 = data.length,
            d,
            timeToRespond;

        // tracking the performance of the Google Places API
        placesSearchTimeAfterRequest = new Date();

        // google analytics
        if (typeof ga != 'undefined') {
            timeToRespond = (placesSearchTimeAfterRequest.getTime() - placesSearchTimeBeforeRequest.getTime())/1000;
            console.log('Google Places Search response time (secs): ' + timeToRespond);
            Analytics.registerEvent('Performance', 'Google Places Search', 'Save Panel', timeToRespond);
        }

        $scope.$apply(function(){
            $scope.numResults = data.length;
            $scope.searchResultsLoading = false;
            $scope.searchResultsLoaded = true;
        });

        if (typeof data !== 'undefined' && len > 0) {
            console.log('there are search results');
            console.log(len);
            // if there's only one result, select search result
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

            // need to apply scope here to ensure that
            // the points are able to be referenced in
            // $scope.setActiveSavePoint()
            $scope.$apply();

            if (len2 === 1) {
                // single search results, jump to save panel
                $scope.setActiveSavePoint(null, 0);
                console.log('set activeSavePoint single');
                console.log($scope.activeSavePoint);

                // google analytics
                Analytics.registerEvent('Search', 'One search result', 'Save Panel');

            } else {
                // multiple search results, so set the first
                // as the default but also show the search
                // results panel
                $scope.setActiveSavePoint(null, 0, true);
                console.log('set activeSavePoint multiple');
                console.log($scope.activeSavePoint);

                // google analytics
                Analytics.registerEvent('Search', 'Multiple search results', 'Save Panel');
            }

            $scope.$emit("placesLoaded");

        } else {

            console.log('no places search result');
            $scope.$apply(function(){
                $scope.noSearchResults = true;
            });

            $scope.lastSearchQuery = $scope.searchQuery;

            // empty places array in case it already had search results
            if ($scope.places.length > 0) {
                $scope.places.splice(0, $scope.places.length);
            }

            BroadcastService.prepForBroadcast({
                type: 'noSearchResults',
                data: {}
            });

            // google analytics
            Analytics.registerEvent('Search', 'No search results', 'Save Panel');

        }
    }

    $scope.fetchPlacesSearchResults = function (){
        console.log('fetchPlacesSearchResults');
        console.log('fetchPlacesSearchResults map');
        $scope.searchResultsLoading = true;

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

        placesSearchTimeBeforeRequest = new Date();

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

        console.log(place);

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
        point.images = [];

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
        $scope.$apply();

        // in the case of multiple search results
        // where we want to load a map but still
        // show the search results in the side.
        // A single search result will automatically
        // show the save form.
        if (!$forceShowSearchResults) {
            $scope.prepSaveActiveSearchResult();
        }

        BroadcastService.prepForBroadcast({
            type: 'savePointSelected',
            data: {}
        });

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
        BroadcastService.prepForBroadcast({
            type: 'pointSavingMode',
            data: {}
        });
    };

    $scope.cancelSaveActiveSearchResult = function ($event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        $scope.searchResultSelected = false;
        $scope.setActiveSavePoint(null, $scope.activeSearchResult, true);
        BroadcastService.prepForBroadcast({
            type: 'pointViewingMode',
            data: {}
        });
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
                $scope.selectCollection(null, data.id);

                // blank the form
                $scope.newCollectionName = '';

                // send event
                BroadcastService.prepForBroadcast({
                    type: 'collectionUpdate',
                    data: { }
                });

                // google analytics
                Analytics.registerEvent('Collection', 'Saved new', 'Save Panel');

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
                            // google analytics
                            Analytics.registerEvent('User', 'New registered user', 'Save Panel');

                        } else {
                            User.data.isRegisteredUser = false;
                            // google analytics
                            Analytics.registerEvent('User', 'New unregistered user', 'Save Panel');

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

            // google analytics
            Analytics.registerEvent('Collection', 'Failed to save - No collection name', 'Save Panel');

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

        // google analytics
        Analytics.registerEvent('Collection', 'Changed collection', 'Save Panel');

    };

    $scope.setPointType = function($e, t){
        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }
        $scope.activeSavePoint.type = t;

        // google analytics
        Analytics.registerEvent('Point', 'Changed point type', 'Save Panel');

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

                var pointId = data.id,
                    imageData;

                // save images
                for (var p in $scope.selectedPageImages) {
                    imageData = {
                        url: $scope.selectedPageImages[p],
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

                // google analytics
                Analytics.registerEvent('Point', 'Saved new', 'Save Panel');

            });

        } else {
            // error, no collection set
            // show error
            console.log ('error: no collection selected - cannot save');

            // show select collection with error message
            $scope.noCollectionError = true;

            // google analytics
            Analytics.registerEvent('Point', 'Failed to save - No collection selected', 'Save Panel');
        }

    };

    $scope.searchPlaces = function ($event) {
        if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
        }

        console.log('searchPlaces fffffffffffffffffffffffffffffffffffffffffffffffffff');

        // reset the save panel and other messages
        $scope.noSearchResults = false;
        $scope.noSearchQuery = false;
        $scope.searchResultSelected = false;
        BroadcastService.prepForBroadcast({
            type: 'newSearch',
            data: {}
        });


        if ($scope.searchQuery && $scope.searchQuery.length > 0 && $scope.searchQuery !== 'undefined') {
            console.log('hasSearchQuery fffffffffffffffffffffffffffffffffffffffffffffffffff');
            $scope.placesApiUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCixleTjJLXPDQs9AIG6-18Gvx1X6M7If8&sensor=false&query=' + $scope.searchQuery + '&callback=?';
            $scope.noSearchQuery =  false;

            $scope.fetchPlacesSearchResults();
            $scope.getPageData();

            BroadcastService.prepForBroadcast({
                type: 'pointViewingMode',
                data: {}
            });

            // google analytics
            Analytics.registerEvent('Search', 'Has search query', 'Save Panel');

        } else {
            console.log('noSearchQuery fffffffffffffffffffffffffffffffffffffffffffffffffff');
            $scope.noSearchQuery = true;

            BroadcastService.prepForBroadcast({
                type: 'noSearchQuery',
                data: {
                    'isRegisteredUser': User.data.isRegisteredUser
                }
            });

            // google analytics
            Analytics.registerEvent('Search', 'No search query', 'Save Panel');

        }

    };

    $scope.displaySearchTip = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $cookieStore.remove('dontShowSearchTip');
        $scope.userDontShowSearchTip = false;
        $scope.showSearchTip = true;
        $scope.searchPlaces();
    }

    $scope.hideSearchTip = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $cookieStore.put('dontShowSearchTip', true);
        $scope.userDontShowSearchTip = true;
        $scope.showSearchTip = false;
    };

    // return a promise because ngTagInput expects a promise
    $scope.loadTags = function(query) {

        var subset = [],
            l = $scope.tags.length;

        while (l--) {
            if ($scope.tags[l].text.indexOf(query.toLowerCase()) > -1) {
                subset.unshift($scope.tags[l]);
            }
        }

        var deferred = $q.defer();
        deferred.resolve(subset);
        return deferred.promise;
    }


    // init code
    $scope.$on('stateChange', function() {
        switch(BroadcastService.message.type) {
            case 'viewSearchResults':
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

    $scope.$on('placeImagesLoaded', function() {
        console.log('>>> placeImagesLoaded received');
        $scope.placeImagesLoaded = true;
    })

    // init show search tip
    checkSearchTip();

}]);