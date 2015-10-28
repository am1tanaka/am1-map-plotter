/**
 * 変数
 */
var map;
var points = [];
var sidebar = {};

/**
 * Leafletの表示
 */
function initLeaflet(lat, lng) {
  // LeafletのOSM表示
  map = L.map('map').setView([lat, lng], 17);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
}

function setMarker(datas) {
  var mk;
  var pop;
  for(var i=0 ; i<datas.length ; i++) {
    mk = L.marker(
      [datas[i].lat,datas[i].lng],
      {
        title: datas[i].title,
        alt: datas[i].tags[0]
      }
    );
    pop =
    "<h1>"+datas[i].title+"</h1>"
    +"<img width='240px' src='./datas/"+datas[i].photo+"' alt='"+datas[i].title+"' />"
    +"<p>Tags:";
    for (var j=0 ; j<datas[i].tags.length ; j++) {
      if (j > 0) pop+=", ";
      pop += datas[i].tags[j];
    }
    mk.bindPopup(pop);
    points.push(mk);
    mk.addTo(map);
  }
}

function setButtons() {
  var helloPopup = L.popup().setContent('Hello World!');

  L.easyButton('glyphicon-list', function(btn, map){
      helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo( map ); // probably just `map`

  L.easyButton('glyphicon-tags', function(btn, map){
      helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo( map ); // probably just `map`

  L.easyButton('glyphicon-floppy-disk', function(btn, map){
      helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo( map ); // probably just `map`

}

function setSidebar() {
  sidebar = L.control.sidebar('sidebar', {
    position: 'right'
  });
  map.addControl(sidebar);
  sidebar.show();
}
