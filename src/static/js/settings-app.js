mappingbird.SettingsApp = angular.module('SettingsApp', ['Initialization']);

/**
    Overall page controller
 */
mappingbird.SettingsApp.controller('mainController', ['$scope', '$timeout', 'Presets', 'BroadcastService', 'User', 'UserResource', 'CurrentUser', 'UserLogin', 'UserLogout', '$http', '$cookies', '$window', 'Analytics', function($scope, $timeout, Presets, BroadcastService, User, UserResource, CurrentUser, UserLogin, UserLogout, $http, $cookies, $window, Analytics) {
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

    $scope.logout = function($event) {

        $event.preventDefault();
        $event.stopPropagation();

        UserLogout.get(function(data, headers) {

            delete $cookies['sessionid'];
            $window.location.href = '/';

        });

    };

    $scope.checkInput = function($event) {

        $scope.errorPasswordTooShort = false;
        $scope.errorOldPasswordIncorrect = false;
        $scope.errorNewPasswordsNoMatch = false;
        $scope.errorOldPasswordNewPasswordSame = false;
        $scope.errorNewPasswordsNoMatch = false;

        console.log('checkInput');

        if ($scope.old_password.length >= 6) {

            // TODO: verify old password is correct

            var userCredentials = {
                email: $scope.email,
                password: $scope.old_password
            };

            UserLogin.save(userCredentials, function(data, headers) {

                /**
                 * IMPORTANT NOTE
                 * The new CSRF Token has to be extracted 'manually' from
                 * the cookie object instead of using the angular $cookies
                 * service because the service doesn't seem to be updating
                 * the cookie values dynamically
                 */
                var token_pos = document.cookie.indexOf('csrftoken=') + 'csrftoken='.length,
                    new_csrf_token;

                if (token_pos > -1) {
                    new_csrf_token = document.cookie.substring(token_pos);
                    $http.defaults.headers.post['X-CSRFToken'] = new_csrf_token;
                }

                if (typeof data !== 'undefined'
                    && typeof data.user !== 'undefined'
                    && typeof data.user.email !== 'undefined'
                    && typeof data.user.id !==  'undefined') {

                    if ($scope.old_password != $scope.new_password) {

                        if ($scope.new_password.length >=6) {

                            // new passwords match?
                            if ($scope.new_password != $scope.confirm_password) {
                                $scope.errorNewPasswordsNoMatch = true;
                            } else {
                                // they match, change password
                                changePassword();
                                Analytics.registerEvent('Password', 'Change password success', 'Settings Page');
                            }

                        } else {
                            $scope.errorPasswordTooShort = true;

                            Analytics.registerEvent('Password', 'Change password error - password too short', 'Settings Page');
                        }

                    // old password and new password are the same
                    } else {

                        $scope.errorOldPasswordNewPasswordSame = true;

                        Analytics.registerEvent('Password', 'Change password error - new password same as old password', 'Settings Page');

                    }

                } else {
                    $scope.errorOldPasswordIncorrect = true;

                    Analytics.registerEvent('Password', 'Change password error - old password incorrect', 'Settings Page');
                }
            });

        } else {
            $scope.errorOldPasswordIncorrect = true;

            Analytics.registerEvent('Password', 'Change password error - old password incorrect', 'Settings Page');
        }

    };

    var changePassword = function() {

        console.log('changePassword');

        var user = {
            id: $scope.id,
            email: $scope.email,
            password: $scope.new_password
        };

        UserResource.update(user, function(data, headers) {
            $scope.old_password = "";
            $scope.new_password = "";
            $scope.confirm_password = "";
            $scope.passwordChanged = true;
        });

    };

    // check to see if this is a generated user
    // if generated user, update this user id with new info
    var user = CurrentUser.get(function(data) {

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {


            $scope.isLoggedIn = true;
            $scope.id = data.id;
            $scope.email = data.email;

            // is registered "legit" user
            // show error?
            // if (!/@gu.mappingbird.com/.test(data.email)) {
            //
            //     $scope.isLoggedIn = true;
            //     // user exists
            //     $scope.id = data.id;
            //     $scope.email = data.email;
            //
            // // migrate generated user
            // } else {
            //
            //     // generated email - redirect to app page
            //     $window.location.href = '/app';
            //
            // }


        } else {

            // not logged in, redirect to home page
            $window.location.href = '/';

        }

    });


}]);
