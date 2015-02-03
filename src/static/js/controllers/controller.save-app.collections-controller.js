mappingbird.SaveApp.controller('collectionsController', ['$scope', 'Collection', 'Collections', 'MapPoints', 'BroadcastService', '$state', 'Analytics', function($scope, Collection, Collections, MapPoints, BroadcastService, $state, Analytics) {

    $scope.activeCollectionId;
    $scope.activeCollectionPoints = [];
    $scope.activeCollectionPointLength = 0;
    $scope.activeCollectionName = '';
    $scope.collectionsListVisible = false;
    $scope.editMode = false;
    
    // delete collection use
    $scope.deleteCollectionId = null;
    $scope.deleteCollectionName = null;
    $scope.showDeleteCollectionDialog = false;
    

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

            if ($scope.activeCollectionId != -1) {
                // already have collection open
                // check to see if active collection has been deleted
                // switch to most recent if has

                var activeCollectionStillExists = false;

                for (var c in $scope.collections) {
                    if ($scope.activeCollectionId == $scope.collections[c].id) {
                        activeCollectionStillExists = true;
                        break;
                    }
                }
            }

            // if have to change collection
            if (!activeCollectionStillExists || $scope.activeCollectionId == -1) {
                if ($scope.collections.length > 1
                    && Collections.mostRecentModifiedCollection !== -1
                    ) {
                    console.log('mostRecentModifiedCollection');
                    $scope.activeCollectionId = Collections.mostRecentModifiedCollection;
                } else {
                    console.log('setting active collection to first collection as default');
                    $scope.activeCollectionId = $scope.collections[0].id;
                }

                refreshCollectionPoints($scope.activeCollectionId);
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
                if (typeof BroadcastService.message.data.collectionId != 'undefined'
                    && BroadcastService.message.data.collectionId != -1
                    && $scope.activeCollectionId != BroadcastService.message.data.collectionId) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
            case 'setSaveCollection':
                if (typeof BroadcastService.message.data.collectionId != 'undefined'
                    && BroadcastService.message.data.collectionId != -1) {
                    $scope.activeCollectionId = BroadcastService.message.data.collectionId;
                    refreshCollectionPoints($scope.activeCollectionId);
                }
                break;
            case 'pointSelected':
                if (typeof BroadcastService.message.data.collectionId != 'undefined'
                    && BroadcastService.message.data.collectionId != -1
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

        // google analytics
        Analytics.registerEvent('Collection', 'Change collection', 'Collection List');
    };

    $scope.clickCollection = function($event, id, name) {
        $event.preventDefault();
        $event.stopPropagation();
        console.log('clickCollection');
        console.log(id);

        // edit mode - delete collection
        if ($scope.editMode) {

            // confirm dialog
            $scope.deleteCollectionId = id;
            $scope.deleteCollectionName = name;
            $scope.showDeleteCollectionDialog = true;
            
        } else {
            console.log('viewCollection ' + id);
            $scope.collectionsListVisible = false;
            $state.go('viewCollection', { collectionId: id});
            BroadcastService.prepForBroadcast({
                type: 'viewingCollection',
                data: {}
            });

            // google analytics
            Analytics.registerEvent('Collection', 'Change collection', 'Collection List');
        }
    };

    $scope.deleteCollection = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        console.log('delete collection: ' + $scope.deleteCollectionId);
            BroadcastService.prepForBroadcast({
                type: 'requestDeleteCollection',
                data: {
                    collectionToBeDeletedId: $scope.deleteCollectionId,
                    collectionToBeDeletedName: $scope.deleteCollectionName
                }
            });

            $scope.editMode = false;
            $scope.showDeleteCollectionDialog = false;
            
            // google analytics
            Analytics.registerEvent('Collection', 'Delete collection', 'Collection List');
    };

    $scope.unselectCollectionForDelete = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.editMode = false;
        $scope.showDeleteCollectionDialog = false;
        
        console.log('unselect delete collection: ' + $scope.deleteCollectionId);
    };
    
    $scope.showCollections = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        // toggle between map and collection viewing
        console.log('showCollections');
        // show collections list
        // show partial map
        if (!$scope.collectionsMode) {
            $scope.collectionsListVisible = true;
            BroadcastService.prepForBroadcast({
                type: 'viewingCollections',
                data: {}
            });
        // hide collections list
        // show full map
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
        console.log(collectionId);

        if (collectionId) {
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

    }

    function refreshCollectionPointLength (collectionId) {
        console.log('refreshCollectionPointLength');

        if (collectionId) {
            Collection.get({id: collectionId}, function(data, headers){
                console.log('getting number of points for collection');
                console.log(data);
                if (typeof data.points !== 'undefined') {
                    $scope.activeCollectionPointLength = data.points.length;
                }
            });
        }
    }

    $scope.toggleEditMode = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.editMode = !$scope.editMode;
    };

    $scope.gotoListView = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $state.go('viewCollectionList', { collectionId: $scope.activeCollectionId});
        // google analytics
        Analytics.registerEvent('Collection', 'Change to List View', 'Collection List');
    };

    $scope.gotoMapView = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
        // google analytics
        Analytics.registerEvent('Collection', 'Change to Map View', 'Collection List');
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


}]);