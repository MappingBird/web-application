mappingbird.SaveApp.controller('mapController', ['$scope', 'Presets', 'MapPoints', 'BroadcastService', '$state', '$timeout', 'Analytics', function($scope, Presets, MapPoints, BroadcastService, $state, $timeout, Analytics) {

    var saveOverlay,
        saveMarker,
        overlay,
        noSearchQueryOverlay,
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
        map = new google.maps.Map($('#map')[0], mapOptions),
        bounds,
        srcImage = '', // TODO
        viewOverlays = {}
        ;

    $scope.$watch(function() { return MapPoints.activeSavePoint; }, function(activeSavePoint) {

        console.log ('activeSavePoint change');
        console.log (activeSavePoint);
        $scope.activeSavePoint = activeSavePoint;

    });

    $scope.$watch(function() { return MapPoints.activeViewPoints; }, function(activeViewPoints) {

        console.log('MapPoints.activeViewPoints changed');
        console.log($scope.activeViewPoints);
        console.log(activeViewPoints);

        if (!angular.equals($scope.activeViewPoints, activeViewPoints)) {
            console.log('not equal');
            $scope.activeViewPoints = activeViewPoints;
            if ($('#map').data('transitioning')) {
                resetMapSize(displayActiveViewPoints);
            } else {
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

        var location,
            coords,
            phone = '';

        if ($scope.activeSavePoint) {

            location = $scope.activeSavePoint.location;
            coords = $scope.activeSavePoint.location.coordinates.split(',');

            lat = coords[0];
            lng = coords[1];
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
            if ($scope.activeSavePoint.images.length > 0) {
                srcImage = $scope.activeSavePoint.images[0].url;
            } else {
                srcImage = '';
            }


            saveOverlay = new BucketListSmallOverlay(bounds, Presets.mapZoom, srcImage, map, myLatLng, type, location.place_name, location.place_address, phone, 'open', 'save');
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
        if (saveOverlay && typeof saveOverlay.setMap != 'undefined') {
            saveOverlay.setMap(null);
        }

        if (saveMarker && typeof saveMarker.setMap != 'undefined') {
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
                    console.log(projection);
                    if (projection && projection.fromLatLngToContainerPixel) {

                        point = projection.fromLatLngToContainerPixel(new google.maps.LatLng(marker.latlng_.A, marker.latlng_.k));
                        if (point.x > widestPoint || point.y < highestPoint) {
                            widestPoint = point.x;
                        }

                        point = new google.maps.Point(
                                    $('#map').width() + widestPoint,
                                    -highestPoint); // middle of map height, since we only want to reposition bounds to the left and not up and down

                        latlng = projection.fromContainerPixelToLatLng(point);
                        bounds.extend(latlng);
                    }

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

                                // google analytics
                                Analytics.registerEvent('Point', 'View point detail', 'Map');

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
                                    // google analytics
                                    Analytics.registerEvent('Point', 'View point detail', 'Map');
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

    $scope.$on('stateChange', function() {
        console.log ('[[[stateChange mapController]]]');
        console.log (BroadcastService.message.type);
        switch (BroadcastService.message.type) {
            case 'pointSaveRequested':
                if (saveOverlay && typeof saveOverlay.showSavedCheckmark != 'undefined') {
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
            case 'savePointSelected':
                //displayActiveViewPoints();
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
                break;
        }
    });

}]);