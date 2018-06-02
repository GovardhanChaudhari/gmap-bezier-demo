var map;
var radius=5;
var dashGap=2;
var lineColour = "red";
function init() {
    var Map = google.maps.Map,
        LatLng = google.maps.LatLng,
        LatLngBounds = google.maps.LatLngBounds,
        Marker = google.maps.Marker,
        Point = google.maps.Point;

    // This is the initial location of the points
    // (you can drag the markers around after the map loads)
    var pos1 = new LatLng(23.634501, -102.552783);
    var pos2 = new LatLng(17.987557, -92.929147);

    var bounds = new LatLngBounds();
    bounds.extend(pos1);
    bounds.extend(pos2);

    map = new Map(document.getElementById('map'), {
        center: bounds.getCenter(),
        zoom: 12
    });
    map.fitBounds(bounds);

    var markerP1 = new Marker({
        position: pos1,
        draggable: true,
        map: map
    });
    var markerP2 = new Marker({
        position: pos2,
        draggable: true,
        map: map
    });


    /**
     * Create dashed curved line, by taking the current, and next marker positions, calculating the direction betweeen
     * 1 and 2, creating two points off this line, and creating a cubic bezier curve based on this.
     */
    var lineLength = google.maps.geometry.spherical.computeDistanceBetween(markerP1.getPosition(), markerP2.getPosition());
    var lineHeading = google.maps.geometry.spherical.computeHeading(markerP1.getPosition(), markerP2.getPosition());

    // Create two points off the main line to create the curve
    var curveMakerA = google.maps.geometry.spherical.computeOffset(markerP1.getPosition(), lineLength / radius, lineHeading - 60);
    var curveMakerB = google.maps.geometry.spherical.computeOffset(markerP2.getPosition(), lineLength / radius, -lineHeading + 120);
    var curvedLine = new GmapsCubicBezier(markerP1.getPosition(), curveMakerA, curveMakerB, markerP2.getPosition(), 0.1, map);

}

google.maps.event.addDomListener(window, 'load', init);

// Define a Cubic Bezier function to take all waypoints (start, curve marker 1, 2, and end)
// Create an array of co-ordinates
// Loop through this array, and push those co-ordinate bundles, as google LatLng objects,  onto a "path" array
// Create a geodesic Polyline with the "path" array.
var GmapsCubicBezier = function (latlong1, latlong2, latlong3, latlong4, resolution, map) {
    var lat1 = latlong1.lat();
    var long1 = latlong1.lng();
    var lat2 = latlong2.lat();
    var long2 = latlong2.lng();
    var lat3 = latlong3.lat();
    var long3 = latlong3.lng();
    var lat4 = latlong4.lat();
    var long4 = latlong4.lng();

    var points = [];

    for (it = 0; it <= 1; it += resolution) {
        points.push(this.getBezier({
            x: lat1,
            y: long1
        }, {
            x: lat2,
            y: long2
        }, {
            x: lat3,
            y: long3
        }, {
            x: lat4,
            y: long4
        }, it));
    }

    var path = [];
    for (var i = 0; i < points.length - 1; i++) {
        path.push(new google.maps.LatLng(points[i].x, points[i].y));
        path.push(new google.maps.LatLng(points[i + 1].x, points[i + 1].y, false));
    }

    var Line = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeOpacity: 0.0,
        icons: [{
            icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 1
            },
            offset: '0',
            repeat: dashGap +'px'
        }],
        strokeColor: lineColour
    });

    Line.setMap(map);

    return Line;
};


GmapsCubicBezier.prototype = {

    B1: function (t) {
        return t * t * t;
    },
    B2: function (t) {
        return 3 * t * t * (1 - t);
    },
    B3: function (t) {
        return 3 * t * (1 - t) * (1 - t);
    },
    B4: function (t) {
        return (1 - t) * (1 - t) * (1 - t);
    },
    getBezier: function (C1, C2, C3, C4, percent) {
        var pos = {};
        pos.x = C1.x * this.B1(percent) + C2.x * this.B2(percent) + C3.x * this.B3(percent) + C4.x * this.B4(percent);
        pos.y = C1.y * this.B1(percent) + C2.y * this.B2(percent) + C3.y * this.B3(percent) + C4.y * this.B4(percent);
        return pos;
    }
};

function sliderChanged(event) {
    console.log("slider changed",event.value);
    radius = event.value;
    init();
}


function dashSliderChanged(event) {
    console.log("slider changed",event.value);
    dashGap = event.value;
    init();
}

function colourChanged(event) {
    console.log("slider changed",event.value);
    lineColour= event.value;
    init();
}

