/**
 * MappingBird Directive
 * Massive Alert
 */
directives.directive('massiveAlert', function(BroadcastService, $window) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs, BroadcastService, $window) {

            $scope.hasNoSearchQuery;
            $scope.hasCollectionsSaved;

            $scope.$on('stateChange', function() {
                if (typeof BroadcastService.message == 'object') {

                    switch (BroadcastService.message.type) {
                        case 'noSearchQuery':
                            console.log('noSearchQuery + massiveAlert');
                            console.log(BroadcastService.message.data);
                            console.log($scope.hasCollectionsSaved);

                            $scope.hasNoSearchQuery = true;

                            if ($scope.hasCollectionsSaved === true && !/(^http:\/\/www.mappingbird.com|^http:\/\/localhost)/.test(document.referrer)) {
                                $element.addClass('visible');
                            } else {
                                $element.removeClass('visible');
                            }
                            break;
                        case 'collectionsLoaded':
                            if (BroadcastService.message.data.hasCollectionsSaved === false && !/(^http:\/\/www.mappingbird.com|^http:\/\/localhost)/.test(document.referrer)) {
                                $scope.hasCollectionsSaved = false;
                                console.log('noCollectionsSaved + massiveAlert');
                                console.log(BroadcastService.message.data);
                                console.log($scope.hasCollectionsSaved);

                                if (!BroadcastService.message.data.isRegisteredUser) {
                                    if ($scope.hasNoSearchQuery) {
                                        $element.addClass('visible');
                                    } else {
                                        $element.removeClass('visible');
                                    }
                                } else {
                                    $element.addClass('visible');
                                }
                            } else {
                                $scope.hasCollectionsSaved = true;
                                $element.removeClass('visible');
                            }

                            break;
                        case 'newSearch':
                        default:
                            $element.removeClass('visible');
                            break;
                    }
                }
            });
        },
        replace: false
    };
});