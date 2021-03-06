/**
 * 変数
 */
var map;
/** データのある場所*/
var points = [];
/** 詳細を表示するデータ*/
var sidebar = {};
/** 表示中のデータ配列*/
var dispDatas = [];
/** マーカーのオブジェクト*/
var markerIcons = {};
/** 編集中のデータのインデックス*/
var editIndex = -1;
/** タグリスト。要素にタグ名とレイヤーオブジェクトのオブジェクト*/
var tagList = [];
/** フィルター用のウィンドウオブジェクト*/
var filterForm = {};
/** フィルターフォームの表示フラグ*/
var filterFormVisible = false;

/**
 * Leafletの表示
 */
function initLeaflet(lat, lng) {
  // LeafletのOSM表示
  map = L.map('map',{
    editable: true
  }).setView([lat, lng], 17);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  /** フィルターフォームの作成*/
  filterForm = L.control.window(map, {closeButton: false, position: 'bottomLeft', title: 'Filter'});
  filterForm.on('show', function(){filterFormVisible=true;});
  filterForm.on('hide', function(){filterFormVisible=false;});
}

/**
 * 渡されたデータのタグをチェックして、タグリストを作成する
 */
function makeTagList(datas) {
  for(var i=0 ; i<datas.length ; i++) {
    for (var j=0 ; j<datas[i].tags.length ; j++) {
      addTagList(datas[i].tags[j]);
    }
  }
}

/**
 * 指定のタグがtagListになければ追加する
 */
function addTagList(tag) {
  for (var i=0 ; i<tagList.length ; i++) {
    if (tagList[i].tag === tag) {
      return;
    }
  }
  tagList.push({tag: tag, visible: true});
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

function makeMarkers() {
  markerIcons = {
      STANDARD:   L.ExtraMarkers.icon({
        icon: 'glyphicon-picture',
        markerColor: 'blue',
        iconColor: 'white'
      }),
      EDIT: L.ExtraMarkers.icon({
        icon: 'glyphicon-pencil',
        markerColor: 'yellow',
        iconColor: 'white',
        draggable: true
      })
  };
}

function setMarker(datas) {
  var mk;
  var pop;

  // マーカーを作成
  makeMarkers();

//  L.marker([51.941196,4.512291], {icon: redMarker,}).addTo(map);

  for(var i=0 ; i<datas.length ; i++) {
    mk = L.marker(
      [datas[i].lat,datas[i].lng],
      {
        title: getTitle(datas[i].comment),
        alt: datas[i].tags[0],
        icon: markerIcons.STANDARD
      }
    ).on('click', function() {
      mk.bounce();
    });
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
    if (filterFormVisible) {
      // 表示中だったら隠す
      filterForm.hide();
    }
    else {
      // 非表示だったら表示
      showFilterForm();
    }
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
  dispDatas = datas;
  var dlist = "";//"<div class='container-fluid'>";
  dlist += "<table class='table table-hover table-bordered'>";
  for (var i=0 ; i<datas.length; i++) {
    dlist += "<tr id='inforow"+i+"'>";

    // 画像
    dlist += "<td>";
    dlist += "<img class='data-list-photo' src='./datas/"+datas[i].photo+"' alt='"+getTitle(datas[i].comment)+"' />";
    dlist += "</td>";

    // 情報欄
    dlist += "<td id='info"+i+"'>";

    dlist += getInfoRow(datas,i);

    // 列終わり
    dlist += "</td></tr>";

  }
  dlist += "</table>";
  dlist += "";//"</div>";
  //
  $('#data-list').html(dlist);
  sidebar.show();
}

/**
 * 編集へ
 */
function changeEdit(idx) {
  // 編集中の時は、前の処理をキャンセルするか聞く
  if (editIndex != -1) {
    alert("now editing");
    return;
  }

  var id = "#info"+idx;
  editIndex = idx;
  $(id).html(getInfoEditRow(dispDatas, idx));
  // マーカー変更
  points[idx].setIcon(markerIcons.EDIT);
  points[idx].setZIndexOffset(100);
  points[idx].enableEdit();
  // 画面を中心に
  setCenter(idx);
  // 指定のデータ以外を隠す
  showOnlyInfo(idx);
}

/**
 * 指定のインデックスのデータ以外を全て隠す
 */
function showOnlyInfo(idx) {
  $('#inforow'+idx).show();
  for (var i=0 ; i<datas.length ; i++) {
    if (i==idx) continue;
    $('#inforow'+i).hide();
  }
}

/**
 * 情報パネルに戻る
 */
function backInfo(idx) {
  var id = "#info"+idx;
  $(id).html(getInfoRow(dispDatas, idx));
  points[editIndex].setIcon(markerIcons.STANDARD);
  points[editIndex].setZIndexOffset(0);
  points[editIndex].disableEdit();
  editIndex = -1;
  setVisibleWithFilter();
}

/**
 * 指定の配列の指定のインデックスの詳細を編集する右側のtdタグ内のHTMLを返す
 * @param [] datas データ配列
 * @param idx 作成するデータのインデックス
 */
function getInfoEditRow(datas, idx) {
  // 公開状況とタイトルとコメント
  var dlist = "<div class='form-group'>";
  var accessIcon = "";
  var accessLabel = "公開";
  var accessIcons = [
    "<span class='glyphicon glyphicon-user' aria-hidden='true'></span>",
    "<span class='glyphicon glyphicon-lock' aria-hidden='true'></span>"
  ];

  //// 限定公開(glyphicon-user)
  if (datas[idx].access == "protected") {
      accessIcon = accessIcons[0];
      accessLabel = "限定公開";
  }
  //// 非公開(glyphicon-lock)
  else if (datas[idx].access == "private") {
    accessIcon = accessIcons[1];
    accessLabel = "非公開";
  }

  //// 切り替え
  dlist += "<div class='dropdown'>";
  dlist += "<button class='btn btn-default dropdown-toggle btn-sm' type='button' id='access"+idx+"' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>";
  dlist += accessIcon+accessLabel;
  dlist += "<span class='caret'></span>";
  dlist += "</button>";
  dlist += "<ul class='dropdown-menu' aria-labelledby='access"+idx+"'>";
  dlist += "<li><a href='#'>公開</a></li>";
  dlist += "<li><a href='#'>"+accessIcons[0]+"限定公開</a></li>";
  dlist += "<li><a href='#'>"+accessIcons[1]+"非公開</a></li>";
  dlist += "</ul>";
  dlist += "</div>";
  dlist += "</div>";

  // タイトルとコメント
  dlist += "<textarea class='form-control input-sm' rows='3'>";
  dlist += datas[idx].comment;
  dlist += "</textarea>";

  // 付加情報
  dlist += "<small>";
  // コメント者と日時
  // 入力者と日時
  dlist += "<div>";
  if (datas[idx].hasOwnProperty("author")) {
    dlist += "<input type='text' class='form-control input-sm' placeholder='作成者名' value='"+datas[idx].author+"' />";
  }
  dlist += "<input type='text' class='form-control input-sm' placeholder='2015/10/10 1:2:3' value='"+datas[idx].datetime+"' /></div>";

  // 緯度経度
  dlist += "<div class='form-group row'>";
  dlist += "<label class='col-sm-3 control-label'>緯度</label>";
  dlist += "<div class='col-sm-9'>";
  dlist += "<input type='text' class='form-control input-sm' placeholder='35.151515' value='"+datas[idx].lat+"' />";
  dlist += "</div></div>";

  dlist += "<div class='form-group row'>";
  dlist += "<label class='col-sm-3 control-label'>経度</label>";
  dlist += "<div class='col-sm-9'>";
  dlist += "<input type='text' class='form-control input-sm' placeholder='139.151515' value='"+datas[idx].lng+"' />";
  dlist += "</div></div>";

  // タグ
  dlist += "<div class='form-group row'>";
  dlist += "<label class='col-sm-3 control-label'>tags:</label>";
  dlist += "<div class='col-sm-9'>";
  dlist += "<input type='text' class='form-control input-sm' placeholder='例)カモ 鳥' value='";
  for (var j=0 ; j<datas[idx].tags.length ; j++) {
    if (j>0) {
      dlist += ' ';
    }
    dlist += datas[idx].tags[j];
  }
  dlist += "' /></div></div>";

  // 公開情報

  // ボタン配置
  dlist += "<span class='pull-right'>";
  //// 編集ボタン
  dlist += "<button type='button' class='btn btn-default btn-xs' aria-label='Edit' data-toggle='tooltip' data-placement='right' title='更新'";
  dlist += " onclick='backInfo("+idx+")'>";
  dlist += "<span class='glyphicon glyphicon-save-file' aria-hidden='true'></span>";
  dlist += "</button>";
  //// キャンセルボタン
  dlist += "<button type='button' class='btn btn-default btn-xs' aria-label='Remove' data-toggle='tooltip' data-placement='right' title='キャンセル'";
  dlist += " onclick='backInfo("+idx+")'>";
  dlist += "<span class='glyphicon glyphicon-remove' aria-hidden='true'></span>";
  dlist += "</button>";
  dlist += "</span>";

  dlist += "</div></small>";
  return dlist;
}

/**
 * 指定の配列の指定のインデックスの詳細を描画するためのtrタグで囲んだHTMLを返す
 * @param [] datas データ配列
 * @param idx 作成するデータのインデックス
 */
function getInfoRow(datas, idx) {
  // 公開状況とタイトルとコメント
  var dlist = "<div>";

  //// 限定公開(glyphicon-user)
  if (datas[idx].access == "protected") {
      dlist += "<span class='text-protected glyphicon glyphicon-user' aria-hidden='true'></span>";
  }
  //// 非公開(glyphicon-lock)
  else if (datas[idx].access == "private") {
    dlist += "<span class='text-private glyphicon glyphicon-lock' aria-hidden='true'></span>";
  }
  // タイトル
  dlist += "<strong>"+getTitle(datas[idx].comment)+"</strong></div>";
  // コメント
  dlist += "<div>"+getComment(datas[idx].comment)+"</div>";

  // 付加情報
  dlist += "<small>";
  // コメント者と日時
  // 入力者と日時
  dlist += "<div>";
  if (datas[idx].hasOwnProperty("author")) {
    dlist += "<strong>"+datas[idx].author+"</strong>&nbsp;";
  }
  dlist += datas[idx].datetime+"</div>";

  // 緯度経度
  dlist += "lat,lng:"+datas[idx].lat+", "+datas[idx].lng;

  // タグ
  dlist += "<div>tags:";
  for (var j=0 ; j<datas[idx].tags.length ; j++) {
    dlist += " "+datas[idx].tags[j];
  }
  // ボタン配置
  dlist += "<span class='pull-right'>";
  //// 編集ボタン
  dlist += "<button type='button' class='btn btn-default btn-xs' aria-label='Edit' data-toggle='tooltip' data-placement='right' title='編集'";
  dlist += " onclick='changeEdit("+idx+")'>";
  dlist += "<span class='glyphicon glyphicon-pencil' aria-hidden='true'></span>";
  dlist += "</button>";
  //// 削除ボタン
  dlist += "<button type='button' class='btn btn-default btn-xs' aria-label='Remove' data-toggle='tooltip' data-placement='right' title='削除'>";
  dlist += "<span class='glyphicon glyphicon-trash' aria-hidden='true'></span>";
  dlist += "</button>";
  dlist += "</span>";

  dlist += "</div></small>";

  return dlist;
}

/**
 * 指定のマーカーを画面中央にする
 * @param int idx インデックス
 */
function setCenter(idx) {
  map.panTo([datas[idx].lat,datas[idx].lng]);
}

/**
 * フィルターのチェックを反映する
 */
function toggleFilters() {
  var checked = $(".checkboxFilter:checked");
  var seltags = [];
  var i;
  // タグリストを作成
  for (i=0 ; i<checked.length ; i++) {
    seltags.push($(checked[i]).val());
  }

  // フラグに反映させる
  for (i=0 ; i<tagList.length; i++) {
    tagList[i].visible = ($.inArray(tagList[i].tag, seltags) >= 0);
  }

  // 画面に反映させる
  setVisibleWithFilter();
}

/**
 * 指定のタグのオブジェクトを返す
 * 見つからなかった時はnullを返す
 */
function getTagObject(tag) {
  for (var i=0 ; i<tagList.length;i++) {
    if (tag === tagList[i].tag) {
      return tagList[i];
    }
  }
  return null;
}

/** フィルターのチェック*/
function setVisibleWithFilter() {
  var vis = false;

  // マーカーと詳細の表示設定を行う
  for (i=0 ; i<dispDatas.length ; i++) {
    // タグをチェック
    vis = false;
    for (var j=0 ; j<dispDatas[i].tags.length; j++) {
      var tagdata = getTagObject(dispDatas[i].tags[j]);
      if ((tagdata != null) && (tagdata.visible)) {
        vis = true;
        break;
      }
    }

    // 表示設定
    if (vis) {
      // 表示
      $('#inforow'+i).show();
      points[i].addTo(map);
    }
    else {
      // 非表示
      $('#inforow'+i).hide();
      map.removeLayer(points[i]);
    }
  }
}


/**
 * 検索フォームの表示
 */
function showFilterForm() {
  // 表示内容を作成する
  // 閉じるボタン
  var html = "<div class='titlebar'><a class='close' onclick='filterForm.hide();'>×</a></div>";

  // 情報検索
  html += "<div class='form-group'>";
  html += "<label for='textFilter'>コメント検索</label>";
  html += "<input type='text' class='form-control' id='textFilter' placeholder='タイトルやコメントから検索したいキーワード'>";
  html += "</div>";

  // タグ
  html += "<div class='form-group'>";
  html += "<label for='tagLists'>タグ指定</label>";
  html += "<div id='tagLists'>";
  for (var i=0 ; i<tagList.length ; i++) {
    // 要素を確認
    html += "<label class='checkbox-inline'>";
    html += "<input type='checkbox' class='checkboxFilter' value='"+tagList[i].tag+"' "+(tagList[i].visible ? "checked" : "");
    html += " onclick='toggleFilters()'";
    html += " />"+tagList[i].tag;
    html += "</label>";
  }
  html += "</div>";

  // 期間設定
  html += "<div class='row'>";
  html += "<div class='col-sm-6' id='dateTimeFilterGroup'>";
  html += "<div class='form-group'>";
  html += "<label for='dtStart'>開始指定</label>";
  html += "<div class='input-group date' id='dtStart'>";
  html += "<input type='text' class='form-control' placeholder='2015/11/29 13:00:00' />";
  html += "<span class='input-group-addon'>";
  html += "<span class='glyphicon glyphicon-calendar'></span>";
  html += "</span>";
  html += "</div></div>";
  html += "</div>";

  html += "<div class='col-sm-6'>";
  html += "<div class='form-group'>";
  html += "<label for='dtEnd'>終了指定</label>";
  html += "<div class='input-group date' id='dtEnd'>";
  html += "<input type='text' class='form-control' placeholder='2015/11/29 14:00:00'/>";
  html += "<span class='input-group-addon'>";
  html += "<span class='glyphicon glyphicon-calendar'></span>";
  html += "</span>";
  html += "</div></div></div>";
  html += "</div>";

  // 内容を設定
  filterForm.content(html);

  // 設定
  setDatePicker();

  // 非表示の時は表示
  filterForm.show();
}

/**
 * 日付コントロールを有効にする
 */
function setDatePicker() {
  var fm = "YYYY/M/D H:mm:ss";
  $('#dtStart').datetimepicker({format: fm});
  $('#dtEnd').datetimepicker({
      useCurrent: false, //Important! See issue #1075
      format: fm
  });
  $("#dtStart").on("dp.change", function (e) {
      $('#dtEnd').data("DateTimePicker").minDate(e.date);
  });
  $("#dtEnd").on("dp.change", function (e) {
      $('#dtStart').data("DateTimePicker").maxDate(e.date);
  });
}
