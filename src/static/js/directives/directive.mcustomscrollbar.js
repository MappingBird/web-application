/**
 * MappingBird Directive
 * mCustomScrollbar
 */
mappingbird.directives.directive('mCustomScrollbar', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {

            var scrollbarAttrs = scope.$eval(attrs.mCustomScrollbar),
                triggerEvent = scrollbarAttrs.triggerEvent;

            if (triggerEvent) {
              scope.$on(triggerEvent, function () {
                  console.log('trigger mCustomScrollbar');
                  if (element.attr('parent-height')) {
                      element.css('height', element.attr('parent-height') + 'px');
                  }
              });
            }

            // trigger mCustomScrollbar directly
            if (!$(element).hasClass('mCustomScrollbar')) {
                $(element).mCustomScrollbar(scrollbarAttrs);
            }

        }
    };
});
