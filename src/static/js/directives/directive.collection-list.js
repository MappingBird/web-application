/**
 * MappingBird Directive
 * Collection List
 */
directives.directive('collectionList', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/mb-app/partials/collection_list.html',
        replace: false
    };
});