mappingbird.SignupApp = angular.module('SignupApp', ['ngCookies', 'ngSanitize', 'ui.bootstrap', 'Initialization']);

/**
    Overall page controller
 */
mappingbird.SignupApp.controller('mainController', ['$scope', '$timeout', 'Presets', 'BroadcastService', 'User', 'UserResource', 'CurrentUser', '$http', 'Analytics', function($scope, $timeout, Presets, BroadcastService, User, UserResource, CurrentUser, $http, Analytics) {

    $scope.id = '';
    $scope.email = '';
    $scope.password = '';
    $scope.errorEmailAlreadyRegistered = false;
    $scope.errorEmailRequired = false;
    $scope.errorPasswordTooShort = false;
    $scope.accountCreated = false;

    $scope.checkInput = function($event) {

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
                            Analytics.registerEvent('Signup', 'Signup failed - user already exists', 'Signup Page');

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
                Analytics.registerEvent('Signup', 'Signup failed - password too short', 'Signup Page');
            }

        } else {
            // TODO: email address checking regexp
            $scope.errorEmailRequired = true;

            // google analytics
            Analytics.registerEvent('Signup', 'Signup failed - invalid email address', 'Signup Page');

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
            Analytics.registerEvent('Signup', 'Signup success - new user created', 'Signup Page');
        });

    };

    $scope.migrateGeneratedUser = function() {

        console.log('migrateGeneratedUser');

        var migratedUser = {
            id: $scope.id,
            email: $scope.email,
            password: $scope.password
        };

        var request = $http({
            method: "PUT",
            url: "/api/users/" + $scope.id,
            data: JSON.stringify(migratedUser)
        }).success(function() {
            $scope.accountCreated = true;

            // google analytics
            Analytics.registerEvent('Signup', 'Signup success - migrate generated user', 'Signup Page');
        });

    };

}]);
