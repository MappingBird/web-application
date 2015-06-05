mappingbird.SignupApp = angular.module('SignupApp', ['Initialization']);

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

      $scope.errorEmailAlreadyRegistered = false;
      $scope.errorEmailRequired = false;
      $scope.errorPasswordTooShort = false;

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
                        // if (!/@gu.mappingbird.com/.test(data.email)) {
                        //
                        //     // TODO: email
                        //     // ask Derek about scenario here
                        //
                        //     // google analytics
                        //     Analytics.registerEvent('Signup', 'Signup failed - user already exists', 'Signup Page');
                        //
                        // // migrate generated user
                        // } else {
                        //
                        //     $scope.migrateGeneratedUser();
                        //
                        // }


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

            // hack for stupid footer - Footer covers major buttons on signup complete page (#213)
            $('footer').css('position', 'relative');
        }, function (res) {
            if (res.data) {
              console.log('Signup error:', res);
              // res.data.email[0] message
              $scope.errorEmailAlreadyRegistered = true;
            }
        });

    };

    // $scope.migrateGeneratedUser = function() {
    //
    //     console.log('migrateGeneratedUser');
    //
    //     var migratedUser = {
    //         id: $scope.id,
    //         email: $scope.email,
    //         password: $scope.password
    //     };
    //
    //     var request = $http({
    //         method: "PUT",
    //         url: "/api/users/" + $scope.id,
    //         data: JSON.stringify(migratedUser)
    //     }).success(function() {
    //         $scope.accountCreated = true;
    //
    //         // google analytics
    //         Analytics.registerEvent('Signup', 'Signup success - migrate generated user', 'Signup Page');
    //     });
    //
    // };

    $scope.installExtension = function() {
        $scope.dark = true;
        $scope.extensionTooltip = true;
        chrome.webstore.install('https://chrome.google.com/webstore/detail/ipjijcfmgfehpiiigjgjdgkldeligkfo', function() {
            $scope.dark = true;
            $scope.extensionTooltip = false;
            $scope.extensionModal = true;
            $scope.$digest();
        }, function(reason) {
            $scope.dark = false;
            $scope.extensionTooltip = false;
            $scope.extensionModal = false;
            $scope.$digest();
        });
    };
}]);
