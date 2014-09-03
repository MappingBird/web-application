/**
 * MappingBird Directive
 * New Window
 */
directives.directive('newWindow', function() {
    return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
            $elem.on('click', function(e) {
                e.preventDefault();
                window.open($attrs['href'], '_blank');
            });
        },
        replace: false
    };
});