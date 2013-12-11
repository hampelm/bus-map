$(function(){
  var map = L.map('map').setView([42.369594,-83.075438], 11);

  baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png');
  map.addLayer(baseLayer);

  var busDots = L.layerGroup().addTo(map);

  var apiURL = 'http://ddot-beta.herokuapp.com/api/api/where/';
  var key = 'BETA';

  var style = {
    stroke: false,
    fillColor: '#aaa',
    fillOpacity: 1,
    radius: 5
  };


  var getStyle = function(d) {
    var s = _.clone(style);
    if (!d) return s;

    if (d >= 0) { s.fillColor = "#6a8c1f"};
    if (d >= 5) { s.fillColor = "#fcb000"};
    if (d >= 10) { s.fillColor = "#ff6d49"};
    if (d >= 20) { s.fillColor ="#e20027" };
    return s;
  };

  var busInfoTemplate = _.template($('#t-bus-info').html());
  var activeVehicles = {};

  var success = function(data) {
    var trips = _.indexBy(data.data.references.trips, function(trip) {
      return trip.id;
    });

    var data = data.data.list;
    var oldActiveVehicles = activeVehicles;
    activeVehicles = {};
    _.each(data, function(bus){
      if (bus.tripStatus !== null) {
        var content = oldActiveVehicles[bus.vehicleId];
        var ll = [bus.tripStatus.position.lat, bus.tripStatus.position.lon];


        bus.headsign = trips[bus.tripId].tripHeadsign;
        bus.deviation = bus.tripStatus.scheduleDeviation / 60;
        var popupContent = busInfoTemplate({ bus: bus });
        if (content) {
          // Update existing vehicles
          content.marker.setLatLng(ll);
          oldActiveVehicles[bus.vehicleId] = null;
          content.popup.setContent(popupContent);
        } else {
          // Add new vehicles
          // Set the style.
          var deviation;
          var s = style;
          if (bus.tripStatus.predicted === true) {
            deviation = Math.abs(bus.tripStatus.scheduleDeviation) / 60;

            s = getStyle(deviation);
          }

          content = {};
          content.marker = L.circleMarker(ll, s);

          content.popup = L.popup(popupContent);
          content.marker.bindPopup(content.popup);

          // Show it on the map
          busDots.addLayer(content.marker);
        }
        activeVehicles[bus.vehicleId] = content;

      }
    });

    // Remove stale vehicles
    _.each(oldActiveVehicles, function (content, vehicle) {
      if (content) {
        busDots.removeLayer(content.marker);
      }
    });

  }

  var fetch = function() {
    var jqxhr = $.ajax(apiURL + 'vehicles-for-agency/DDOT.json?key=' + key, {
      dataType: 'json'
    });

    jqxhr.done(success);

    jqxhr.fail(function(error) {
      console.log(error);
    });
  }

  // Track the buses!
  fetch();
  window.setInterval(fetch, 3000);




});
