/**
 * Maps page interaction
 * @param  {[type]}   $){                                                                                                                               var      base_url                 =       PINGISMO.baseUrl [description]
 * @param  {[type]}   parse_url              =             base_url                                         +              'scraper'     [description]
 * @param  {[type]}   search                 =             decodeURIComponent(getParameterByName('search')) [description]
 * @param  {[type]}   url                    =             decodeURIComponent(getParameterByName('url'))    [description]
 * @param  {[type]}   places_api_url         =             'https:                                                                                                                         service [description]
 * @param  {[type]}   request                [description]
 * @param  {Function} callback               [description]
 * @param  {[type]}   loc;                                                                                                                               function getParameterByName(name) {                                                                                                name          =        name.replace(/[\[]/ [description]
 * @param  {[type]}   "\\[").replace(/[\]]/ [description]
 * @param  {[type]}   "\\]");                                                                                                                                                                                                               var regexS                                      =             "[\?&]" +                   name          + "=([^&#]*)" [description]
 * @param  {[type]}   regex                  =             new                                              RegExp(regexS) [description]
 * @param  {[type]}   results                =             regex.exec(window.location.search);                                                                                             return  (results         ===           null) ? "" :   decodeURIComponent(results[1].replace(/\+/g [description]
 * @param  {[type]}   "                      ")            [description]
 * @return {[type]}                          [description]
 */
(function($){

    // DEPENDENCY: PINGISMO (currently hard-coded in maps.php)

    var base_url = PINGISMO.baseUrl,
        parse_url = base_url + 'scraper',
        //places_api_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCixleTjJLXPDQs9AIG6-18Gvx1X6M7If8&sensor=false&query=' + search + '&callback=?',
        mapZoom = 13,
        map = $('#map')[0],
        geocoder = new google.maps.Geocoder(),
        gMap = new google.maps.Map(map, {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: new google.maps.LatLng(0, 0),
            zoom: mapZoom
        }),
        service,
        request,
        callback,
        loc;

    // KnockoutJs ViewModel
    function MapsViewModel() {

        var self = this,
            timeAgoUpdater,
            overlayArray = [],
            markerArray = [];

        self.title = ko.observable('');
        self.text = ko.observable('');
        self.images = ko.observableArray([]);
        self.placeIcon = ko.observable('');
        self.placeName = ko.observable('');
        self.placeAddress = ko.observable('');
        self.placePhone = ko.observable('');
        self.placeCoords = ko.observable('');
        self.userId = ko.observable('');
        self.userEmailAddress = ko.observable('');
        self.isRegisteredUser = ko.observable(false);
        self.collections = ko.observableArray();
        self.activeCollectionId = ko.observable('');
        self.activeCollectionName = ko.observable('');
        self.newCollectionName = ko.observable('');
        self.activeMapCollectionId = ko.observable('');
        self.activeMapPoints = ko.observableArray([]);
        self.activeMapPoint = ko.observable('');
        self.activeMapPointId = ko.observable('');
        self.activeMapPointUrl = ko.observable('');
        self.saving = ko.observable(true);
        self.savedSuccessfully = ko.observable(false);
        self.viewingMap = ko.observable(true);
        self.newMapName = ko.observable('');
        self.dontShowTutorialDialog = ko.observable(false);

        self.setMapToPoint = function (data) {

            var lat = data.gps_coords.split(',')[0],
                lng = data.gps_coords.split(',')[1],
                point = new google.maps.LatLng(lat, lng),
                marker,
                bounds;

                gMap.setCenter(point);

                bounds = gMap.boundsAt(mapZoom);
                srcImage = (data.images.length > 0) ? data.images[0].url : null;

                // clear overlays
                if (overlayArray && overlayArray.length > 0) {
                    for (var x in overlayArray) {
                        if (overlayArray[x].getMap && overlayArray[x].getMap()) {
                            overlayArray[x].setMap(null);
                        }
                    }
                    overlayArray.length = 0;
                }

                overlayArray.push(new BucketListLargeOverlay(bounds, mapZoom, srcImage, gMap, point, data.place_name, data.place_address, '', data, overlayArray));

        };

        self.setMapAllPoints = function() {
            console.log('setMapAllPoints');
            //  Create a new viewpoint bound
            var len = self.activeMapPoints().length,
                bounds = new google.maps.LatLngBounds(),
                coords = [],
                center,
                srcImage,
                ll,
                c,
                p;

            // clear markers
            if (markerArray && markerArray.length > 0) {
                for (var x in markerArray) {
                    if (markerArray[x].getMap && markerArray[x].getMap()) {
                        markerArray[x].setMap(null);
                    }
                }
                markerArray.length = 0;
            }

            //  get bounds
            for (var i = 0; i < len; i++) {
                //  And increase the bounds to take this point
                coords = self.activeMapPoints()[i].gps_coords.split(',');
                ll = new google.maps.LatLng(coords[0], coords[1]);
                bounds.extend (ll);
            }

            center = bounds.getCenter();

            //  Fit these bounds to the map
            gMap.fitBounds (bounds);

            // add the markers for each point
            for (var y in self.activeMapPoints()) {
                srcImage = null;
                c = self.activeMapPoints()[y].gps_coords.split(',');
                if (self.activeMapPoints()[y].images.length > 0) {
                    srcImage = self.activeMapPoints()[y].images[0].url;
                }
                p = (function(index){ return self.activeMapPoints()[index];})(y);
                markerArray.push(new BucketListPin(bounds, mapZoom, srcImage, gMap, new google.maps.LatLng(c[0],c[1])), p, markerArray);
            }

        };

        self.updateActivePointId = function(data){
            console.log('updateActivePointId');
            self.activeMapPointId(data.id);
        };

        self.activeMapPointId.subscribe(function(){
            console.log('activeMapPointId changed: ' + self.activeMapPointId());
            if (self.activeMapPointId()) {

                $.get(base_url + 'blapi/point/?id=' + self.activeMapPointId(), function(data){
                    console.log(data);

                    self.activeMapPointUrl(data.url);
                    self.placeName(data.place_name);
                    self.placeAddress(data.place_address);

                    var ll = data.gps_coords.split(',');
                    // update map
                    self.setMapToPoint(data);
                });

            }
        });

        self.activeMapPoints.subscribe(function(){
            console.log('activeMapPoints changed');
            if (self.activeMapPoints().length > 0) {
                self.setMapAllPoints();
                self.activeMapPointId(self.activeMapPoints()[0].id);
            } else {
                self.activeMapPointId(null);
            }
        });

        self.activeMapCollectionId.subscribe(function(){
            console.log('activeMapCollectionId changed: ' + self.activeMapCollectionId());

            if (self.activeMapCollectionId() !== '' && typeof self.activeMapCollectionId() !== 'undefined') {
                console.log('updateMapCollection');
                $.get(base_url + 'blapi/collection/?id=' + self.activeMapCollectionId(), function(data){
                    console.log(data);
                    if (data.points.length >0) {
                        self.activeMapPoints(data.points);
                    } else {
                        // no collections = no points
                        self.activeMapPoints([]);
                    }

                    // default open most recently created point
                    /*
                    if (typeof data.most_recent_created_point !== 'undefined' && typeof data.most_recent_created_point.id !== 'undefined') {
                        self.activeMapPointId(data.most_recent_created_point.id);
                    }
                    */

                    if (typeof timeAgoUpdater !== 'undefined') {
                        clearInterval(timeAgoUpdater);
                    }
                    timeAgoUpdater = window.setInterval(function(){
                        $('.created').text(function(){
                            return moment.unix($(this).attr('datetime')).fromNow(true);
                        });
                    }, 5000);
                });

            }
        });

        self.collections.subscribe(function(){
            console.log('collections changed');
            // chose one collection to be the default one
            // currently just choosing the first one
            if (self.collections().length > 0) {
                self.activeMapCollectionId(self.collections()[0].id);
            }
        }, false);

        self.clearRefData = function() {

            self.title('');
            self.text('');
            self.images.removeAll();
            $("#thumb-gallery").remove();

            return;

        };

        self.dontShowTutorialDialog.subscribe(function(newValue){
            if (newValue == true) {
                $.cookie('dontShowTutorialDialog', true);
            } else {
                $.removeCookie('dontShowTutorialDialog');
            }
        }, false);

        self.setDontShowTutorialDialog = function() {
            self.dontShowTutorialDialog(true);
            self.dismissTutorialDialog();
        };

        self.showTutorialDialog = function(e) {
            $("#MapTip").animate({top:'80px'}, 'slow');
        };

        self.dismissTutorialDialog = function(e) {
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            $("#MapTip").animate({top:'100px'}, 100).animate({top:'-500px'}, 350);
        };

        self.showMapList = function(){
            var vListH = $("#map-wrapper").height() - 125;
            var vListT = vListH * (-1);
            var vRibbonH = $("#map-wrapper").height() - 100;
            $("#my-map-list").css("top", vListT + "px");
            $("#my-map-list").show();
            $("#my-map-list").animate({height: vListH, top: 0}, 300);
            $("#my-map-ribbon").animate({height: vRibbonH, top: 0}, 300);
        };

        self.hideMapList = function(){
            var vListT = $("#my-map-list").height() * (-1);
            var vRibbonH = $("#my-map-footer").height() - 78;
            $("#my-map-ribbon").animate({height: vRibbonH}, 300);
            $("#my-map-list").animate({top: vListT}, 300, function(){$(this).hide();});
        };

        self.updateUser = function(callback){
            console.log('updateUser');
            if (self.userId() !== '') {

                $.get(base_url + 'blapi/user', { id: self.userId()}, function(data){
                    console.log(data);
                    self.collections(data.collections);

                    if (data.collections.length === 0) {
                        console.log('no collections');
                        // hide map ribbon
                        $('#my-map-list,#my-map-ribbon').hide();

                        // show tutorial link (if they haven't)
                        if (!$.cookie('dontShowTutorialDialog')) {
                            self.showTutorialDialog();
                        }
                    } else {
                        console.log('there are collections');
                        // default open most recently modified collection
                        if (typeof data.most_recent_modified_collection !== 'undefined' && typeof data.most_recent_modified_collection.collection_id !== 'undefined') {
                            self.activeMapCollectionId(data.most_recent_modified_collection.collection_id);
                        }
                    }

                    // is this a generated or registered user
                    if (typeof data.email_address !== 'undefined') {
                        if (!/@gu.pingismo.com/.test(data.email_address)) {
                            self.userEmailAddress(data.email_address);
                            self.isRegisteredUser(true);
                        }
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }
                });

            }

        };

        /**
         * First load the identity
         * If logged in
         *     Pull their User info, collections
         * If not
         *     [TODO]
         * Default to show most recently created (modified?) collection
         * Then pull the latest point from that collection
         */
        // check if logged in
        if ($.cookie('bkl_user')) {
            console.log('user logged in');
            self.userId($.cookie('bkl_user'));
            self.updateUser();
        } else {
            // TODO: not logged in
        }

        // UI magic
        $("#my-map-list").hover(function(){
            $("#my-map-list").toggleClass('hover');
        });
        $("#my-map-ribbon").mouseover(function(){
            if($("#my-map-list").is(':hidden'))
                self.showMapList();
        });
        $("#my-map-list").mouseout(function(){
            if($("#my-map-list").is(':visible') && $("#my-map-list").hasClass('hover') == false)
                setTimeout(self.hideMapList, 500);
        });

    }

    // Activates knockout.js
    ko.applyBindings(new MapsViewModel());

})(jQuery);
