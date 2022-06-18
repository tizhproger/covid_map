var area = 5;
var curr_marker;
const url = 'https://covidprevent.herokuapp.com/';
const csrftoken = $('[name=csrfmiddlewaretoken]').val();
var markers = L.markerClusterGroup();

function userPoint(lat, long, map_var){
    var geojsonFeature = {
        "type": "Feature",
        "properties": {},
        "geometry": {
                "type": "Point",
                "coordinates": [lat, long]
        }
    }

    L.geoJson(geojsonFeature, {

        pointToLayer: function(feature, latlng){

            marker = L.marker([lat, long], {

                title: "Resource Location",
                alt: "Resource Location",
                riseOnHover: true,
                draggable: true,
                icon: yellowPoint

            });

            marker.bindPopup("<input type='button' value='Delete this marker' class='marker-delete-button'/>");
            marker.on("popupopen", marker_drop);

            marker.on('click', function(e) {
                console.log(e.latlng);
                markerClick(e);
            });

            return marker;
        }
    }).addTo(map_var);

    curr_marker = marker;
}

function marker_drop(){
    var tempMarker = this;
    $(".marker-delete-button:visible").click(function () {
        map.removeLayer(tempMarker);
        map.on('click', mapClick);
    });
}

function mapClick(e){
    console.log(e);
    userPoint(e.latlng.lat, e.latlng.lng, map);
    map.off('click', mapClick);
}

function markerClick(e){
    map.flyTo([e.latlng.lat, e.latlng.lng], 17);
}

function reverseCoord(lat, lng){
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + map_token, false );
	xmlHttp.send();
    var response = JSON.parse(xmlHttp.responseText);
    return response.features[0].place_name;
}

map.on('click', mapClick);
	
$.ajax({
    dataType: "json",
    url: url + 'points/',
    async: false, 
    success: function(data) {
        for (point in data){
            if (data[point].level == 1){
                area = 5;
            }else if (data[point].level == 2){
                area = 10;
            }else{
                area = 15;
            }
            var source = data[point].building == null ? 'user' : 'building'
            markers.addLayer(setPoint(data[point].latitude, data[point].longtitude, data[point].description, map, area, data[point].level, source))
        }
        map.addLayer(markers);
    },
    error: function (request) {
        alert('Points not obtained!\n' + request.responseJSON.error);
    }
});

$('#sendButton').on('click', (e)=>{
    var data = {};
    var level = 1;
    
    if(curr_marker){
        if ($('#fullName').val() == '' || $('#fullName').val() == ''){
            alert('Fill patient name and contact phone before sending report!');
            return;
        }

        if ($('#coaghtSwitch')[0].checked || $('#feaverSwitch')[0].checked || $('#breathSwitch')[0].checked){
            level = 1;

        }
        if (($('#coaghtSwitch')[0].checked && $('#feaverSwitch')[0].checked) || ($('#feaverSwitch')[0].checked && $('#breathSwitch')[0].checked)){
            level = 2;

        }
        if ($('#coaghtSwitch')[0].checked && $('#feaverSwitch')[0].checked && $('#breathSwitch')[0].check){
            level = 3;
        }

        var desc = 'Patient: ' + $('#fullName').val() + '<br>' + 
            'Phone: ' + $('#phone').val() + '<br>' + 
            'Threat level: ' + level + '<br>' + 
            'Additional: ' + $('#infoField').val(); + '<br>' +
            'Address: ' + reverseCoord(curr_marker.getLatLng().lat, curr_marker.getLatLng().lng);

        data['address'] = reverseCoord(curr_marker.getLatLng().lat, curr_marker.getLatLng().lng);
        data['latitude'] = curr_marker.getLatLng().lat;
        data['longtitude'] = curr_marker.getLatLng().lng;
        data['description'] = desc;
        data['threat'] = level;
        data['checked'] = false;

        console.log(data);

        $('#fullName').val('');
        $('#phone').val('');
        $('#feaverSwitch')[0].checked = false;
        $('#coaghtSwitch')[0].checked = false;
        $('#breathSwitch')[0].checked = false;
        $('#infoField').val('');

        $.ajax({
            type: 'POST',
            url: url + 'addpoint/',
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            traditional: true,
            success: function (data) {
                alert('Point sended for verification!');
                curr_marker.off('click', markerClick);
                curr_marker.dragging.disable();
                curr_marker.setPopupContent(desc);
                curr_marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                curr_marker.on('mouseout', function (e) {
                    this.closePopup();
                });
                map.on('click', mapClick);
            },
            error: function (request) {
                alert('Point not saved...\n' + request.responseJSON.error);
            }
        });
    }else{
        alert('Put marker first!')
    }
})
