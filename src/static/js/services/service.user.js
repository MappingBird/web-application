/**
 * MappingBird Service
 * User
 */
services.factory('User', function(){
    return {
        data: {
            id: 0,
            emailAddress: '',
            isRegisteredUser: false,
            collections: [],
            isLoggedIn: false
        }
    };
});