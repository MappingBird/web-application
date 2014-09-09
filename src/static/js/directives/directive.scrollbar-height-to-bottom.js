/**
 * MappingBird Directive
 * Scrollbar Height to Bottom
 */
directives.directive('scrollbarHeightToBottom', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var height;

            // DIRTY DIRTY HACK
            // but in the interest of time...
            height = $('body').height() - 300;

            $element.css('max-height', height + 'px');

        }
    };
});