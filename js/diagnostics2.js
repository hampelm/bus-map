$(function(){
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
    if (!d) {
      return s;
    }

    if (d >= 0) { s.fillColor = "#6a8c1f"; }
    if (d >= 5) { s.fillColor = "#fcb000"; }
    if (d >= 10) { s.fillColor = "#ff6d49"; }
    if (d >= 20) { s.fillColor ="#e20027"; }
    return s;
  };

  var busInfoTemplate = _.template($('#t-bus-info').html());
  var activeVehicles = {};

  function success(data) {
    console.log(data);
    console.log(data.data.entry);
    var t = data.data.entry.arrivalsAndDepartures[0].predictedArrivalTime;
    console.log(new Date(t));

    // var popupContent = busInfoTemplate({ bus: bus });
  }

  var fetch = function() {
    var jqxhr = $.ajax(apiURL + 'arrivals-and-departures-for-stop/DDOT_5377.json?key=' + key, {
      dataType: 'json'
    });

    jqxhr.done(success);

    jqxhr.fail(function(error) {
      console.log(error);
    });
  }

  // Track the buses!
  fetch();
  // window.setInterval(fetch, 3000);
});
