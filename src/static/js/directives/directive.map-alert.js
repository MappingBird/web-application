/**
 * MappingBird Directive
 * Map Alert
 */
directives.directive('mapAlert', function(BroadcastService, $timeout, $sce) {
    return {
        restrict: 'A',
        controller: function($scope, $element, $attrs, BroadcastService, $sce) {

            $scope.mapAlertActive = false;

            $scope.$on('stateChange', function() {

                var p,
                    t,
                    l,
                    w,
                    h,
                    top,
                    left;

                if (typeof BroadcastService.message == 'object') {
                    switch (BroadcastService.message.type) {
                        case 'noSearchResults':

                            p = $('#map').position();
                            t = p.top;
                            l = 425; //p.left;
                            w = $(window).width(); //$('#map').width();
                            h = $('#map').height();
                            top = t + (h/2) - 26.5;
                            left = l + (w/2) - 320;

                            $element.css({
                                'top': top,
                                'left': left
                            });


                            $scope.mapAlertTitle = "Where were you searching for?";
                            $scope.mapAlertMessage = "Provide the name or address of a place in the search bar.";
                            $scope.mapAlertActive = true;
                            $scope.$apply();

                            break;
                        case 'newSearch':
                            $scope.mapAlertTitle = "";
                            $scope.mapAlertMessage = "";
                            $scope.mapAlertActive = false;
                            break;
                    }
                }
            });

        },
        replace: false
    };
});