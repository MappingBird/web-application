/**
 * MappingBird Directive
 * Collection List View
 */
directives.directive('collectionListView', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/mb-app/partials/collection_list_view.html',
        replace: false
    };
});