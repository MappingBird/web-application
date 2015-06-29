/**
    Overall page controller
 */
mappingbird.SaveApp.controller('savePageController',['$scope', '$timeout', 'Presets', 'BroadcastService', 'Collections', 'CollectionsByUserResource', 'User', function($scope, $timeout, Presets, BroadcastService, Collections, CollectionsByUserResource, User) {

    $scope.collectionsByUser = [];

    // page layout defaults
    $scope.mapVisible = true;
    $scope.saveMode = false;
    $scope.collectionsMode = false;
    $scope.mapMode = false;
    $scope.pointMode = false;
    $scope.listMode = false;

    function changeMapParams () {
       // $('#map').data('transitioning', true);
    }

    // full map mode, no collections
    // function fullMapViewingMode () {
    //     changeMapParams();
    //     $scope.mapMode = true;
    //     $scope.saveMode = false;
    //     $scope.collectionsMode = false;
    //     $scope.showCollectionList = false;
    //     $scope.showSavePanel = false;
    //     $scope.showPointDetailPanel = false;
    //     $scope.fullTallMap = true;
    //     $scope.fullMap = false;
    //     $scope.mapRetracted = false;
    //     $scope.semiRetractedMap = false;
    //     $scope.halfMap = false;
    //
    //     $scope.listMode = false;
    // }

    // map viewing mode
    function mapViewingMode () {
        changeMapParams();
        $scope.mapMode = true;
        $scope.saveMode = false;
        $scope.collectionsMode = false;
        $scope.showCollectionList = true;
        $scope.showSavePanel = false;
        $scope.showPointDetailPanel = false;
        $scope.fullTallMap = false;
        $scope.fullMap = true;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = false;
        $scope.halfMap = false;

        $scope.listMode = false;
    }

    // search results mode
    function searchResultsMode () {
        changeMapParams();
        $scope.mapMode = false;
        $scope.saveMode = true;
        $scope.collectionsMode = false;
        $scope.showCollectionList = false;
        $scope.showSavePanel = true;
        $scope.showPointDetailPanel = false;
        $scope.fullTallMap = false;
        $scope.fullMap = false;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = true;
        $scope.halfMap = false;

        $scope.listMode = false;
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
        $scope.fullTallMap = false;
        $scope.fullMap = false;
        $scope.mapRetracted = true;
        $scope.semiRetractedMap = false;
        $scope.halfMap = false;

        $scope.listMode = false;
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
        $scope.fullTallMap = false;
        $scope.fullMap = false;
        $scope.mapRetracted = true;
        $scope.semiRetractedMap = false;
        $scope.halfMap = true;

        $scope.listMode = false;
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
        $scope.fullTallMap = false;
        $scope.fullMap = false;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = true;
        $scope.halfMap = false;

        // $scope.listMode = false; remain the same
    }

    // close collection View
    function closeCollectionView () {
        $scope.collectionsMode = false;
    }

    // list viewing mode
    function listViewingMode() {
        changeMapParams();
        $scope.mapMode = false;
        $scope.saveMode = false;
        $scope.collectionsMode = false;
        // $scope.showCollectionList = true; remain the same
        $scope.showSavePanel = false;
        $scope.showPointDetailPanel = false;
        $scope.fullTallMap = false;
        $scope.fullMap = false;
        $scope.mapRetracted = false;
        $scope.semiRetractedMap = true;
        $scope.halfMap = false;

        $scope.listMode = true;
    }

    // close list View
    function closeListView () {
        $scope.listMode = false;
    }

    function reloadCollections(isFirstTime) {

        var iFT = isFirstTime ? true : false,
            hasCollectionsSaved;

        // collections
        $scope.collectionsByUser = CollectionsByUserResource.get({user_id: User.data.id}, function(data) {
            console.log('reloadCollections');

            // if there are collections saved
            if (data.collections.length > 0) {

                Collections.collections = data.collections;
                if (typeof data.most_recent_modified_collection != 'undefined') {
                    Collections.mostRecentModifiedCollection = data.most_recent_modified_collection;
                };

                console.log(Collections);

                hasCollectionsSaved = true;

            // no collections saved
            } else {

                hasCollectionsSaved = false;

            }

            // broadcast
            BroadcastService.prepForBroadcast({
                type: 'collectionsLoaded',
                data: {
                    'isFirstTime': iFT,
                    'hasCollectionsSaved': hasCollectionsSaved,
                    'isRegisteredUser' : User.data.isRegisteredUser
                }
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
            case 'viewingCollectionList':
                listViewingMode();
                break;
            case 'closeCollectionListView':
                closeListView();
                break;
            case 'viewSearchResults':
            case 'pointViewingMode':
                searchResultsMode();
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
            case 'closeCollections':
                closeCollectionView();
                break;
            case 'userLoaded':
                if (Collections.collections && Collections.collections.length == 0) {
                    reloadCollections(true);
                }
                break;
            case 'collectionUpdate':
                reloadCollections();
                break;
        }
    });

}]);
