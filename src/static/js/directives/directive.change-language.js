/**
 * MappingBird Directive
 * change Language
 */
mappingbird.directives.directive('changeLanguage', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$element', '$attrs', '$cookieStore', '$window', function($scope, $element, $attrs, $cookieStore, $window) {

            var lang = $attrs.changeLanguage;
            $element[0].onclick = function (e) {
              e.preventDefault();
              // Setting a cookie
              document.cookie = 'lang=' + lang;
              $cookieStore.put('lang', lang);

              // reload the page
              $window.location.reload();
            };
        }]
    };
});
