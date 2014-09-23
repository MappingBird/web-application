mappingbird.SaveApp.controller('userController', ['$scope', '$cookies', '$http', '$resource', '$window', 'User', 'UserResource', 'Presets', 'BroadcastService', 'CurrentUser', 'UserLogin', 'UserLogout', 'Token', 'TagResource', 'Analytics', 'Utility', function($scope, $cookies, $http, $resource, $window, User, UserResource, Presets, BroadcastService, CurrentUser, UserLogin, UserLogout, Token, TagResource, Analytics, Utility) {

    $scope.user = CurrentUser.get(function(data) {

        console.log('user data');
        console.log(data);

        if(typeof data.id !== 'undefined'
            && typeof data.email !== 'undefined') {

            console.log('user logged in');

            User.data.emailAddress = data.email;
            User.data.id = data.id;

            if (!/@gu.mappingbird.com$/.test(data.email)) {
                User.data.isRegisteredUser = true;
                User.data.isLoggedIn = true;
                $scope.isLoggedIn = true;
            } else {
                User.data.isRegisteredUser = false;
            }

            $scope.tags = TagResource.getTags(function(data) {
                var l = data.length,
                    v = [];

                while (l--) {
                    if (data[l].name) {
                        v.unshift({ 'text' : data[l].name});
                    }
                }

                User.data.tags = v;

            });

            // send event
            BroadcastService.prepForBroadcast({
                type: 'userLoaded',
                data: { userId: data.id }
            });

        } else {

            console.log('user not logged in');

            // even though they are generated and can save points
            // they are not technically logged in
            $scope.isLoggedIn = false;

            var time = new Date().getTime(),
                userCredentials = {
                    email: Utility.getRandomInt(0,100) + time + '@gu.mappingbird.com',
                    password: 'pword' + Utility.getRandomInt(0,1000000000)
                };

            function generateUser () {

                // generate user
                UserResource.save(userCredentials, function(data, headers) {

                    // login this generated user
                    UserLogin.save(userCredentials, function(data, headers) {
                        if (typeof data !== 'undefined'
                            && typeof data.user !== 'undefined'
                            && typeof data.user.email !== 'undefined'
                            && typeof data.user.id !==  'undefined') {

                            /**
                                We've decided to directly extract the csrftoken
                                from document.cookie because Angular can't detect
                                the updated csrftoken cookie value. Possibly b/c
                                of the fact there are multiple "Set-Cookie" headers
                                in the response.
                             */

                            console.log('UserLogin token');
                            var re = /csrftoken=([a-zA-Z0-9]*)/g,
                                cookieArray = document.cookie.match(re),
                                csrftoken;

                            if (re.test(document.cookie) && cookieArray.length == 1) {

                                csrftoken = cookieArray[0].replace("csrftoken=", "");

                                $http.defaults.headers.common['X-CSRFToken'] = csrftoken;

                                User.data.emailAddress = data.user.email;
                                User.data.id = data.user.id;

                                if (!/@gu.mappingbird.com$/.test(data.user.email)) {
                                    User.data.isRegisteredUser = true;
                                    User.data.isLoggedIn = true;
                                    $scope.isLoggedIn = true;
                                } else {
                                    User.data.isRegisteredUser = false;
                                }

                                BroadcastService.prepForBroadcast({
                                    type: 'userLoaded',
                                    data: { userId: data.user.id }
                                });

                            } else {
                                // TODO: multiple or no csrftoken error
                            }

                        } else {
                            // TODO: login error
                            console.log('Login error with generated user');
                        }
                    });

                });

            }

            if ($cookies.csrftoken) {
                generateUser();
            } else {
                Token.get(function(data, headers) {

                    $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;

                    generateUser();

                });
            }

        }

    });

    $scope.goToSignUpPage = function() {
        $window.location.href = '/static/signup.html';
    };

    $scope.logout = function($event) {

        $event.preventDefault();
        $event.stopPropagation();

        UserLogout.get(function(data, headers) {

            // google analytics
            Analytics.registerEvent('Account', 'Logged Out', 'Account Menu');

            delete $cookies['sessionid'];
            $window.location.href = "/static/index.html";

        });

    };

}]);