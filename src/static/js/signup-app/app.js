// HTTP solution from
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
var SignupApp = angular.module('SignupApp', ['SignupApp.services', 'ngCookies', 'ngSanitize', 'ui.bootstrap'], function($httpProvider, $dialogProvider) {
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

SignupApp.run(function($http, $cookies) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
});

/**
    Overall page controller
 */
SignupApp.controller('mainController', function($scope, $timeout, Presets, BroadcastService, User, UserResource, CurrentUser) {

    $scope.id = '';
    $scope.email = '';
    $scope.password = '';
    $scope.errorEmailAlreadyRegistered = false;
    $scope.errorEmailRequired = false;
    $scope.errorPasswordTooShort = false;
    $scope.accountCreated = false;

    $scope.checkInput = function($event) {

        console.log('checkInput');

        if ($scope.email.length > 0) {

            if ($scope.password.length >= 6) {

                // check to see if this is a generated user
                // if generated user, update this user id with new info
                var user = CurrentUser.get(function(data) {

                    if(typeof data.id !== 'undefined'
                        && typeof data.email !== 'undefined') {
                        // user exists
                        $scope.id = data.id;

                        // is registered "legit" user
                        // show error?
                        if (!/@gu.mappingbird.com/.test(data.email)) {

                            // TODO: email
                            // ask Derek about scenario here

                            // google analytics
                            if (typeof ga != 'undefined') {
                                ga('send', 'event', 'Signup', 'Signup failed - user already exists', 'Signup Page');
                            }

                        // migrate generated user
                        } else {

                            $scope.migrateGeneratedUser();

                        }


                    } else {

                        // else add a new user
                        $scope.addUser();

                    }

                });

            } else {
                $scope.errorPasswordTooShort = true;

                // google analytics
                if (typeof ga != 'undefined') {
                    ga('send', 'event', 'Signup', 'Signup failed - password too short', 'Signup Page');
                }
            }

        } else {
            // TODO: email address checking regexp
            $scope.errorEmailRequired = true;

            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Signup', 'Signup failed - invalid email address', 'Signup Page');
            }

        }

    };

    $scope.addUser = function() {

        console.log('addUser');

        var newUser = {
            email: $scope.email,
            password: $scope.password
        };

        UserResource.save(newUser, function(data, headers) {
            $scope.accountCreated = true;
            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Signup', 'Signup success - new user created', 'Signup Page');
            }
        });

    };

    $scope.migrateGeneratedUser = function() {

        console.log('migrateGeneratedUser');

        var migratedUser = {
            id: $scope.id,
            email: $scope.email,
            password: $scope.password
        };

        UserResource.update(migratedUser, function(data, headers) {
            $scope.accountCreated = true;

            // google analytics
            if (typeof ga != 'undefined') {
                ga('send', 'event', 'Signup', 'Signup success - migrate generated user', 'Signup Page');
            }
        });

    };

});

