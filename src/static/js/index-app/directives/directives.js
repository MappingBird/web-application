// general repeat event
var directives = angular.module('IndexApp.directives', []);

directives.directive("buttonHref", [ '$compile', function($compile) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs ) {
            element.on('click', function() {
                window.location.href = attrs['href'];
            });
        }
    }
}]);