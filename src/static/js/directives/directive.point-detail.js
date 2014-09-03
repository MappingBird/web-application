/**
 * MappingBird Directive
 * Point Detail
 */
directives.directive('pointDetail', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/mb-app/partials/point_detail.html',
        replace: false
    };
});