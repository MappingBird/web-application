/**
 * Save page interaction
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

    // DEPENDENCY: PINGISMO (currently hard-coded in save.php)

    var base_url = PINGISMO.baseUrl,
        parse_url = base_url + 'scraper',
        maps_url = base_url + 'maps',
        search = decodeURIComponent(getParameterByName('search')),
        url = decodeURIComponent(getParameterByName('url')),
        places_api_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCixleTjJLXPDQs9AIG6-18Gvx1X6M7If8&sensor=false&query=' + search + '&callback=?',
        mapZoom = 13,
        service,
        request,
        callback,
        loc,
        photo_array = null, //photo.js
        lastWidth = 0, // photo.js
        picPhotoObj = $(".photo-obj"), // photo.js
        picContainer = $(".ref-context-img"), // photo.js
        picRow //photo.js
        ;

    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/901144
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

        var regexS = "[\\?&]" + name + "=([^&#]*)",
            regex = new RegExp(regexS),
            results = regex.exec(window.location.search);

        return (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    // photo.js
    function processPhotos(photos, lastWidth)
    {
        console.log('processPhotos');
        // get row width - this is fixed.
        var w = picRow.innerWidth(),
            h = 180, // initial height - effectively the maximum height +/- 10%;
            border = 2, // margin width
            ws = [],
            baseLine = 0, // total number of images appearing in all previous rows
            rowNum = 0,
            n = 0, // index for photo's id
            c = 0, // number of images appearing in this row
            numPhotos = photos.length,
            d_row,
            photo
            ;

        // store relative widths of all images (scaled to match estimate height above)
        $.each(photos, function(key, val) {
            var wt = parseInt(val.width, 10),
                ht = parseInt(val.height, 10);
            if( ht != h ) { wt = Math.floor(wt * (h / ht)); }
            ws.push(wt);
        });

        while (baseLine < numPhotos)
        {
            rowNum++;

            // add a div to contain images
            d_row = $("<div class='picrow'></div>");
            picContainer.append(d_row);
            d_row.width(lastWidth);
            d_row.empty();

            c = 0;

            // total width of images in this row - including margins
            var tw = 0;

            var currIndex = 0;

            // calculate width of images and number of images to view in this row.
            while( tw * 1.1 < w)
            {
                currIndex = baseLine + c++;
                if(currIndex == numPhotos) {break;}
                tw += ws[currIndex] + border * 2;
            }
            // Ratio of actual width of row to total width of images to be used.
            var r = w / tw;
            // image number being processed
            var i = 0;
            // reset total width to be total width of processed images
            tw = 0;

            // new height is not original height * ratio
            var ht = (Math.floor(h * r) < (h * 1.1))?Math.floor(h * r) : (h * 1.1);
            while( i < c )
            {
                photo = photos[baseLine + i];
                // Calculate new width based on ratio
                if(photo){
                    var wt = (ht == (h * 1.1))?Math.floor(parseInt(photos[baseLine + i].width,10) * (h * 1.1) / parseInt(photos[baseLine + i].height, 10)):Math.floor(ws[baseLine + i] * r);

                    // add to total width with margins
                    tw += wt + border * 2;
                    // Create image, set src, width, height and margin
                    (function() {
                        var url = photo.src;
                        var img_id = n + "_" +url.substring(url.lastIndexOf("/")+1);
                        n++;
                        var a = $('<a></a>', {class: "is-selected",href: "#", id: img_id}).css("margin", border + "px");
                        var img = $('<img/>',{class: "photo", src: url, width: wt});

                        // Add Check icon on top of selected image
                        var span = $('<span></span>', {class: "select-img"});

                        var currentIndex = baseLine + i;
                        a.bind('click', selectImg);
                        a.append(img);
                        d_row.append(a);

                        $(img).load(function(){
                            // Adjust the position of Check icon
                            var img_position = $(img).position(),
                                span_left = img_position.left + ($(img).width()/2) - 23,
                                span_top = img_position.top + ($(img).height()/2) - 23;

                            span.css("left", span_left + "px").css("top", span_top + "px");
                            a.append(span);
                        });



                    })();
                }
                i++;
            }

            if(photo){
                // if total width is slightly smaller than 
                // actual div width then add 1 to each 
                // photo width till they match
                i = 0;
                while( tw < w )
                {
                    var img1 = d_row.find("img:nth-child(" + (i + 1) + ")");
                    $(img1).each(function(){
                        $(this).width($(this).width() + 1);
                    });
                    i = (i + 1) % c;
                    tw++;
                }
                // if total width is slightly bigger than 
                // actual div width then subtract 1 from each 
                // photo width till they match
                i = 0;
                while( tw > w )
                {
                    var img2 = d_row.find("img:nth-child(" + (i + 1) + ")");
                    $(img2).each(function(){
                        $(this).width($(this).width() - 1);
                    });
                    i = (i + 1) % c;
                    tw--;
                }
            }

            // set row height to actual height + margins
            d_row.height(ht + border * 2);

            baseLine += c;
        }
    }

    function selectImg(){
        var imgID = this.id;
        var span = document.getElementById("check_" + imgID);

        if($(this).hasClass("is-selected")){
            $(this).removeClass("is-selected");
            $(span).hide();
        }
        else{
            $(this).addClass("is-selected");
            $(span).show();
        }

        return false;
    }

    // KnockoutJs ViewModel
    function AppViewModel() {

        var self = this;

        self.title = ko.observable('');
        self.text = ko.observable('');
        self.url = ko.observable(url);
        self.images = ko.observableArray([]);
        self.placeIcon = ko.observable('');
        self.placeName = ko.observable('');
        self.placeAddress = ko.observable('');
        self.placePhone = ko.observable('');
        self.placeCoords = ko.observable('');
        self.placeSearchResults = ko.observableArray([]);
        self.searchResultSelected = ko.observable(false);
        self.showMapPin = ko.observable(false);
        self.userId = ko.observable('');
        self.userEmailAddress = ko.observable('');
        self.isRegisteredUser = ko.observable(false);
        self.collections = ko.observableArray([]);
        self.activeCollectionId = ko.observable('');
        self.activeCollectionName = ko.observable('');
        self.newCollectionName = ko.observable('');
        self.activeMapCollectionId = ko.observable('');
        self.saving = ko.observable(true);
        self.savedSuccessfully = ko.observable(false);
        self.viewingMap = ko.observable(false);
        self.newMapName = ko.observable('');
        self.noSearchKeyword = ko.observable(false);
        self.activeLocation = ko.observable(0);

        self.activeMapCollectionId.subscribe(function(){
            console.log('activeMapCollectionId changed: ' + self.activeMapCollectionId());
            console.log('updateMapCollection');
            if (self.activeMapCollectionId() !== '' && self.activeMapCollectionId() !== 'undefined') {

                $.get(base_url + 'blapi/collection/?id=' + self.activeMapCollectionId(), function(data){
                    console.log(data);
                    self.activeCollectionName(data.name);
                });

            }
        });

        self.savedSuccessfully.subscribe(function(newValue){
            if (newValue === true) {
                $("#save-panel").animate({top: ($(".save-panel-body").height() + 250)*(-1) + 'px'}, 300, function(){
                    $(".save-panel-title").hide();
                    $(".save-panel-body > *").hide();
                    $(".save-panel-footer").hide();
                    $("#save-panel").hide();
                    $("#save-successful-msg").show();
                    $(".save-panel-body").css("border-radius", "3px").height(400);
                    $("#save-panel").css("top", "20px");
                    $("#save-panel").show( "drop",{ direction: "up" }, 500 );
                });
            }
        });

        self.clearRefData = function() {

            self.title('');
            self.text('');
            self.url('');
            self.images.removeAll();
            $("#thumb-gallery").remove();

            return;

        };

        self.setSavePanelHeight = function(){
            $(".save-panel-body").height($("#map-wrapper").height() - 220 );
            // $("#my-map-list").height($("#map-wrapper").height() - 125 );
            //$("#my-map-list").height("100%");
            vHideTop = ($("#my-map-ribbon").height() + 250)*(-1);
            $("#my-map-list").css("top", vHideTop + "px");
            $("#my-map-ribbon").css("top", vHideTop + "px");
            $("#save-panel").show( "drop",{ direction: "up" }, 500 ); //display save panel
        };

        function placesSearchCallback (data, textStatus){
            console.log('placesSearchCallback');
            console.log(data);
            var len = data.length,
                d;
            if (typeof data !== 'undefined' && len > 0) {
                console.log('there are search results');
                console.log(len);
                // if there's only one result, select search result
                if (len === 1) {
                    len--;
                    d = {
                        placeIcon: data[len].icon,
                        placeName: data[len].name,
                        placeAddress: data[len].formatted_address,
                        placePhone: '',
                        placeCoords: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng(),
                        placeLat: data[len].geometry.location.lat(),
                        placeLng: data[len].geometry.location.lng()
                    };
                    self.setSavePanelHeight();
                    self.savePin(d);
                // otherwise display results in multi-result page
                } else {
                    while (len--) {
                        self.placeSearchResults.unshift({
                            index: len,
                            placeIcon: data[len].icon,
                            placeName: data[len].name,
                            placeAddress: data[len].formatted_address,
                            placePhone: '',
                            placeCoords: data[len].geometry.location.lat() + ',' + data[len].geometry.location.lng(),
                            placeLat: data[len].geometry.location.lat(),
                            placeLng: data[len].geometry.location.lng()
                        });
                    }
                    self.setSavePanelHeight();

                    // default to show first result
                    self.showLocation(self.placeSearchResults()[0]);

                    $("#my-map-list").css("top", vHideTop + 250 + "px");
                    //$("#my-map-ribbon").css("top", vHideTop + 250 + "px");
                    //show loading first and then display the search result
                    $(".loading").fadeOut(50, function(){ $(".save-search-result ul").fadeIn(500);});
                }

            } else {
                // TODO: show error
                console.log('no places search result');
                $('#my-map-list .loading').fadeOut(function(){
                    $('#my-map-list .no-results').fadeIn();
                });
            }
        }

        self.savePin = function(data){
            // set map point
            self.selectSearchResult(data);
            self.showLocation(data);

            // show save panel
            $(".save-search-cover").animate({left: '1px'}, 500, function(){
                $(".save-search-result").hide();
                $(".save-search-cover").fadeOut();
            });
        };

        self.cancelPin = function(data){
            // show save panel
            $(".save-search-cover").fadeIn(function(){
                $(".save-search-result").show();
                $(".save-search-cover").animate({left: '401px'}, 500);
            });
        };

        self.showLocation = function(data){
            console.log('showLocation');
            var overlay,
                lat = data.placeLat,
                lng = data.placeLng,
                myLatLng = new google.maps.LatLng(lat, lng),
                mapOptions = {
                    zoom: mapZoom,
                    center: myLatLng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    panControl: true,
                    streetViewControl: false,
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.LARGE
                    },
                    scaleControl: false
                },
                map = new google.maps.Map($('#map')[0], mapOptions),
                bounds = data.bounds,
                srcImage = self.images()[0].src,
                marker;

            self.activeLocation(data.index);

            overlay = new BucketListSmallOverlay(bounds, mapZoom, srcImage, map, myLatLng, data.placeName, data.placeAddress, data.placePhone);

            marker = new BucketListPin(bounds, mapZoom, srcImage, map, myLatLng);

        };

        self.selectSearchResult = function(data) {
            console.log('selectSearchResult');
            // TODO:
            self.placeIcon(data.placeIcon);
            self.placeName(data.placeName);
            self.placeAddress(data.placeAddress);
            self.placeCoords(data.placeCoords);

            var center = new google.maps.LatLng(25.035061,121.53986), // default coords
                map = $('#map')[0],
                gMap = new google.maps.Map(map, {
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    center: center,
                    zoom: mapZoom
                }),
                lat = data.placeLat, // data[0].geometry.location.lat(),
                lng = data.placeLng, // data[0].geometry.location.lng(),
                latlng = new google.maps.LatLng(lat, lng);
                //,bounds = results[0].geometry.bounds;

            // update map
            gMap.setCenter(latlng);
            var marker = new google.maps.Marker({
                map: gMap,
                position: latlng
            });
        };

        self.updateUser = function(){
            console.log('updateUser');
            if (self.userId() !== '') {

                $.get(base_url + 'blapi/user', { id: self.userId()}, function(data){
                    console.log(data);
                    self.collections(data.collections);

                    // is this a generated or registered user
                    if (typeof data.email_address !== 'undefined') {
                        if (!/@gu.pingismo.com/.test(data.email_address)) {
                            self.userEmailAddress(data.email_address);
                            self.isRegisteredUser(true);
                        }
                    }

                });



            }

        };

        self.getMap = function () {
            // search has already been converted into a string
            // by the decodeURIComponent call
            console.log('getMap');
            if (search !== 'undefined' && search.length > 0) {

                console.log('search term: ' + search);

                $('#searchterm').val(search);

                var center = new google.maps.LatLng(25.035061,121.53986), // default coords
                    map = $('#map')[0],
                    geocoder = new google.maps.Geocoder(),
                    gMap = new google.maps.Map(map, {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center: center,
                        zoom: mapZoom
                    }),
                    placesRequest = new google.maps.places.PlacesService(gMap);

                placesRequest.textSearch({ query: [search]}, placesSearchCallback);

            } else {
                self.noSearchKeyword(true);
            }

        };


        self.saveCollection = function(callback){
            console.log('saveCollection');
            $.ajax({
                url: base_url + 'blapi/collection',
                type: "post",
                contentType: "application/json",
                data: JSON.stringify({
                    name: self.activeCollectionName(),
                    user_id: self.userId()
                }),
                success: function(response, textStatus, jqXHR) {
                    console.log("collection saved");
                    self.collections.unshift(response);
                    self.activeCollectionId(response.id);
                    self.updateUser();

                    if (typeof callback !== 'undefined') {
                        callback();
                    }
                }
            });
        };

        self.saveNewCollection = function(callback){
            console.log('saveNewCollection');
            self.activeCollectionName(self.newCollectionName());
            self.saveCollection(function(){
                $('#modal-add-new-map').modal('hide');

                if (typeof callback === 'function') {
                    callback();
                }
            });
            return false;
        };

        self.savePoint = function(callback){
            console.log('savePoint');

            $('#save-btn').attr('disabled', 'disabled');

            $.ajax({
                url: base_url + 'blapi/point',
                type: "post",
                contentType: "application/json",
                data: JSON.stringify({
                    title: self.title(),
                    url: self.url(),
                    text: self.text(),
                    place_name: self.placeName(),
                    place_address: self.placeAddress(),
                    place_phone: self.placePhone(),
                    gps_coords: self.placeCoords(),
                    collection_id: self.activeCollectionId()
                }),
                success: function(response, textStatus, jqXHR) {
                    console.log(response);

                    var pointId;

                    if (typeof response.id !== 'undefined') {
                        pointId = response.id;

                        self.activeMapCollectionId(self.activeCollectionId());

                        // save images
                        var imgs = $('.is-selected > .photo'),
                            i = imgs.length;

                        if (i > 0) {
                            while (i--) {
                                (function(index){
                                    $.ajax({
                                        url: base_url + 'blapi/image',
                                        type: "post",
                                        contentType: "application/json",
                                        data: JSON.stringify({
                                            url: $(imgs[index]).attr('src'),
                                            thumb_path: '', // TODO: create and upload thumbnails, maybe batch?
                                            point_id: pointId
                                        }),
                                        success: function(response, textStatus, jqXHR) {
                                            console.log(response);
                                            console.log(index);

                                            if (index === 0) {
                                                self.savedSuccessfully(true);
                                                if (typeof callback === 'function') {
                                                    callback();
                                                }
                                            }
                                        }
                                    });
                                }(i));
                            }
                        }
                    }
                }
            });
        };

        self.save = function(){

            console.log('save');

            if (self.newCollectionName() === "" && self.activeCollectionId() === "") {
                // show error
                console.log('no collection added or selected');

                return false;
            }

            // check for user cookie first
            if (!self.userId()) {
                console.log('create user');
            // if not, generate a user
                $.ajax({
                    url: base_url + 'blapi/user',
                    type: "post",
                    contentType: "application/json",
                    data: JSON.stringify({}),
                    success: function(response, textStatus, jqXHR) {
                        console.log(response);

                        self.userId(response.id);
                        self.userEmailAddress(response.id);

                        self.collections([]);

                        $.cookie('bkl_user', self.userId());

                        // save collection
                        self.saveNewCollection(self.savePoint);
                    }
                });
            } else {

                if (self.collections().length === 0) {
                    // save collection
                    self.saveNewCollection(self.savePoint);
                } else {
                    // save point
                    self.savePoint();
                }

                
            }

            return false;

        };

        self.closeWindow = function() {

            window.close();

        };

        self.showMap = function() {

            window.location.href = maps_url;

            return false;

        };

        // check if logged in
        if ($.cookie('bkl_user')) {
            console.log('user logged in');
            console.log('user id: ' + $.cookie('bkl_user'));
            self.userId($.cookie('bkl_user'));
            self.updateUser();
        }

        // show page results
        if (typeof url !== 'undefined' && url.length > 0) { // && csrftoken.length > 0
            console.log('call scraper');
            $.post(parse_url, { 'url': url }, function(response){

                function parseImages () {
                    console.log('last image load');
                    // auto-sizing
                    photo_array = picPhotoObj.children();
                    lastWidth = $("#picstest").innerWidth() - 15;
                    picRow = $(".picrow");
                    picRow.width(lastWidth);
                    processPhotos(photo_array, lastWidth);
                }

                if (typeof response !=='undefined') {
                    console.log(response);
                    if (typeof response.title !== 'undefined') {
                        self.title(response.title);
                    }

                    if (typeof response.text !== 'undefined') {
                        self.text(response.text);
                    }

                    if (typeof response.images !== 'undefined') {
                        var i = response.images,
                            len = i.length,
                            len2 = i.length,
                            x = 0;

                        if (len > 0) {
                            while (len--) {
                                self.images.push({'src': i[len]});
                            }

                            $('.photo-obj img').error(function(){
                                $(this).remove();
                                if (++x == len2) {
                                    parseImages();
                                }
                            }).load(function(){
                                if (++x == len2) {
                                    parseImages();
                                }
                            });

                        }

                    }

                    // update map
                    self.getMap();
                }
            });
        }

        // for inline editing
        $('.editable').editable(function(value, settings){
                var varName = $(this).data('bind').split(':')[1];
                varName = $.trim(varName);
                self[varName](value);
            }, {
            cancel    : 'Cancel',
            submit    : 'OK',
            tooltip   : 'Click to edit...'
        });

        $('.editable_area').editable(function(value, settings){
                var varName = $(this).data('bind').split(':')[1];
                varName = $.trim(varName);
                self[varName](value);
            }, {
            type      : 'textarea',
            cancel    : 'Cancel',
            submit    : 'OK',
            tooltip   : 'Click to edit...'
        });

    }

    // Activates knockout.js
    ko.applyBindings(new AppViewModel());

})(jQuery);
