// Get Bounds for Google Maps API V3
// http://stackoverflow.com/questions/3774579/calculate-bounds-from-center-and-zoom-google-maps-api-v3
/**
 * Calculates the bounds this map would display at a given zoom level.
 *
 * @member google.maps.Map
 * @method boundsAt
 * @param {Number}                 zoom         Zoom level to use for calculation.
 * @param {google.maps.LatLng}     [center]     May be set to specify a different center than the current map center.
 * @param {google.maps.Projection} [projection] May be set to use a different projection than that returned by this.getProjection().
 * @param {Element}                [div]        May be set to specify a different map viewport than this.getDiv() (only used to get dimensions).
 * @return {google.maps.LatLngBounds} the calculated bounds.
 *
 * @example
 * var bounds = map.boundsAt(5); // same as map.boundsAt(5, map.getCenter(), map.getProjection(), map.getDiv());
 */
if (typeof google.maps.Map !== 'undefined') {
    google.maps.Map.prototype.boundsAt = function (zoom, center, projection, div) {
        var p = projection || this.getProjection();
        if (!p) return undefined;
        var d = $(div || this.getDiv());
        var zf = Math.pow(2, zoom) * 2;
        var dw = d.width()  / zf;
        var dh = d.height() / zf;
        var cpx = p.fromLatLngToPoint(center || this.getCenter());
        return new google.maps.LatLngBounds(
            p.fromPointToLatLng(new google.maps.Point(cpx.x - dw, cpx.y + dh)),
            p.fromPointToLatLng(new google.maps.Point(cpx.x + dw, cpx.y - dh)));
    };    
}