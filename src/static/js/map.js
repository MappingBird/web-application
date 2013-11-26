(function($){


    var parse_url = '/scraper',
        search = getParameterByName('search'),
        url = decodeURIComponent(getParameterByName('url')),
        places_api_url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?key=AIzaSyCixleTjJLXPDQs9AIG6-18Gvx1X6M7If8&sensor=false&query=' + search + '&callback=?',
        service,
        request,
        callback,
        loc;

    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values/901144
    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        
        var regexS = "[\\?&]" + name + "=([^&#]*)",
            regex = new RegExp(regexS),
            results = regex.exec(window.location.search);

        return (results === null) ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    // KnockoutJs ViewModel
    function AppViewModel() {
        
        var self = this;
            // csrftoken = $.cookie('csrftoken');
        
        self.title = ko.observable('');
        self.text = ko.observable('');
        self.url = ko.observable(url);
        self.images = ko.observableArray([]);
        self.placeIcon = ko.observable('');
        self.placeName = ko.observable('');
        self.placeAddress = ko.observable('');
        self.placePhone = ko.observable('');

        self.clearRefData = function() {

            self.title('');
            self.text('');
            self.url('');
            self.images.removeAll();
            $("#thumb-gallery").remove();

            return;

        };

        function placesSearchCallback (data, textStatus){
            console.log(data);
            if (typeof data !== 'undefined' && data.length > 0) {
                self.placeIcon(data[0].icon);
                self.placeName(data[0].name);
                self.placeAddress(data[0].formatted_address);
            }
        }

        self.getMap = function () {

            if (typeof search !== 'undefined' && search.length > 0) {

                $('#searchterm').val(search);

                var center = new google.maps.LatLng(25.035061,121.53986),
                    map = $('#map')[0],
                    geocoder = new google.maps.Geocoder(),
                    gMap = new google.maps.Map(map, {
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        center: center,
                        zoom: 13
                    });

                // update observables with places result
                /*
                $.getJSON(places_api_url, function(data, textStatus, jqXHR){
                    if (typeof data.status !== 'undefined' && data.status == 'OK' && typeof data.results !== 'undefined' && data.results.length > 0) {
                        self.placeIcon = results[0].icon;
                        self.placeName = results[0].name;
                        self.placeAddress = results[0].formatted_address;
                    }
                });
*/

                var placesRequest = new google.maps.places.PlacesService(gMap);
                placesRequest.textSearch({ query: [search]}, placesSearchCallback);

                // update map
                geocoder.geocode( {'address': search}, function(results, status) {
                    console.log(status);
                    if (status == google.maps.GeocoderStatus.OK) {

                        var searchLoc = results[0].geometry.location,
                            lat = results[0].geometry.location.lat(),
                            lng = results[0].geometry.location.lng(),
                            latlng = new google.maps.LatLng(lat, lng),
                            bounds = results[0].geometry.bounds;

                        gMap.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            map: gMap,
                            position: results[0].geometry.location
                        });
                    }
                });

            }
            // display map

        }
         
        // show page results
        if (typeof url !== 'undefined' && url.length > 0) { // && csrftoken.length > 0
            $.post(parse_url, { 'url': url }, function(response){
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
                            len = i.length;
                        if (len > 0) {
                            while (len--) {
                                self.images.push({'src': i[len]});
                            }

                            $('#thumb-gallery').tilesGallery({
                                width: $('#thumb-gallery').width(),
                                height: 600
                            });

                        }
                        
                    }

                    // update map
                    self.getMap();
                }
            });
        }

    }

    // Activates knockout.js
    ko.applyBindings(new AppViewModel());

})(jQuery);
