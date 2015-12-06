mappingbird.SaveApp.controller('collectionsController', ['$rootScope', '$scope', 'Collection', 'Collections', 'MapPoints', 'BroadcastService', '$state', 'Analytics', 'User', '$http', 'Search', function($rootScope, $scope, Collection, Collections, MapPoints, BroadcastService, $state, Analytics, User, $http, Search) {

    $scope.activeCollectionId;
    $scope.activeCollectionPoints = [];
    $scope.activeCollectionPointLength = 0;
    $scope.activeCollectionName = '';
    $scope.collectionsListVisible = false;
    $scope.editMode = false;

    // delete collection use
    $scope.deleteCollectionId = null;
    $scope.deleteCollectionName = null;

    // edit collection use
    $scope.editCollection = [];

    // delete collection use
    $scope.deleteCollectionId = null;
    $scope.deleteCollectionName = null;
    $scope.showDeleteCollectionDialog = false;

    // search use
    $scope.showSearchResult = false;
    $scope.searchInput;
    $scope.haveSitePrevPage = false;

    // watchers
    $scope.$watch(function(){return Collections.activeCollectionId;}, function(activeCollectionId, oldActiveCollectionId) {
        console.log('Collections.activeCollectionId watcher: ' + activeCollectionId);
        console.log(activeCollectionId + ' ' + oldActiveCollectionId);

        $scope.activeCollectionId = activeCollectionId;

        if ($scope.collections
            && $scope.collections.length > 0) {

            console.log('get collectionName.');
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

            // Uncategorized catelog can't be deleted
            if (name === 'Uncategorized') {
              return;
            }

            // popup modal
            $('#deleteCollectionModal').modal('toggle');

            // confirm dialog
            $scope.deleteCollectionId = id;
            $scope.deleteCollectionName = name;

        } else if ($scope.listMode) {
          // collection + list view - change collection
          console.log('viewCollection&List ' + id);
          $scope.collectionsListVisible = true;
          BroadcastService.prepForBroadcast({
            type: 'closeCollections',
            data: {}
          });
          $state.go('viewCollectionList', { collectionId: id});
        }
        else {
          // collection view - change collection
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

        // hide collection list before deletion
        hideCollections();

        // dismiss delete collection modal
        $('#deleteCollectionModal').modal('hide');

        console.log('delete collection: ' + $scope.deleteCollectionId);
        BroadcastService.prepForBroadcast({
            type: 'requestDeleteCollection',
            data: {
                collectionToBeDeletedId: $scope.deleteCollectionId,
                collectionToBeDeletedName: $scope.deleteCollectionName
            }
        });

        $scope.editMode = false;

        // google analytics
        Analytics.registerEvent('Collection', 'Delete collection', 'Collection List');
    };

    // $scope.unselectCollectionForDelete = function ($event) {
    //     $event.preventDefault();
    //     $event.stopPropagation();
    //
    //     $scope.editMode = false;
    //
    //     console.log('unselect delete collection: ' + $scope.deleteCollectionId);
    // };


    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log(event, toState, toParams, fromState, fromParams)
        console.log(toState.name)

        $scope.haveSitePrevPage = true;
        $scope.prevPageStateName = fromState.name;
        $scope.prevPageStateProp = fromParams;
    });

    $scope.closeSearchResult = function ($event) {
        $event.preventDefault();
        $event.stopPropagation(); 
        console.log('close search result'); 
        $scope.showSearchResult = false;
        $scope.$emit("closeSearch");

        if ($scope.haveSitePrevPage) {
            $state.go($scope.prevPageStateName, $scope.prevPageStateProp);
        } else {
            $state.go("default");
        }
    }

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
            BroadcastService.prepForBroadcast({
              type: 'closeCollections',
              data: {}
            });
        }

    };

    // functions
    function hideCollections () {
        $scope.collectionsListVisible = false;
        $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
        BroadcastService.prepForBroadcast({
            type: 'viewingCollection',
            data: {}
        });
    }

    function searchCollectionPoints (searchInput) {
        console.log('searchCollectionPoints');
        console.log(searchInput);
        $scope.showSearchResult = true;
        $scope.searchContent = searchInput;
        if (searchInput) {
            // 改成 call search api
            Collection.get({id: 4}, function(data, headers){
                renderCollection(data);
            });

            // Search.get({ q: searchInput }, function(data, headers){
            //     renderCollection(data);
            // });

        }

    }

    // utils function for search and get collection
    function renderCollection (data) {
        console.log('loading points for collection');
        console.log(data);
        if (typeof data.points !== 'undefined') {
            if ($scope.saveMode && MapPoints.activeSavePoint.name != '') {
                data.points.push(MapPoints.activeSavePoint);
            }
            $scope.activeCollectionPoints = data.points;
            $scope.activeCollectionPointLength = data.points.length;
        }
    }

    function refreshCollectionPoints (collectionId) {
        console.log('refreshCollectionPoints');
        console.log(collectionId);

        if (collectionId) {
            Collection.get({id: collectionId}, function(data, headers){
                renderCollection(data);
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

    function reduceCollectionPointLength () {
        console.log('reduceCollectionPointLength');
        if ($scope.activeCollectionPointLength) {
            var temp = parseInt($scope.activeCollectionPointLength);
            $scope.activeCollectionPointLength = temp - 1;
        }
    }
    $scope.toggleEditMode = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.editMode = !$scope.editMode;

        if ($scope.editMode == true) {
          // copy all value to input text box
          for (var c in $scope.collections) {
              if ($scope.editCollection[c] != $scope.collections[c]) {
                $scope.editCollection[c] = {};
                $scope.editCollection[c].name = $scope.collections[c].name;
                $scope.editCollection[c].id = $scope.collections[c].id;
              }

          }
        } else if ($scope.editMode == false) {
          for (var k in $scope.collections) {
              // Check collection name, rename if different
              if ($scope.editCollection[k].name != $scope.collections[k].name) {
                // Collection updated
                $http.put('/api/collections/' + $scope.editCollection[k].id, {
                    name: $scope.editCollection[k].name,
                    user: User.data.id
                },{
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
                  }
                }
                ).success(function(data, headers) {
                    Analytics.registerEvent('Collection', 'Rename Collection', 'From Collection List', $scope.collections[k].name + "=>" + $scope.editCollection[k].name);
                  });
                // Change the name immediately
                $scope.collections[k].name = $scope.editCollection[k].name;
                }
            }
          }
    };

    $scope.gotoListView = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $state.go('viewCollectionList', { collectionId: $scope.activeCollectionId});
        // google analytics
        Analytics.registerEvent('Collection', 'Change to List View', 'Collection List');
    };

    $scope.closeListView = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        BroadcastService.prepForBroadcast({
            type: 'closeCollectionListView',
            data: {}
        });
        $state.go('viewCollectionSimple', { collectionId: $scope.activeCollectionId});

        // google analytics
        Analytics.registerEvent('Collection', 'Close List View', 'Collection List');
    };

    $scope.gotoMapView = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $state.go('viewCollection', { collectionId: $scope.activeCollectionId});
        // google analytics
        Analytics.registerEvent('Collection', 'Change to Map View', 'Collection List');
    };


    function newCollection(d, fn) {
        //var newCollection = new Collection();
        Collection.save(d, function(data, headers){
            console.log('saveNewCollection successful');
            console.log(data);
            $scope.collections.push(data);

            // send event
            BroadcastService.prepForBroadcast({
                type: 'collectionUpdate',
                data: { }
            });

            // callback
            fn();

            // google analytics
            Analytics.registerEvent('Collection', 'Create Collection', 'From Collection List');
        });

    }

    $scope.createCollectionModal = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $('#createCollectionModal').modal('toggle');
      $scope.newCollectionName = '';
    };

    $scope.createCollection = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      newCollection({ name: $scope.newCollectionName, user: User.data.id }, function () {
        $('#createCollectionModal').modal('hide');
      });
    };

    $scope.$on('stateChange', function() {
        console.log('[stateChange in collectionsController]');
        console.log(BroadcastService.message.type);
        console.log(BroadcastService.message.data);
        switch (BroadcastService.message.type) {
            case 'deleteCollection':
                Collection.delete({id: BroadcastService.message.data.id}, function(data, headers){
                    BroadcastService.prepForBroadcast({
                        type: 'collectionUpdate',
                        data: {}
                    });
                });
                break;
            case 'searchPoint':
                Collection.delete({id: BroadcastService.message.data.id}, function(data, headers){
                    BroadcastService.prepForBroadcast({
                        type: 'collectionUpdate',
                        data: {}
                    });
                    // $scope.user = CurrentUser.get(function(data) {
                });
                break;
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
            case 'viewingPointSearchResults':
                if (typeof BroadcastService.message.data.searchInput != 'undefined'
                    && BroadcastService.message.data.searchInput != -1
                    && $scope.searchInput != BroadcastService.message.data.searchInput) {
                    $scope.searchInput = BroadcastService.message.data.searchInput;
                    searchCollectionPoints($scope.searchInput);
                }
                break;
            case 'viewingCollectionList':
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
            case 'pointChangeCollection':
                reduceCollectionPointLength();
                break;
        }

    });
}]);
