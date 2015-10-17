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
            scope.today = (new Date()).getDay() - 1;
            scope.toggleOpenDayDisplay = function ($event) {
                console.log("click toggleOpenDayDisplay")
                $event.preventDefault();
                $event.stopPropagation();
                scope.inlineDisplay = !scope.inlineDisplay;
            };
        }
    };
}]);