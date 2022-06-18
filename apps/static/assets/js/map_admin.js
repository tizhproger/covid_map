var curr_marker;
var local_points = [];
var manual_point = false;
const url = 'https://covidprevent.herokuapp.com/';
const csrftoken = $('[name=csrfmiddlewaretoken]').val();

function userPoint(lat, long, popup_inf, map_var, source='user', threat=1){
    var marker_icon;
    if(source == 'user'){
        marker_icon = yellowPoint;

    }else if(source == 'building'){
        marker_icon = bluePoint;

    };
    if(threat == 3){
        marker_icon = redPoint;
    };

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

                title: "COVID-19 point",
                alt: "COVID-19 point",
                riseOnHover: true,
                draggable: true,
                icon: marker_icon

            });

            marker.bindPopup(popup_inf);
            marker.on('click', function(e) {
                console.log(e.target._latlng);
                markerInfo(e);
                curr_marker = this;
                manual_point = false;
                $('#old_latitude').val(String(e.target._latlng.lat));
                $('#old_longtitude').val(String(e.target._latlng.lng));
            });

            marker.on('dragstart', function(e) {
                console.log(e.target._latlng);
                $('#old_latitude').val(String(e.target._latlng.lat));
                $('#old_longtitude').val(String(e.target._latlng.lng));
            });

            marker.on('dragend', function(e) {
                console.log(e.target._latlng);
                markerInfo(e);
                curr_marker = this;
                manual_point = false;
            });

            return marker;
        }
    }).addTo(map_var);

    curr_marker = marker;
}

function mapClick(e){
    console.log(e);
    userPoint(e.latlng.lat, e.latlng.lng, 'Test', map, 'user');
    $('#old_latitude').val(String(e.latlng.lat));
    $('#old_longtitude').val(String(e.latlng.lng));
    $('#latitude').val(String(e.latlng.lat));
    $('#longtitude').val(String(e.latlng.lng));
    $('#infoField').val('Test');
    $('#threatSwitch')[0].checked = false;
    local_points.push(curr_marker.getLatLng());
    manual_point = true;
}

function markerInfo(e){
    $('#latitude').val(String(e.target._latlng.lat));
    $('#longtitude').val(String(e.target._latlng.lng));
    $('#infoField').val(e.target._popup._content.replaceAll('<br>', '\n'));
    if (e.target._icon.currentSrc.includes('red')){
        $('#threatSwitch')[0].checked = true;

    }else{
        $('#threatSwitch')[0].checked = false;
    };
    console.log(e);
}

function reverseCoord(lat, lng){
    var xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + map_token, false );
	xmlHttp.send();
    var response = JSON.parse(xmlHttp.responseText);
    return response.features[0].place_name;
}

function deleteMarker(marker){
    var data = {};
    var res = false;
    data['latitude'] = marker.getLatLng().lat;
    data['longtitude'] = marker.getLatLng().lng;

    $.ajax({
        type: 'DELETE',
        url: url + 'droppoint/',
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        traditional: true,
        success: function (data) {
            alert('Point deleted from map!');
            removeUnchecked(data['latitude'], data['longtitude']);
            map.removeLayer(marker);
            curr_marker = '';
            $('#old_latitude').val('');
            $('#old_longtitude').val('');
            $('#latitude').val('');
            $('#longtitude').val('');
            $('#threatSwitch')[0].checked = false;
            $('#infoField').val('');
        },
        error: function (request) {
            alert('Point not deleted...\n' + request.responseJSON.error);
            res = false;
        }
    });
    return res;
}

function sendRequest(address, text_sucess, text_error, old_points=false){
    var data = {};
    var res = false;
    var latitude = curr_marker.getLatLng().lat;
    var longtitude = curr_marker.getLatLng().lng;

    if (old_points){
        data['old_latitude'] = parseFloat($('#old_latitude').val());
        data['old_longtitude'] = parseFloat($('#old_longtitude').val());
    }

    if ($('#threatSwitch')[0].checked){
        curr_marker.setIcon(redPoint);
    }

    data['latitude'] = latitude;
    data['longtitude'] = longtitude;
    data['threat'] = $('#threatSwitch')[0].checked;
    data['description'] = $('#infoField').val().replaceAll('\n', '<br>');
    data['address'] = reverseCoord(latitude, longtitude);
    data['checked'] = true;

    $.ajax({
        type: 'POST',
        url: url + address + '/',
        data: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        traditional: true,
        success: function (data) {
            alert(text_sucess);
            if (address == 'updpoint'){
                removeUnchecked(String(latitude), String(longtitude));
            }
            curr_marker.setPopupContent($('#infoField').val().replaceAll('\n', '<br>'));
            curr_marker.setLatLng([latitude, longtitude]);
            curr_marker = '';
            
            $('#old_latitude').val('');
            $('#old_longtitude').val('');
            $('#latitude').val('');
            $('#longtitude').val('');
            $('#threatSwitch')[0].checked = false;
            $('#infoField').val('');
            res = true;
        },
        error: function (request) {
            alert(text_error + '\n' + request.responseJSON.error);
            res = false;
        }
    });
    return res;
}

function saveMarker(){
    if (manual_point){
        return sendRequest('addpoint', 'Point saved!', 'Point not saved...');

    }else{
        alert('You can only update existing points...');
    };

    if ((curr_marker === undefined || curr_marker == '') && ($('#latitude').val() && $('#longtitude').val() && $('#infoField').val())){
        userPoint(parseFloat($('#latitude').val()), parseFloat($('#longtitude').val()), map);
        return sendRequest('addpoint', 'Point saved!', 'Point not saved...');

    }else{
        alert('Fill all info to save point!');
    }
    return false;
}

function banUser(lat, lng, reason){
    var data = {};
    data['latitude'] = lat;
    data['longtitude'] = lng;
    data['reason'] = reason;

    $.ajax({
        type: 'DELETE',
        data: JSON.stringify(data),
        url: url + 'banuser/',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        traditional: true,
        success: function (data) {
            alert('User was banned!');
            return true;
        },
        error: function (request) {
            alert('User not banned...\n' + request.responseJSON.error);
            return false;
        }
    });
}

function viewUnchecked(e){
    var val = e.target.value.split(',');
    coords = val.map(Number);
    map.flyTo(coords, 18);
    curr_marker = '';
    $('#old_latitude').val('');
    $('#old_longtitude').val('');
    $('#latitude').val('');
    $('#longtitude').val('');
    $('#threatSwitch')[0].checked = false;
    $('#infoField').val('');

}

function removeUnchecked(lat, lng){
    $('.dropdown-item[value="' + lat + ',' + lng + '"]').remove();
}

function checkMarker(marker){
    var result = false;
    for (point in local_points) {
        if (local_points[point].lat == marker.getLatLng().lat && local_points[point].lng == marker.getLatLng().lng){
            local_points.splice(point, 1);
            result = true;
        };
    };
    return result;
}

map.on('click', mapClick);

$.ajax({
    dataType: "json",
    url: url + 'points/',
    async: false, 
    success: function(data) {
        console.log(data);
        for (point in data){
            var source = data[point].building == null ? 'user' : 'building'
            userPoint(data[point].latitude, data[point].longtitude, data[point].description, map, source, data[point].level)
        }
    },
    error: function (request) {
        alert('Points not obtained!\n' + request.responseJSON.error);
    }
});

$.ajax({
    dataType: "json",
    url: url + 'unchecked/',
    async: false, 
    success: function(data) {
        for (point in data){
            var li = $('<li></li>');
            var element = $('<data></data>');
            element.attr('value', String(data[point].latitude) + ',' + String(data[point].longtitude));
            element.attr('class', 'dropdown-item');
            element.text(data[point].address);
            element.on('click', viewUnchecked);
            li.append(element);
            $(".dropdown-menu").append(li);
        }
    },
    error: function (request) {
        alert('Unchecked points not obtained!\n' + request.responseJSON.error);
    }
});

$('#deleteButton').on('click', (e)=>{
    if (curr_marker && $('#latitude').val()){
        if (!checkMarker(curr_marker)){
            deleteMarker(curr_marker)
        }else{
            map.removeLayer(curr_marker);
            curr_marker = '';
            $('#old_latitude').val('');
            $('#old_longtitude').val('');
            $('#latitude').val('');
            $('#longtitude').val('');
            $('#threatSwitch')[0].checked = false;
            $('#infoField').val('');
        }
    }else{
        alert('No marker to delete!');
    }
});

$('#saveButton').on('click', (e)=>{
    if ($('#latitude').val() || (manual_point && $('#latitude').val())){
    if (saveMarker()){
            checkMarker(curr_marker);
            curr_marker = '';
            $('#latitude').val('');
            $('#longtitude').val('');
            $('#threatSwitch')[0].checked = false;
            $('#infoField').val('');
        }
    }else{
        alert('No marker to save!');
    }
});

$('#updateButton').on('click', (e)=>{
    if (curr_marker && $('#latitude').val()){
        sendRequest('updpoint', 'Point updated!', 'Point not updated...', old_points=true);
    }else{
        alert('No marker to update!');
    }
});

$('#banButton').on('click', (e)=>{
    if (curr_marker){
        let reason = prompt("Enter ban reason", "Points spam");
        if (reason == null || reason == '') {
            alert('Enter non empty reason!');
            return;
        }
        banUser(curr_marker.getLatLng().lat, curr_marker.getLatLng().lng, reason);
    }else{
        alert('No marker to ban user!');
    }
});
