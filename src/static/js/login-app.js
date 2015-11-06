mappingbird.LoginApp = angular.module('LoginApp', ['Initialization']);

/**
    Overall page controller
 */
mappingbird.LoginApp.controller('mainController', ['$scope', '$timeout', 'Presets', 'BroadcastService', 'User', 'UserResource', 'UserLogin', 'Analytics', function($scope, $timeout, Presets, BroadcastService, User, UserResource, UserLogin, Analytics) {
    $scope.email = '';
    $scope.password = '';
    $scope.errorInvalidLogin = false;

    $scope.checkInput = function($event) {

        console.log('checkInput');

        if ($scope.email.length > 0) {

            if ($scope.password.length >= 6) {

                $scope.attemptLogin();

            } else {
                $scope.errorInvalidLogin = true;

                // google analytics
                Analytics.registerEvent('Login', 'Login failed - password too short', 'Login Page');

            }

        } else {
            // TODO: email address checking regexp
            $scope.errorInvalidLogin = true;

            // google analytics
            Analytics.registerEvent('Login', 'Login failed - no email address', 'Login Page');

        }

    };

    $scope.attemptLogin = function() {

        console.log('attemptLogin');

        var userCredentials = {
            email: $scope.email,
            password: $scope.password
        };

        UserLogin.local.save(userCredentials, function(data, headers) {

            if (typeof data !== 'undefined'
                && typeof data.user !== 'undefined'
                && typeof data.user.email !== 'undefined'
                && typeof data.user.id !==  'undefined') {

                window.location.href="/app";
            } else {
                $scope.errorInvalidLogin = true;

                // google analytics
                Analytics.registerEvent('Login', 'Login failed - invalid credentials', 'Login Page');
            }
        });

    };

    $scope.attemptFBLogin = function() {

        console.log('attemptFBLogin');

        FB.login(function(response) {

            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                
                var userCredentials = {
                    accessToken: response.authResponse.accessToken,
                    signedRequest: response.authResponse.accessToken,
                    userID: response.authResponse.userID
                };

                UserLogin.facebook.save(userCredentials, function(data, headers) {

                    if (typeof data !== 'undefined') {
                        window.location.href="/app";
                    } else {
                        $scope.errorInvalidLogin = true;

                        // google analytics
                        Analytics.registerEvent('Login', 'Login failed - invalid credentials', 'Login Page');
                    }
                });

            } else {
                //user hit cancel button
                console.log('User cancelled login or did not fully authorize.');

            }

        }, {
            scope: 'public_profile,email'
        });

    };

}]);
