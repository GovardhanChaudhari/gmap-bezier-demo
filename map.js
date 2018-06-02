
var flightPlanCoordinates = [
    {lat: 28.644800, lng:77.216721},
    {lat:  19.228825, lng: 72.854},
    // {lat: -18.142, lng: 178.431},
    // {lat: -27.467, lng: 153.027}
];

var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
});



function initMap() {
    debugger;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 19.228825, lng: 72.854},
        zoom:5
    });

    flightPath.setMap(map);
}

 setTimeout(initMap,100);