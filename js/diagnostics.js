/*jslint nomen: true */
/*globals L: true, window: true */

$(function(){
  'use strict';
  var map = L.map('map').setView([42.369594,-83.075438], 11);

  var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png');
  map.addLayer(baseLayer);

  var busDots = L.layerGroup().addTo(map);

  var apiURL = 'http://ddot-beta.herokuapp.com/api/api/where/';
  apiURL = 'https://ddot-proxy-test.herokuapp.com/api/where/';
  var key = 'BETA';

  var style = {
    stroke: false,
    fillColor: '#aaa',
    fillOpacity: 1,
    radius: 5
  };

  var getStyle = function(deviation) {
    var s = _.clone(style);
    if (!deviation) {
      console.log("Deviation", deviation);
      return s;
    }

    if (deviation < 5) { s.fillColor = "#6a8c1f"; } // on time - green
    if (deviation >= 5) { s.fillColor = "#fcb000"; } // a little behind - yellow
    if (deviation >= 10) { s.fillColor = "#ff6d49"; } // late - orange
    if (deviation >= 20) { s.fillColor ="#e20027"; } // super late - red
    return s;
  };

  var busInfoTemplate = _.template($('#t-bus-info').html());
  var activeVehicles = {};

  var success = function(data) {
    console.log(data);
    var trips = _.indexBy(data.data.references.trips, function(trip) {
      return trip.id;
    });

    data = data.data.list;
    var oldActiveVehicles = activeVehicles;
    activeVehicles = {};
    _.each(data, function(bus){
      if (bus.tripStatus === null) {
        console.log(bus);
      }
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

  };


,
//http://ddot-beta.herokuapp.com/api/api/where/trips-for-location.json?lat=42.333018&lon=-83.052306&latSpan=100&lonSpan=100&key=BETA
//?key=TEST&lat=47.653&lon=-122.307&latSpan=0.008&lonSpan=0.008
//      var jqxhr = $.ajax(apiURL + 'vehicles-for-agency/DDOT.json?key=' + key, {

   var fetch = function() {
     var jqxhr = $.ajax(apiURL + 'trips-for-location.json?lat=42.33&lon=-83.04&latSpan=100&lonSpan=100&key=' + key, {
       dataType: 'json'
     });
     jqxhr.done(success);
     jqxhr.fail(function(error) {
       console.log("error", error);
     });
   };
  // // Track the buses!
  fetch();
  // window.setInterval(fetch, 3000);


});
