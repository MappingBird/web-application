/**
 * MappingBird Directive
 * Collection List
 */
mappingbird.directives.directive('collectionList', function() {
    return {
        restrict: 'A',
        scope: false,
        templateUrl: '/static/js/partials/collection_list.html',
        replace: false
    };
});