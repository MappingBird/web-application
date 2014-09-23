mappingbird.IndexApp = angular.module('IndexApp', ['Initialization', 'ui.router']);

// Routing
mappingbird.IndexApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    // states
    $stateProvider
        .state('gettingStarted', {
            url: '/how-it-works',
            template: '<span></span>',
            controller: ['$scope', '$location', function($scope, $location) {

                // TODO: dirty hack... :(
                var top = $('#how-it-works').offset().top;
                $(document.body).animate({scrollTop: top}, 1000);

            }]
        })
        ;

    // fallback
    //$urlRouterProvider.otherwise("/");

}]);

/**
    Overall page controller
 */
mappingbird.IndexApp.controller('userController', ['$scope', '$cookies', '$http', '$resource', '$window', 'User', 'UserResource', 'Presets', 'BroadcastService', 'CurrentUser', 'UserLogout', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogout) {


    $scope.isRegisteredUser = true;
    $scope.user = CurrentUser.get(function(data) {

        console.log('user data');
        console.log(data);

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {

            console.log('user logged in');

            User.data.isLoggedIn = true;
            $scope.isLoggedIn = true;

            if (typeof data.email !== 'undefined') {
                User.data.emailAddress = data.email;
                User.data.isRegisteredUser = !/@gu.mappingbird.com/.test(data.email);
                User.data.id = data.id;

                $scope.isRegisteredUser = User.data.isRegisteredUser;
            }

            // send event
            BroadcastService.prepForBroadcast({
                type: 'userLoaded',
                data: { userId: data.id }
            });

            // change location
            // unless there's 'stay' in the query string
            if (!/(\?stay=1$|\/how-it-works$)/.test(location.href)) {
                $window.location.href = '/static/app.html';
            }


        } else {

            console.log('user not logged in');
            $scope.isLoggedIn = false;

        }


    });

    $scope.logout = function() {

        UserLogout.get(function(data, headers) {

            delete $cookies['sessionid'];
            $window.location.href = "/static/index.html";

        });

    };

}]);

