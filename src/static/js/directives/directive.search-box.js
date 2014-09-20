/**
 * MappingBird Directive
 * Search Box
 */
mappingbird.directives.directive('searchBox', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', function($scope, $element, $attrs, BroadcastService) {

            $scope.$on('stateChange', function () {
                if (typeof BroadcastService.message == 'object'
                    && BroadcastService.message.type == 'noSearchQuery') {
                    $($element).attr({'placeholder': 'Name or address of a place'});
                }
            } );
        }]
    };
});