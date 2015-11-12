/**
 * MappingBird Directive
 * P Alert
 */
mappingbird.directives.directive('pAlert', ['BroadcastService', '$timeout', '$sce', function(BroadcastService, $timeout, $sce) {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $elem.find('.close').on('click', function(e) {
                $scope.alertActive = false;
            });
        },
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', '$sce', function($scope, $element, $attrs, BroadcastService, $sce) {

            $scope.alertActive = false; // hide alert
            // $scope.alertActive = true; // show alert

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object') {
                    switch (BroadcastService.message.type) {
                        case 'pointSaveComplete':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('A new place was saved to <strong>' + BroadcastService.message.data.savedCollectionName + '</strong> successfully. :)');
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $scope.alertActive = false;
                            }, 3000);
                            break;

                        case 'pointDeleted':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml(gettext('Point deleted successfully.'));
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $scope.alertActive = false;
                            }, 3000);
                            break;

                        case 'requestDeleteCollection':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('<strong>' + BroadcastService.message.data.collectionToBeDeletedName + '</strong> is being deleted.');
                            $scope.actionMessage = 'Undo';

                            var deleteCollectionId = BroadcastService.message.data.collectionToBeDeletedId;

                            console.log('requestDelectCollection countdown ID: ' + deleteCollectionId);
                            var timer = $timeout(function(){
                                $scope.alertActive = false;
                                BroadcastService.prepForBroadcast({
                                    type: 'deleteCollection',
                                    data: {
                                        id: deleteCollectionId
                                    }
                                });
                            }, 4000);

                            $element.find('.alert-action').on('click', function(e){
                                e.preventDefault();
                                e.stopPropagation();
                                $timeout.cancel(timer);
                                $(this).off('click');
                                $scope.alertActive = false;
                            });

                            break;

                        case 'pointChangeCollectionComplete':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('Point was changed to <strong>' + BroadcastService.message.data.savedCollectionName + '</strong> successfully. :)');

                            $timeout(function(){
                                $scope.alertActive = false;
                            }, 3000);
                            break;
                    }
                }
            });

        }],
        replace: false
    };
}]);
