mappingbird.SaveApp.controller('pointDetailController', ['$scope', 'Presets', 'MapPoints', 'Collections', 'BroadcastService', '$state', 'PointResource', 'PointImage', 'User', 'Collection', '$http', 'Analytics', function($scope, Presets, MapPoints, Collections, BroadcastService, $state, PointResource, PointImage, User, Collection, $http, Analytics) {

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
        } else {
            $scope.pointImages = [];
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

        var len = $scope.collections.length;

        $scope.activeCollectionId = activeCollectionId;

        if ($scope.collections
            && $scope.collections.length > 0) {
            while (len--) {
                if (activeCollectionId == $scope.collections[len].id) {
                    $scope.activeCollectionName = $scope.collections[len].name;
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
        if ($scope.listMode) {
          $state.go('viewCollectionList', { collectionId: $scope.activeCollectionId});
        } else {
          $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
        }

    };

    $scope.setPointType = function($e, t){
        if ($e) {
            $e.preventDefault();
            $e.stopPropagation();
        }
        $scope.activeViewPoint.type = t;
        // google analytics
        Analytics.registerEvent('Point', 'Changed point type', 'Point Detail Panel');
    };

    $scope.togglePointEditMode = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        // ready for point to change collection
        $scope.changeCollectionName = $scope.activeCollectionName;
        $scope.changeCollectionId = $scope.activeCollectionId;

        // toggle
        $scope.pointEditMode = !$scope.pointEditMode;

    };

    // hack for image delete
    $scope.$on('HackforDeleteImage', function (event, images) {
        $scope.deselectedPointImages = images;
    });
    $scope.savePointChanges = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $http({
            url: '/api/points/' + $scope.activeViewPointId,
            method: 'PATCH',
            data: JSON.stringify({
                id: $scope.activeViewPointId,
                title: $scope.activeViewPoint.title,
                description: $scope.activeViewPoint.description,
                type: $scope.activeViewPoint.type,
                collection: $scope.activeViewPoint.collection
            }),
            headers: { 'Content-Type': 'application/json'}
        }).success(function(data, headers) {

            // if change collection exist, refresh the viewCollection
            if ($scope.changeCollectionId != $scope.activeCollectionId) {
                console.log('[Point Collection change] from ' + $scope.activeCollectionName + ' to ', $scope.changeCollectionName);
                // remove point from view
                BroadcastService.prepForBroadcast({
                    type: 'pointRemoved',
                    data: {
                        'id' : $scope.activeViewPoint.id
                    }
                });
                // update collection list data
                BroadcastService.prepForBroadcast({
                    type: 'collectionUpdate',
                    data: { }
                });
                // rather than get the data again, -1 directly is faster
                BroadcastService.prepForBroadcast({
                    type: 'pointChangeCollection',
                    data: { }
                });
                // show p-alert
                BroadcastService.prepForBroadcast({
                    type: 'pointChangeCollectionComplete',
                    data: {
                        'savedCollectionName' : $scope.changeCollectionName
                    }
                });
                $scope.closePoint($event);
            }

            $scope.togglePointEditMode($event);

            // google analytics
            Analytics.registerEvent('Point', 'Saved point detail changes', 'Point Detail Panel');
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

                    PointImage.delete({id: $scope.activeViewPoint.images[len2].id}, function(){});

                    console.log('delete images ', $scope.activeViewPoint.images[len2].id, deletedImageUrl, $scope.pointImages);

                    // remove deleted image from pointImages
                    var lenImages = $scope.pointImages.length;
                    while (lenImages--) {
                        if ($scope.pointImages[lenImages] == deletedImageUrl) {
                            $scope.pointImages.splice(lenImages, 1);
                            break;
                        }
                    }

                    // delete $scope.activeViewPoint.images[len2];
                    $scope.activeViewPoint.images.splice(len2, 1);

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

        // https://github.com/MappingBird/web-application/issues/167
        // don't change collection view
        // $scope.activeCollectionId = id;
        $scope.changeCollectionId = id;
        // change the changeCollectionName
        var len = $scope.collections.length;
        while (len--) {
            if (id == $scope.collections[len].id) {
                $scope.changeCollectionName = $scope.collections[len].name;
                break;
            }
        }

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

                // send event
                BroadcastService.prepForBroadcast({
                    type: 'collectionUpdate',
                    data: { }
                });

                // google analytics
                Analytics.registerEvent('Collection', 'Saved new', 'Point Detail Panel');
            });

        }

        // check that collection name is entered
        if ($scope.newCollectionName.length > 0) {

            save({ name: $scope.newCollectionName, user: User.data.id });

        } else {

            // error
            console.log('no new collection name error');
            $scope.noCollectionError = true;

            // google analytics
            Analytics.registerEvent('Collection', 'Failed to save - no collection name', 'Point Detail Panel');

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

            // rather than get the data again, -1 directly is faster
            BroadcastService.prepForBroadcast({
                type: 'pointChangeCollection',
                data: { }
            });

            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Point', 'Deleted point', 'Point Detail Panel');
            }

            $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
            $scope.pointEditMode = false;
            $scope.unselectPointForDelete($event);
        }, function() {
            $scope.pointDeleteError = true;
        });
    };

}]);
