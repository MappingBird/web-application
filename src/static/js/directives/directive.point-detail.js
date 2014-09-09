/**
 * MappingBird Directive
 * Point Detail
 */
directives.directive('pointDetail', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/partials/point_detail.html',
        replace: false
    };
});