/**
 * MappingBird Directive
 * On Repeat Done
 */
mappingbird.directives.directive("onRepeatDone", [ '$compile', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs ) {
            if (scope.$last) {
                console.log('onRepeatDone last');
                scope.$emit(attrs["onRepeatDone"] || "repeat_done", element);
            }
        }
    }
}]);