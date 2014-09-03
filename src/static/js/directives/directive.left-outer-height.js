/**
 * MappingBird Directive
 * Left Outer Height
 */
directives.directive('leftOuterHeight', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 80; // pixels
            var height = $($('body')[0]).height() - $($('header')[0]).height() - $($('footer')[0]).height() - tolerance;
            $element.css('height', height + 'px');
        }
    };
});