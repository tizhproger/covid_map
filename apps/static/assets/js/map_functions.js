const point_radius = 10
const points_limit = 4
const border_color = 'blue'
const current_user = 'guest'
var points = []
var user_points = new Array();

var map = L.map('map').setView([46.5, 30.7], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

L.control.locate({
    flyto: true,
    initialZoomLevel: 17,
    strings: {
        popup: "You are here",
    },
    locateOptions: {
        enableHighAccuracy: true
    }
}
).addTo(map);

function setPoint(lat, lang, map, radius=false, registered=false){
    var marker;

    if (radius){
        L.circle([lat, lang], {
            color: border_color,
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: point_radius
            }).addTo(map);
    }
    
    var geojsonFeature = {

        "type": "Feature",
        "properties": {},
        "geometry": {
                "type": "Point",
                "coordinates": [lat, lang]
        }
    }

    L.geoJson(geojsonFeature, {

        pointToLayer: function(feature, latlng){

            marker = L.marker([lat, lang], {

                title: "Resource Location",
                alt: "Resource Location",
                riseOnHover: true,
                draggable: true,

            });

            if (registered){
                marker.bindPopup("<input type='button' value='Delete this marker' class='marker-delete-button'/>");
                marker.on("popupopen", marker_drop);
            }

            marker.on('click', function(e) {
                console.log(e.latlng);
                map.flyTo([lat, lang], 17);
            });

            return marker;
        }
    }).addTo(map);

    return marker;
}

function adminPanel(){
    pass
}

function userPanel(){
    pass
}

function guestPanel(){
    pass
}

function marker_drop(){
    var tempMarker = this;
    $(".marker-delete-button:visible").click(function () {
        map.removeLayer(tempMarker);
    });
}

//Click on map
map.on('click', (e) => {
    console.log(e);
    var point;
    point = setPoint(e.latlng.lat, e.latlng.lng, map);
    var answer = confirm("Вы уверены в точке?");
    if (!answer){
        map.removeLayer(point);
    }
});

const geocoder = new MapboxGeocoder({
    accessToken: '{{ mapbox_access_token }}',
    types: 'country,region,place,postcode,locality,neighborhood'
});
geocoder.addTo('#geocoder');

// Add geocoder result to container.
geocoder.on('result', (e) => {
    var points = e.result.center;
    console.log(e.result);
    var answer = confirm("Вы уверены в адресе?\n" + e.result.place_name);
    if (answer){
        map.fitBounds([
            [e.result.bbox[3], e.result.bbox[0]],
            [e.result.bbox[1], e.result.bbox[2]]
        ])
        L.marker([points[1], points[0]]).addTo(map).on('click', function(e) {
            console.log(e.latlng);
            map.flyTo([e.latlng.lat, e.latlng.lng], 17);
        });
        L.circle([points[1], points[0]], {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 10
        }).addTo(map);
    }
});