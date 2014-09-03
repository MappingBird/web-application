/**
 * MappingBird Directive
 * Save Panel
 */
directives.directive('savePanel', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/mb-app/partials/save_panel.html',
        replace: false
    };
});