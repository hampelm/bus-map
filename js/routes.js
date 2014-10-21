/*globals L: true */

$(function(){
  'use strict';

  var APIURL = 'http://ddot-beta.herokuapp.com/api/api/where/';
  var KEY = 'BETA';
  // http://ddot-beta.herokuapp.com/api/api/where/stops-for-route/DDOT_5514.json?key=BETA

  var STYLE = {
    stroke: false,
    fillColor: '#aaa',
    fillOpacity: 1,
    radius: 5
  };

  var map = L.map('map').fitBounds([
    [42.277816819534955, -83.2708740234375],
    [42.47108395294282, -82.87605285644531]
  ]);
  var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png', {
    detectRetina: false
  });
  map.addLayer(baseLayer);

  var busDots = L.layerGroup().addTo(map);

  var getStyle = function(d) {
    var s = _.clone(STYLE);

    return s;
  };

  var gotRoute = function(data) {
    var route = data.data.entry;
    console.log("Got route", route);

    var rp = route.polylines;
    _.each([rp[0]], function(p) {
      var encodedPolyline = p.points;
      var polyline = L.Polyline.fromEncoded(encodedPolyline).addTo(map);
      console.log(polyline);
    });

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
    console.log(routes);

    _.each([routes[2]], fetchRoute);
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
