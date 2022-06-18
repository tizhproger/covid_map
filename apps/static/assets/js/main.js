const border_color = 'blue'
const map_token = document.getElementById('map_token').textContent;
document.getElementById('map_token').remove();

var yellowPoint = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var bluePoint = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redPoint = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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

const geocoder = new MapboxGeocoder({
    accessToken: map_token,
    types: 'country,region,place,postcode,locality,neighborhood,district,locality,address,poi'
});
geocoder.addTo('#geocoder');

// Add geocoder result to container.
geocoder.on('result', (e) => {
    console.log(e)
    if ('bbox' in e.result){
        map.fitBounds([
            [e.result.bbox[3], e.result.bbox[0]],
            [e.result.bbox[1], e.result.bbox[2]]
        ])
    }else{
        map.flyTo(e.result.center.reverse(), 16);
    }
});

function setPoint(lat, lng, popup_inf, map_var, radius=0, threat=1, source='user'){
    var options = {}
    if(source == 'user'){
        options['icon'] = yellowPoint;

    }else if(source == 'building'){
        options['icon'] = bluePoint;

    };
    if(threat == 3){
        options['icon'] = redPoint;
    };

    var marker = L.marker([lat, lng], options);
    marker.bindPopup(popup_inf.split('<br>').filter(element => !element.includes('Phone') && !element.includes('Patient')).join('<br>'));

    marker.on('mouseover', function (e) {
        this.openPopup();
    });

    marker.on('mouseout', function (e) {
        this.closePopup();
    });
    //marker.addTo(map_var);
    marker.on('click', function(e) {
        map_var.flyTo([lat, lng], 17);
    });

    if (radius > 0){
        L.circle([lat, lng], {
        color: 'blue',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: radius
    }).addTo(map_var);
    }
    return marker;
}