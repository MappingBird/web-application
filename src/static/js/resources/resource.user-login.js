/**
 * MappingBird Service
 * User Login resource
 */
mappingbird.resources.factory('UserLogin', ['$resource', function($resource) {

    return {
    	local: $resource('/api/user/login'),
    	facebook: $resource('/api/user/fb_login')
    }

}]);