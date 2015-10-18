/**
 * MappingBird Directive
 * Open Day
 */
mappingbird.directives.directive('openDay', ['BroadcastService', '$timeout', '$sce', function(BroadcastService, $timeout, $sce) {
    return {
        restrict: 'A',
        templateUrl: '/static/partials/open_day.html',
        link: function (scope, element, attrs) {

            // how to get pointCtrl??

            scope.inlineDisplay = false;
            // scope.todayOpen = [(new Date()).getDay()].time;
            scope.today = (function(){
                var day = (new Date()).getDay();

                if (day == 0) {
                    // sunday
                    day = 6
                } else {
                    // mon - sat
                    day--
                }

                return day
            })();
            scope.toggleOpenDayDisplay = function ($event) {
                console.log("click toggleOpenDayDisplay")
                $event.preventDefault();
                $event.stopPropagation();
                scope.inlineDisplay = !scope.inlineDisplay;
            };
        }
    };
}]);