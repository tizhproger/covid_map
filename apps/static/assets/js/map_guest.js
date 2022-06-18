var map_points = '';
var area = 5;
const url = 'https://covidprevent.herokuapp.com/';
var markers = L.markerClusterGroup();
	
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
            var src = data[point].building == null ? 'user' : 'building'
            markers.addLayer(setPoint(lat=data[point].latitude, lng=data[point].longtitude, popup_inf=data[point].description, map_var=map, radius=area, threat=data[point].level, source=src));
        }
        map.addLayer(markers);
    },
    error: function (request) {
        alert('Points not obtained!\n' + request.responseJSON);
    }
});
