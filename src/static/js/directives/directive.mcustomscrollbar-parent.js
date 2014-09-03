/**
 * MappingBird Directive
 * mCustomScrollbar parent
 */
directives.directive('mCustomScrollbarParent', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: function($scope, $element, $attrs, BroadcastService) {
            // DIRTY HACK
            var tolerance = 68; // pixels
            var height = $($('body')[0]).height() - $($('header')[0]).height() - $($('.collection-wrapper')[0]).height() - $($('footer')[0]).height() - tolerance;
            console.log('mCustomScrollbarParent height: ' + height);
            $element.css('height', height + 'px');
            $element.find('[m-custom-scrollbar]').attr('parent-height', height);
        }
    };
});