/**
 * MappingBird Directive
 * Search Box
 */
directives.directive('searchBox', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {

            $scope.$on('stateChange', function () {
                if (typeof BroadcastService.message == 'object'
                    && BroadcastService.message.type == 'noSearchQuery') {
                    $($element).attr({'placeholder': 'Name or address of a place'});
                }
            } );
        }
    };
});