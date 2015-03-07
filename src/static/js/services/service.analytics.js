/**
 * MappingBird Service
 * Analytics
 */
mappingbird.analytics = angular.module('mappingbird.analytics', [], [function () {
    // load GA
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-60481551-1', 'auto');
    ga('send', 'pageview');

}]);

mappingbird.analytics.factory('Analytics', function(){

    var analytics = {};

    analytics.registerEvent = function(category, action, label, value) {

        if (typeof ga != 'undefined') {

            if (typeof value !== 'undefined') {
                ga('send', 'event', category, action, label, value);
            } else {
                ga('send', 'event', category, action, label);
            }

        }

    };

    return analytics;

});