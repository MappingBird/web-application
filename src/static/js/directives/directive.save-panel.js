/**
 * MappingBird Directive
 * Save Panel
 */
mappingbird.directives.directive('savePanel', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/partials/save_panel.html',
        replace: false
    };
});