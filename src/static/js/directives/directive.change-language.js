/**
 * MappingBird Directive
 * change Language
 */
mappingbird.directives.directive('changeLanguage', function() {
    return {
        restrict: 'A',
        scope: false,
        controller: ['$scope', '$element', '$attrs', '$cookieStore', '$window', '$cookies', function($scope, $element, $attrs, $cookieStore, $window, $cookies) {

            var lang = $attrs.changeLanguage;

            // active view
            if ($cookies.lang === lang) {
              $element.parent().addClass('active');
            } else {
              $element.parent().removeClass('active');
            }

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
