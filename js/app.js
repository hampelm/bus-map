$(function(){
  var map = L.map('map').fitBounds([
  	[42.277816819534955, -83.2708740234375],
  	[42.47108395294282, -82.87605285644531]
  ]);
  baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png');
  map.addLayer(baseLayer);
  map


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
  }


  var success = function(data) {
  	busDots.clearLayers();

  	var trips = _.indexBy(data.data.references.trips, function(trip) {
  		return trip.id;
  	});


  	var data = data.data.list;
  	_.each(data, function(bus){
  		if (bus.tripStatus !== null) {

  			// Show it on the map
  			var ll = [bus.tripStatus.position.lat, bus.tripStatus.position.lon];
  			var s = style;
  			if (bus.tripStatus.predicted === true) {
  				var deviation = Math.abs(bus.tripStatus.scheduleDeviation) / 60;

  				s = getStyle(deviation);
  			}

  			var marker = L.circleMarker(ll, s);

  			marker.on('mouseover', function() {
  				$('#route').html(trips[bus.tripId].tripHeadsign.toUpperCase());
  			});
  			busDots.addLayer(marker);
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
