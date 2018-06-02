var map;

var curvature = 0.5; // how curvy to make the arc

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

    var curveMarker;

    function updateCurveMarker() {
        var pos1 = markerP1.getPosition(), // latlng
            pos2 = markerP2.getPosition(),
            projection = map.getProjection(),
            p1 = projection.fromLatLngToPoint(pos1), // xy
            p2 = projection.fromLatLngToPoint(pos2);

        // Calculate the arc.
        // To simplify the math, these points
        // are all relative to p1:
        var e = new Point(p2.x - p1.x, p2.y - p1.y), // endpoint (p2 relative to p1)
            m = new Point(e.x / 2, e.y / 2), // midpoint
            o = new Point(e.y, -e.x), // orthogonal
            c = new Point( // curve control point
                m.x + curvature * o.x,
                m.y + curvature * o.y);

        var pathDef = 'M 0,0 ' +
            'q ' + c.x + ',' + c.y + ' ' + e.x + ',' + e.y;

        var zoom = map.getZoom(),
            scale = 1 / (Math.pow(2, -zoom));

        var symbol = {
            path: pathDef,
            scale: scale,
            strokeWeight: 1,
            fillColor: 'none'
        };

        // Define a symbol using SVG path notation, with an opacity of 1.
        var lineSymbol = {
            path: 'M 0,-2 0,0.5',
            strokeOpacity: 1,
            strokeWeight: 2,
            scale: 4
        };

        // Create the polyline, passing the symbol in the 'icons' property.
        // Give the line an opacity of 0.
        // Repeat the symbol at intervals of 20 pixels to create the dashed effect.
        var line = new google.maps.Polyline({
            path: [pos1, pos2],
            strokeOpacity: 0,
            strokeColor: 'green',
            icons: [{
                icon: lineSymbol,
                offset: '0',
                repeat: '4%'
            }],
            map: map
        });

        if (!curveMarker) {
            curveMarker = new Marker({
                position: pos1,
                clickable: false,
                icon: symbol,
                zIndex: 0, // behind the other markers
                map: map
            });
        } else {
            curveMarker.setOptions({
                position: pos1,
                icon: symbol,
            });
        }
    }

    google.maps.event.addListener(map, 'projection_changed', updateCurveMarker);
    google.maps.event.addListener(map, 'zoom_changed', updateCurveMarker);

    google.maps.event.addListener(markerP1, 'position_changed', updateCurveMarker);
    google.maps.event.addListener(markerP2, 'position_changed', updateCurveMarker);

    var lineLength = google.maps.geometry.spherical.computeDistanceBetween(markerP1.getPosition(), markerP2.getPosition());
    var lineHeading = google.maps.geometry.spherical.computeHeading(markerP1.getPosition(), markerP2.getPosition());
    var markerA = new google.maps.Marker({
        position: google.maps.geometry.spherical.computeOffset(markerP1.getPosition(), lineLength / 3, lineHeading - 60),
        map: map,
        icon: {
            url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
            size: new google.maps.Size(7, 7),
            anchor: new google.maps.Point(3.5, 3.5)
        }
    });
    var markerB = new google.maps.Marker({
        position: google.maps.geometry.spherical.computeOffset(markerP2.getPosition(), lineLength / 3, -lineHeading + 120),
        icon: {
            url: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png",
            size: new google.maps.Size(7, 7),
            anchor: new google.maps.Point(3.5, 3.5)
        },
        map: map
    });

    var curvedLine = new GmapsCubicBezier(markerP1.getPosition(), markerA.getPosition(), markerB.getPosition(), markerP2.getPosition(), 0.01, map);

    var line = new google.maps.Polyline({
        path: [markerP1.getPosition(), markerP2.getPosition()],
        strokeOpacity: 0,
        icons: [{
            icon: {
                path: 'M 0,-1 0,1',
                strokeOpacity: 1,
                scale: 4
            },
            offset: '0',
            repeat: '20px'
        }],
        // map: map
    });




}

google.maps.event.addDomListener(window, 'load', init);

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
                scale: 4
            },
            offset: '0',
            repeat: '20px'
        }],
        strokeColor: 'grey'
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