/*globals L, gju: true */

$(function(){
  'use strict';

  var APIURL = 'http://ddot-beta.herokuapp.com/api/api/where/';
  var KEY = 'BETA';
  // http://ddot-beta.herokuapp.com/api/api/where/stops-for-route/DDOT_5514.json?key=BETA

  var STYLE = {
    color: '#0062be',
    opacity: 1,
    weight: 3
  };
  var CIRCLE_STYLE = {
    color: '#ffad00',
    opacity: 1,
    fillColor: '#ffad00'
  };
  var RADIUS = 12;

  var layers = {};
  var geojsons = {};
  var circles = [];

  var map = L.map('map', {
    center: [42.364667,-83.067383],
    zoom: 12
  });

  var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png', {
    detectRetina: false
  });
  map.addLayer(baseLayer);

  var busDots = L.layerGroup().addTo(map);

  var getStyle = function(d) {
    var s = _.clone(STYLE);

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
    var circle = L.circle(ll, RADIUS, CIRCLE_STYLE);
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

  var handleClick = function(event, route) {
    var routeId = event.target._routeId;
    findOverlaps(event);
  };

  var gotRoute = function(data) {
    var route = data.data.entry;
    var references = data.data.references;
    var details = _.where(references.routes, { id: route.routeId })[0]; // headsign etc
    var style = getStyle(details);

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
    var jqxhr = $.ajax(APIURL + 'stops-for-route/' + route.id + '.json?key=' + KEY, {
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
    var jqxhr = $.ajax(APIURL + 'routes-for-agency/DDOT.json?key=' + KEY, {
      dataType: 'json'
    });

    jqxhr.done(gotRoutes);

    jqxhr.fail(function(error) {
      console.log(error);
    });
  };

  fetchRoutes();

});
