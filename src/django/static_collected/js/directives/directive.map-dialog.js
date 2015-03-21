/**
 * MappingBird Directive
 * Map Dialog
 */
mappingbird.directives.directive('mapDialog', ['BroadcastService', '$window', function(BroadcastService, $window) {
    return {
        restrict: 'A',
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', '$window', function($scope, $element, $attrs, BroadcastService, $window) {

            $scope.mapDialogActive = false;
            $scope.hasNoSearchQuery = false;
            $scope.fromHomePage = /(^http:\/\/www.mappingbird.com|^http:\/\/localhost)/.test($window.location.href);
            $scope.hasCollectionsSaved;

            $scope.$on('stateChange', function() {

                var p,
                    t,
                    l,
                    w,
                    h,
                    top,
                    left,
                    show,
                    noShow;

                show = function() {

                    /*
                    p = $('#map').position();
                    t = p.top;
                    l = p.left;
                    w = $(window).width();
                    h = $('#map').height();
                    top = (t + (h/2) - 175) + 'px';
                    left = 'calc(50% - 180px)';

                    $element.css({
                        'top': top,
                        'left': left
                    });
*/

                    $scope.mapDialogTitle = "You haven't saved any places yet";
                    $scope.mapDialogMessage = "Learn how to save places to MappingBird by following the 'How It Works' tutorial on the homepage.";
                    $scope.mapDialogButtonLabel = "Back to the homepage";
                    $scope.mapDialogAction = function() {
                        $window.location.href = '/static/index.html#/how-it-works';
                    };
                    $scope.mapDialogActive = true;
                };

                noShow = function() {

                    $scope.mapDialogTitle = "";
                    $scope.mapDialogMessage = "";
                    $scope.mapDialogButtonLabel = "";
                    $scope.mapDialogAction = function() {
                        return;
                    };
                    $scope.mapDialogActive = false;
                };

                if (typeof BroadcastService.message == 'object') {
                    switch (BroadcastService.message.type) {
                        case 'collectionsLoaded':
                            if (BroadcastService.message.data.hasCollectionsSaved === false) {
                                $scope.hasCollectionsSaved = false;
                                if ($scope.hasNoSearchQuery) {
                                    console.log('noShow');
                                    noShow();
                                } else {
                                    console.log('show');
                                    show();
                                }
                            } else {
                                $scope.hasCollectionsSaved = true;
                            }
                            break;
                        case 'noSearchQuery':
                            $scope.hasNoSearchQuery = true;
                            if ($scope.hasCollectionsSaved === false) {
                                show();
                            } else {
                                noShow();
                            }
                            break;
                        case 'newSearch':
                        case 'viewSearchResults':
                            console.log($scope.hasNoSearchQuery);
                            noShow();
                            break;
                    }
                }
            });

        }],
        replace: false
    };
}]);