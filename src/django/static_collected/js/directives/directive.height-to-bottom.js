/**
 * MappingBird Directive
 * Height to Bottom
 */
mappingbird.directives.directive('heightToBottom', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$element', '$attrs', 'BroadcastService', function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 0, // pixels
                outer_parent = $element.parent().parent().parent(),
                offset,
                padding,
                footer,
                height;

            // DIRTY DIRTY HACK
            // but in the interest of time...
            height = $('body').height() - 305;

            $element.css('height', height + 'px');

            /*
            $scope.$on('stateChange', function () {
                if (BroadcastService.message.type == 'pointLoaded') {

                    offset = $element.position();
                    padding = parseInt($element.parent().parent().css('padding-bottom').replace('px', ''), 10);
                    footer = $(outer_parent.find('.pin-content-footer')[0]).height();
                    height = outer_parent.height() - offset.top - padding - footer - tolerance;

                    $element.css('height', height + 'px');
                }
            } );
            */
        }]
    };
});