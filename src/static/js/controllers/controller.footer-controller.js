mappingbird.FooterApp = angular.module('FooterApp', ['Initialization']);
mappingbird.FooterApp.controller('footerController', ['$scope', '$cookies', '$http', '$resource', '$window', 'User', 'UserResource', 'Presets', 'BroadcastService', 'CurrentUser', 'UserLogin', 'UserLogout', 'Token', 'TagResource', 'Analytics', 'Utility', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogin, UserLogout, Token, TagResource, Analytics, Utility) {

    $scope.changeLanguage = function (e, lang) {

        e.preventDefault();
        
        // Setting a cookie
        $cookies.put('lang', lang);

        // reload the page
        $window.location.reload();
    };
}]);
