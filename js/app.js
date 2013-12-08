$(function(){
  var map = L.map('map').setView([42.42, -83.02 ], 13);

  baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/matth.map-zmpggdzn/{z}/{x}/{y}.png');
  map.addLayer(baseLayer);

 	var utfGrid = new L.UtfGrid('https://localhost:3443/tiles/26e39f80-ea3a-11e1-bcdf-e9f1e9f87cda/utfgrids/{z}/{x}/{y}.json?callback={cb}');
 	map.addLayer(utfGrid);

		utfGrid.on('mouseover', function (e) {
			if (e.data) {
				document.getElementById('hover').innerHTML = 'hover: ' + e.data;
			} else {
				document.getElementById('hover').innerHTML = 'hover: nothing';
			}
			//console.log('mouseover: ' + e.data);
		});

  //   https://localhost:3443/tiles/26e39f80-ea3a-11e1-bcdf-e9f1e9f87cda/utfgrids/{z}/{x}/{y}.json?callback={cb}

});
