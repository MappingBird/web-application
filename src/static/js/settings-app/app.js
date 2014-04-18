// HTTP solution from
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
var SettingsApp = angular.module('SettingsApp', ['SettingsApp.services', 'ngCookies', 'ngSanitize', 'ui.bootstrap'], function($httpProvider, $dialogProvider) {
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

SettingsApp.run(function($http, $cookies) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
});

/**
    Overall page controller
 */
SettingsApp.controller('mainController', function($scope, $timeout, Presets, BroadcastService, User, UserResource, CurrentUser) {

    $scope.id = '';
    $scope.isLoggedIn = false;
    $scope.email = '';
    $scope.old_password = '';
    $scope.new_password = '';
    $scope.confirm_password = '';
    $scope.errorPasswordTooShort = false;
    $scope.errorOldPasswordIncorrect = false;
    $scope.errorNewPasswordsNoMatch = false;
    $scope.errorOldPasswordNewPasswordSame = false;
    $scope.passwordChanged = false;

    $scope.checkInput = function($event) {

        $scope.errorPasswordTooShort = false;
        $scope.errorOldPasswordIncorrect = false;
        $scope.errorNewPasswordsNoMatch = false;
        $scope.errorOldPasswordNewPasswordSame = false;

        console.log('checkInput');

        if ($scope.old_password.length >= 6) {

            // TODO: verify old password is correct
            if ($scope.old_password != $scope.new_password) {

                if ($scope.new_password.length >=6) {

                    // new passwords match?
                    if ($scope.new_password != $scope.confirm_password) {
                        $scope.errorNewPasswordsNoMatch = true;
                    } else {
                        // they match, change password
                        changePassword();
                    }

                } else {
                    $scope.errorPasswordTooShort = true;
                }

            // old password and new password are the same
            } else {

                $scope.errorOldPasswordNewPasswordSame = true;

            }

        } else {
            $scope.errorOldPasswordIncorrect = true;
        }

    };

    var changePassword = function() {

        console.log('changePassword');

        var user = {
            email: $scope.email,
            password: $scope.new_password
        };

        UserResource.update(user, function(data, headers) {
            $scope.passwordChanged = true;
        });

    };

    // check to see if this is a generated user
    // if generated user, update this user id with new info
    var user = CurrentUser.get(function(data) {

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {


            // is registered "legit" user
            // show error?
            if (!/@gu.mappingbird.com/.test(data.email)) {

                $scope.isLoggedIn = true;
                // user exists
                $scope.id = data.id;
                $scope.email = data.email;

            // migrate generated user
            } else {

                // generated email - redirect to app page
                $window.location.href = '/static/app.html';

            }


        } else {

            // not logged in, redirect to home page
            $window.location.href = '/';

        }

    });


});

