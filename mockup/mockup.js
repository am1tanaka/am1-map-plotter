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

/** コメントからタイトルを取り出して返す
 * コメントの1行目がタイトル。改行がない場合は全体がタイトル
 */
function getTitle(comm) {
  return comm.split("\n")[0].replace(/\r/g,"").trim();
}

/**
 * コメントからコメントのみを取り出す。改行はbrタグに変換
 */
function getComment(comm) {
  var lines = comm.replace(/\r/g,"").split("\n");
  // 1行の時はコメントなし
  if (lines.length <= 1) {
    return "";
  }
  // 改行をbrタグに変換して返す
  lines.shift();
  return lines.join("<br/>");
}

function setMarker(datas) {
  var mk;
  var pop;
  for(var i=0 ; i<datas.length ; i++) {
    mk = L.marker(
      [datas[i].lat,datas[i].lng],
      {
        title: getTitle(datas[i].comment),
        alt: datas[i].tags[0]
      }
    );
    pop =
    "<h1>"+getTitle(datas[i].comment)+"</h1>"
    +"<img width='240px' src='./datas/"+datas[i].photo+"' alt='"+getTitle(datas[i].comment)+"' />"
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
    sidebar.toggle();
  }).addTo( map ); // probably just `map`

  L.easyButton('glyphicon-search', function(btn, map){
      helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo( map ); // probably just `map`

  L.easyButton('glyphicon-floppy-disk', function(btn, map){
      helloPopup.setLatLng(map.getCenter()).openOn(map);
  }).addTo( map ); // probably just `map`

}

/**　渡されたデータの内容をサイドバーに列挙して、出力*/
function setSidebar(datas) {
  var authdate = "";
  sidebar = L.control.sidebar('data-list', {
    position: 'right'
  });
  map.addControl(sidebar);

  // データを列挙
  var dlist = "";//"<div class='container-fluid'>";
  dlist += "<table class='table table-hover table-bordered'>";
  for (var i=0 ; i<datas.length; i++) {
    dlist += "<tr>";

    // 画像
    dlist += "<td>";
    dlist += "<img class='data-list-photo' src='./datas/"+datas[i].photo+"' alt='"+getTitle(datas[i].comment)+"' />";
    dlist += "</td>";

    // 情報欄
    dlist += "<td>";

    // 公開状況とタイトルとコメント
    dlist += "<div>";

    //// 限定公開(glyphicon-user)
    if (datas[i].access == "protected") {
        dlist += "<span class='text-protected glyphicon glyphicon-user' aria-hidden='true'></span>";
    }
    //// 非公開(glyphicon-lock)
    else if (datas[i].access == "private") {
      dlist += "<span class='text-private glyphicon glyphicon-lock' aria-hidden='true'></span>";
    }
    // タイトル
    dlist += "<strong>"+getTitle(datas[i].comment)+"</strong></div>";
    // コメント
    dlist += "<div>"+getComment(datas[i].comment)+"</div>";

    // 付加情報
    dlist += "<small>";
    // コメント者と日時
    // 入力者と日時
    dlist += "<div>";
    if (datas[i].hasOwnProperty("author")) {
      dlist += "<strong>"+datas[i].author+"</strong>&nbsp;";
    }
    dlist += datas[i].datetime+"</div>";

    // 緯度経度
    dlist += "lat,lng:"+datas[i].lat+", "+datas[i].lng;

    // タグ
    dlist += "<div>tags:";
    for (var j=0 ; j<datas[i].tags.length ; j++) {
      dlist += " "+datas[i].tags[j];
    }
    dlist += "</div></small>";

    // データ終わり
    dlist += "</td></tr>";
  }
  dlist += "</table>";
  dlist += "";//"</div>";
  //
  $('#data-list').html(dlist);
  sidebar.show();
}
