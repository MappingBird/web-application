// HTTP solution from
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
var IndexApp = angular.module('IndexApp', ['IndexApp.services', 'IndexApp.directives', 'ngCookies', 'ngSanitize', 'ui.bootstrap', 'ui.router'], function($httpProvider, $dialogProvider) {
    // angular bootstrap
    //$dialogProvider.options({dialogFade: true});

    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data)
    {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj)
        {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for(name in obj)
            {
                value = obj[name];

                if(value instanceof Array)
                {
                    for(i=0; i<value.length; ++i)
                    {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value instanceof Object)
                {
                    for(subName in value)
                    {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value !== undefined && value !== null)
                {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});

// Routing
IndexApp.config(function($stateProvider, $urlRouterProvider) {

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

});

IndexApp.run(function($http, $cookies) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
});

/**
    Overall page controller
 */
IndexApp.controller('userController', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogout) {

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
                if (!/@gu.pingismo.com/.test(data.email)) {
                    User.data.isRegisteredUser = true;
                } else {
                    User.data.isRegisteredUser = false;
                }
                User.data.id = data.id;
            }

            // send event
            BroadcastService.prepForBroadcast({
                type: 'userLoaded',
                data: { userId: data.id }
            });

            // change location
            // unless there's 'stay' in the query string
            if (!/stay=1/.test(location.search)) {
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

});

