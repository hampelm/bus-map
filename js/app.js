$(function(){
  var map = L.map('map').fitBounds([
    [42.277816819534955, -83.2708740234375],
    [42.47108395294282, -82.87605285644531]
  ]);
  baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png', {
    detectRetina: false
  });
  map.addLayer(baseLayer);

  var busDots = L.layerGroup().addTo(map);

  var apiURL = 'http://ddot-beta.herokuapp.com/api/api/where/';
  var apiKey = 'LIVEMAP';

  var layers = {};
  var geojsons = {};

  var style = {
    stroke: false,
    fillColor: '#aaa',
    fillOpacity: 1,
    radius: 5
  };

  var ROUTE_STYLE = {
    color: '#0062be',
    opacity: 1,
    weight: 3
  };
  var CIRCLE_ROUTE_STYLE = {
    color: '#ffad00',
    opacity: 1,
    fillColor: '#ffad00'
  };
  var RADIUS = 12;

  var layers = {};
  var geojsons = {};
  var circles = [];

  var getStyle = function(d) {
    var s = _.clone(style);
    //if (!d) return s;

    if (d <= 5) { s.fillColor = "#6a8c1f"; }
    if (d >= 5) { s.fillColor = "#fcb000"; }
    if (d >= 10) { s.fillColor = "#ff6d49"; }
    if (d >= 20) { s.fillColor ="#e20027"; }
    return s;
  }

  var getRouteStyle = function(d) {
    var s = _.clone(ROUTE_STYLE);

    s.color = '#' + d.color;

    return s;
  };

  var dim = function() {
    _.each(layers, function(layer) {
      var options = layer.options;
      options.opacity = 0.1;
      options.dashArray = '';
      layer.setStyle(options);
    });
  };

  var light = function(key) {
    var options = layers[key].options;
    options.opacity = 0.6;
    options.dashArray = '4,4';
    layers[key].setStyle(options);
  };

  var bright = function(key) {
    var options = layers[key].options;
    options.opacity = 1;
    options.dashArray = '';
    layers[key].setStyle(options);
  };

  var showOverlaps = function(keys) {
    _.each(layers, dim);
    _.each(keys, light);
  };

  var addCircle = function(geoJSON) {
    var ll = new L.LatLng(geoJSON.coordinates[0], geoJSON.coordinates[1]);
    var circle = L.circle(ll, RADIUS, CIRCLE_ROUTE_STYLE);
    map.addLayer(circle);
    circles.push(circle);
  };

  var removeCircles = function() {
    _.each(circles, function(circle) {
      map.removeLayer(circle);
    });
    circles = [];
  };

  var findOverlaps = function(event) {
    var source = event.target.toGeoJSON();
    var routeId = event.target._routeId;
    var keys = [];

    removeCircles();

    _.each(geojsons, function(value, key) {
      if(key === routeId) { return; } // don't self-intersect
      var intersects = gju.lineStringsIntersect(source.geometry, value.geometry);
      if (intersects) {
        _.each(intersects, addCircle);
        keys.push(key);
      }
    });

    showOverlaps(keys);
    bright(routeId);
  };

  var success = function(data) {
    // console.log(data);

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

        marker.on('mouseover', function(event) {
          $('#route').html(trips[bus.tripId].tripHeadsign.toUpperCase());
          event.target._routeId = trips[bus.tripId].routeId;
          handleClick(event);
        });
        busDots.addLayer(marker);
      }
    });
  }

  var handleClick = function(event, route) {
    var routeId = event.target._routeId;
    findOverlaps(event);
  };

  var gotRoute = function(data) {
    var route = data.data.entry;
    var references = data.data.references;
    var details = _.where(references.routes, { id: route.routeId })[0]; // headsign etc
    var style = getRouteStyle(details);

    // console.log(route);
    // console.log(references);
    // console.log(details);

    var sortedPolylines = _.sortBy(route.polylines, function(l) { return -l.length; });
    var encodedPolyline = sortedPolylines[0].points;
    var polyline = L.Polyline.fromEncoded(encodedPolyline).setStyle(style).addTo(map);
    polyline._routeId = route.routeId;

    layers[route.routeId] = polyline;
    geojsons[route.routeId] = polyline.toGeoJSON();

    polyline.on('click', handleClick);
  };

  var fetchRoute = function(route) {
    var jqxhr = $.ajax(apiURL + 'stops-for-route/' + route.id + '.json?key=' + apiKey, {
      dataType: 'json'
    });

    jqxhr.done(gotRoute);

    jqxhr.fail(function(error) {
      console.log(error);
    });
  };

  var gotRoutes = function(data) {
    var routes = data.data.list;

    _.each(routes, fetchRoute);
  };

  var fetchRoutes = function() {
    var jqxhr = $.ajax(apiURL + 'routes-for-agency/DDOT.json?key=' + apiKey, {
      dataType: 'json'
    });

    jqxhr.done(gotRoutes);

    jqxhr.fail(function(error) {
      console.log(error);
    });
  };

  fetchRoutes();


  var debounced;
  var fetch = function() {
    var jqxhr = $.ajax(apiURL + 'vehicles-for-agency/DDOT.json?key=' + apiKey, {
      dataType: 'json'
    });

    jqxhr.done(success);

    jqxhr.fail(function(error) {
      console.log(error);
    });

    jqxhr.always(debounced);
  }

  debounced = _.debounce(fetch, 4000);

  // Track the buses!
  fetch();
  // window.setInterval(fetch, 4000);

});
