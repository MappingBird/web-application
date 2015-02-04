/**
 * MappingBird Directive
 * P Alert
 */
mappingbird.directives.directive('pAlert', ['BroadcastService', '$timeout', '$sce', function(BroadcastService, $timeout, $sce) {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $elem.find('.close').on('click', function(e) {
                $elem.hide();
            });
        },
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', '$sce', function($scope, $element, $attrs, BroadcastService, $sce) {

            $scope.alertActive = false;

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object') {
                    switch (BroadcastService.message.type) {
                        case 'pointSaveComplete':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('A new place was saved to <strong>' + BroadcastService.message.data.savedCollectionName + '</strong> successfully. :)');
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $element.hide();
                            }, 3000);
                            break;

                        case 'pointDeleted':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('Point deleted successfully.');
                            $scope.actionMessage = '';

                            $timeout(function(){
                                $element.hide();
                            }, 3000);
                            break;

                        case 'requestDeleteCollection':

                            $scope.alertActive = true;
                            $scope.message = $sce.trustAsHtml('<strong>' + BroadcastService.message.data.collectionToBeDeletedName + '</strong> is being deleted.');
                            $scope.actionMessage = 'Undo';

                            var deleteCollectionId = BroadcastService.message.data.collectionToBeDeletedId;

                            console.log('requestDelectCollection countdown ID: ' + deleteCollectionId);
                            var timer = $timeout(function(){
                                $element.hide();
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
                                $element.hide();
                            });

                            break;

                    }
                }
            });

        }],
        replace: false
    };
}]);