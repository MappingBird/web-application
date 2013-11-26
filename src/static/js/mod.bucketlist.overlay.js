

function BucketListOverlay() {
    return;
}

BucketListOverlay.prototype = new google.maps.OverlayView();

BucketListOverlay.prototype.onAdd = function() {};

BucketListOverlay.prototype.draw = function() {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var lf = overlayProjection.fromLatLngToDivPixel(this.latlng_);

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = (lf.x - $(div).width() / 2) + 'px';
    div.style.top = (lf.y - $(div).height()) + 'px';

};

BucketListOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};

// Note that the visibility property must be a string enclosed in quotes
BucketListOverlay.prototype.hide = function() {
    if (this.div_) {
        this.div_.style.visibility = "hidden";
    }
};

BucketListOverlay.prototype.show = function() {
    if (this.div_) {
        this.div_.style.visibility = "visible";
    }
};

BucketListOverlay.prototype.toggle = function() {
    if (this.div_) {
        if (this.div_.style.visibility == "hidden") {
            this.show();
        } else {
            this.hide();
        }
    }
};

BucketListOverlay.prototype.toggleDOM = function() {
    if (this.getMap()) {
        this.setMap(null);
    } else {
        this.setMap(this.map_);
    }
};

BucketListPin.prototype = new BucketListOverlay();
BucketListPin.prototype.constructor = BucketListPin;

// Overlay for Google maps
// https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
// Requires jQuery, Google Maps
function BucketListPin(bounds, zoom, image, map, latlng) {
    //console.log('BucketListPin');
    // Now initialize all properties.
    this.bounds_ = map.boundsAt(zoom);
    this.image_ = image;
    this.map_ = map;
    this.latlng_ = latlng;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

BucketListPin.prototype.onAdd = function() {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    var div = $('<div class="map-pin">');
    div.append($('<div class="pin-img" style="background-image: url(' + this.image_ + ')"></div>'));

    this.div_ = div[0];

    // Set the overlay's div_ property to this DIV
    // this.div_ = div;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div[0]);
};

BucketListSmallOverlay.prototype = new BucketListOverlay();
BucketListSmallOverlay.prototype.constructor = BucketListSmallOverlay;

// Overlay for Google maps
// https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
// Requires jQuery, Google Maps
function BucketListSmallOverlay(bounds, zoom, image, map, latlng, type, name, address, phone, defaultState, overlayType, callback, point, markerArray) {
    //console.log('BucketListSmallOverlay');

    // Now initialize all properties.
    this.bounds_ = map.boundsAt(zoom);
    this.zoom_ = zoom;
    this.image_ = image;
    this.map_ = map;
    this.placeName_ = name;
    this.placeAddress_ = address;
    this.placePhone_ = phone;
    this.latlng_ = latlng;
    this.type_ = type;
    this.defaultState_ = defaultState || 'open';
    this.overlayType_ = overlayType || 'save';
    this.callback_ = callback;
    this.point_ = point || null;
    this.markerArray_ = markerArray;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;
    this.checkmark_ = null;
    this.popup_ = null;
    this.icon_ = null;
    this.tip_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

BucketListSmallOverlay.prototype.onAdd = function() {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    var div = $('<div class="pingismo-pin" />'),
        icon = $('<a href="#" class="pin-' + this.type_ + '" title="' + this.placeName_ + '"></a>'),
        tip = $('<a href="#" class="pin-popup-img show-details-btn"></a>'),
        popup = $('<div class="pin-popup" />'),
        detail = $('<p><strong>' + this.placeName_ + '</strong>' + this.placeAddress_ + ' ' + this.placePhone_ + '</p>'),
        check = $('<i class="icon-check pull-right"></i>'),
        self = this;

    div.append(icon);
    popup.append(detail);
    div.append(popup);
    div.append(check);
    tip.append('<i></i>');

    this.div_ = div[0];
    this.checkmark_ = check;
    this.popup_ = popup;
    this.icon_ = icon;
    this.tip_ = tip;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    panes.floatPane.appendChild(div[0]);
    icon.addClass('showme').css({'display': 'block'});
    popup.addClass('showme');

    // click event for top-right
    if (true) {
        popup.append(tip);
        tip.children('i').on('click', function(e){
            self.callback_();
        });

    // click event for pin
        $(icon).on('click', function(){
            $(popup).toggle();
        });
    }

    // image
    if (this.image_) {
        this.tip_.css({backgroundImage: 'url(' + this.image_ + ')'});
    }

    // default state
    if (this.defaultState_ === 'closed') {
        popup.hide();
    }

    // overlay type
    if (this.overlayType_ === 'save') {
        tip.children('i').hide();
    }

};


// change the type of the pin
BucketListSmallOverlay.prototype.changeType = function(newType) {
    this.icon_.removeClass('pin-' + this.type_);
    this.type_ = newType;
    this.icon_.addClass('pin-' + this.type_);
};

// set thumbnail
BucketListSmallOverlay.prototype.setImage = function(imageUrl) {
    console.log('setImage');
    console.log(imageUrl);
    // Have to add another attribute in order to get bImage to work
    // TODO: check why
    this.tip_.css({'backgroundImage': 'url(' + imageUrl + ')'});
};

/**
 * Show checkmark, hide content after point saved
 */
BucketListSmallOverlay.prototype.save = function() {
    this.popup_.hide();
    this.checkmark_.show();
};

BucketListSmallOverlay.prototype.draw = function() {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var lf = overlayProjection.fromLatLngToDivPixel(this.latlng_);

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = (lf.x) + 'px'; // center horizontally
    div.style.top = (lf.y - $(div).height()) + 'px'; // position above vertically

};



BucketListMessageOverlay.prototype = new BucketListOverlay();
BucketListMessageOverlay.prototype.constructor = BucketListMessageOverlay;

function BucketListMessageOverlay(bounds, zoom, map, latlng, type, title, message) {
    //console.log('BucketListSmallOverlay');

    // Now initialize all properties.
    this.bounds_ = map.boundsAt(zoom);
    this.zoom_ = zoom;
    this.map_ = map;
    this.latlng_ = latlng;
    this.type_ = type;
    this.title_ = title;
    this.message_ = message;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;
    this.popup_ = null;
    this.icon_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

BucketListMessageOverlay.prototype.onAdd = function() {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    var div = $('<div class="pingismo-pin message-overlay" />'),
        icon = $('<a href="#" class="pin-' + this.type_ + '"></a>'),
        popup = $('<div class="pin-popup" />'),
        detail = $('<p><strong>' + this.title_ + '</strong>' + this.message_ + '</p>'),
        self = this;

    div.append(icon);
    popup.append(detail);
    div.append(popup);

    this.div_ = div[0];
    this.popup_ = popup;
    this.icon_ = icon;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    panes.floatPane.appendChild(div[0]);
    icon.addClass('showme').css({'display': 'block'});
    popup.addClass('showme');

};

BucketListMessageOverlay.prototype.draw = function() {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var lf = overlayProjection.fromLatLngToDivPixel(this.latlng_);

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = (lf.x) + 'px'; // center horizontally
    div.style.top = (lf.y - $(div).height()) + 'px'; // position above vertically

};


BucketListLargeOverlay.prototype = new BucketListOverlay();
BucketListLargeOverlay.prototype.constructor = BucketListLargeOverlay;

// Overlay for Google maps
// https://developers.google.com/maps/documentation/javascript/overlays#CustomOverlays
// Requires jQuery, Google Maps
function BucketListLargeOverlay(bounds, zoom, image, map, latlng, type, name, address, phone, point, markerArray) {
    //console.log('BucketListLargeOverlay');
    // Now initialize all properties.
    this.bounds_ = map.boundsAt(zoom);
    this.zoom_ = zoom;
    this.image_ = image;
    this.map_ = map;
    this.placeName_ = name;
    this.placeAddress_ = address;
    this.placePhone_ = phone;
    this.point_ = point;
    this.pointTitle_ = point.title;
    this.pointUrl_ = point.url;
    this.pointText_ = point.text;
    this.pointImages_ = point.images;
    this.latlng_ = latlng;
    this.markerArray_ = markerArray;

    // We define a property to hold the image's
    // div. We'll actually create this div
    // upon receipt of the add() method so we'll
    // leave it null for now.
    this.div_ = null;

    // Explicitly call setMap() on this overlay
    this.setMap(map);
}

BucketListLargeOverlay.prototype.onAdd = function() {
    // Note: an overlay's receipt of onAdd() indicates that
    // the map's panes are now available for attaching
    // the overlay to the map via the DOM.

    var div = $('<div class="map-tip max-tip" />'),
        tip = $('<a class="tip-expand-collapse is-expanded" href="#" id="tip-switch"></a>'),
        self = this,
        images = '',
        len = this.pointImages_.length,
        len2 = this.pointImages_.length,
        x = 0;

    if (len > 0) {
        images = '<div class="refer-pics"><ul>';
        while(len--) {
            images += '<li><a href="#"><img src="' + this.pointImages_[len].url + '" /></a></li>';
        }
        images += '</ul></div>';
    }

    div.append($('<div class="tip-content"><div class="from-google"><div class="pin-img" style="background-image: url(' + this.image_ + ')"></div><div class="context"><h2>' + this.placeName_ + '</h2><p>' + this.placeAddress_ + '</p><p>' + this.placePhone_ + '</p></div></div><hr /><div class="refer-context"><h2>' + this.pointTitle_ + '</h2><a href="' + this.pointUrl_ + '" target="_blank" class="url">' + this.pointUrl_ + '</a><p class="context">' + this.pointText_ + '</p></div>' + images + '</div><div class="tip-footer"></div>'));

    this.div_ = div[0];

    // Set the overlay's div_ property to this DIV
    // this.div_ = div;

    // We add an overlay to a map via one of the map's panes.
    // We'll add this overlay to the overlayImage pane.
    var panes = this.getPanes();
    panes.floatPane.appendChild(div[0]);

    // expand tip
    if (true) {
        $(div[0]).prepend(tip);
        $(tip).on('click', { bounds: this.bounds_, zoom: this.zoom_, image: this.image_, map: this.map_, latlng: this.latlng_, name: this.placeName_, address: this.placeAddress_, phone: this.placePhone_, point: this.point_, markerArray: this.markerArray_ }, function(e){
            self.markerArray_.push(new BucketListSmallOverlay(e.data.bounds, e.data.zoom, e.data.image, e.data.map, e.data.latlng, e.data.name, e.data.address, e.data.phone, e.data.point, e.data.markerArray));
            if (self.getMap()) {
                self.setMap(null);
            }
        });
    }

    function setScrollBar() {
        $($(div[0]).find(".refer-pics")[0]).mCustomScrollbar({
            horizontalScroll:true,
            scrollInertia: 0
        });
    }

    // add customScrollbar
    if ($().mCustomScrollbar) {
        $(this.div_).find('.refer-pics img').error(function(){
                    $(this).remove();
                    if (++x == len2) {
                        window.setTimeout(setScrollBar, 0);
                    }
                }).load(function(){
            if (++x == len2) {
                window.setTimeout(setScrollBar, 0);
            }
        });
    }

    // truncate (if truncate plugin available)
    if ($().truncate) {
        $(div[0]).find('.context').truncate({
            width: 'auto',
            token: '&hellip;',
            side: 'right',
            multiline: true
        });
    }
};

BucketListLargeOverlay.prototype.draw = function() {
    // Size and position the overlay. We use a southwest and northeast
    // position of the overlay to peg it to the correct position and size.
    // We need to retrieve the projection from this overlay to do this.
    var overlayProjection = this.getProjection();

    // Retrieve the southwest and northeast coordinates of this overlay
    // in latlngs and convert them to pixels coordinates.
    // We'll use these coordinates to resize the DIV.
    var lf = overlayProjection.fromLatLngToDivPixel(this.latlng_);

    // Resize the image's DIV to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = (3 + lf.x - $(div).width() / 2) + 'px';
    div.style.top = (lf.y - $(div).height() - 49) + 'px';

};