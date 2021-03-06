# maplotter
地図にGPX、写真、コメントをプロットするJavaScriptライブラリを開発するためのリポジトリ。
Leafletの各種プラグインの調査と、GeoJSONを調査する。

# 概要
- Leafletで地図描画。デフォルトではOpenStreetMapを利用
- GPXファイルをドラッグ＆ドロップするとログ描画
- 写真をドラッグ＆ドロップすると地図上にプロット。位置情報があればその場所。なければ撮影日時
- 写真や場所にコメントを記載。日時、タグ１(哺乳類、植物、鳥、昆虫など)、タグ２（属）、タグ３（名前）、属性（特定指定外来種、希少種など）、コメント、大きさ、経緯度、公開属性（公開、非公開）を記録
- 地図の脇に写真やコメントを一覧表示
- 指定のタグの場所を表示
- 観察期間の表示(1年を横のバーに12ヶ月で表示して各月の色などで表現)
- 表示期間の操作(1年のバーをクリックして表示月を指定)
- アクセスユーザー管理（管理者、ワークグループ、会員、一般）
- DBに登録
- DBから読み込み
- GeoJSONに出力
- GeoJSONを指定して読み込み

# 構成
- map-plotter.js
    - プロッターを使う時に読み込むJavaScript
    - Webページ内に組み込めるように、描画先のタグのIDを受け取ってその中に描画する。最低サイズは決める。
- leaflet
    - 地図描画に利用
    - [leaflet.bouncemarker](https://github.com/maximeh/leaflet.bouncemarker)
      - [Copyright (c) 2014 Maxime Hadjinlian](https://github.com/maximeh/leaflet.bouncemarker/blob/master/LICENSE.txt)
    - Editable https://github.com/Leaflet/Leaflet.Editable
      - gh-pagesブランチのものはleaflet1.0(beta)用
      - 安定版で動かしたい時は、ブランチをVer0.7に変更して取得
    - 検索ウィンドウ
      - L.UniformControl https://github.com/chriscalip/L.UniformControl
      - uniform.jsなどは、libフォルダーに入っているので、以下を探してコピー
        - lib/uniform/themes/default/css/uniform.default.min.css
        - lib/uniform/jquery.uniform.min.js
        - lib/uniform/themes/default/images フォルダー内の画像を plugins/imagesフォルダーにコピー
        - カテゴリーの表示、非表示のサンプル view-source:http://chriscalip.github.io/L.UniformControl/examples/cluster-by-selected-categories.html
      - 日時指定コントロール http://eonasdan.github.io/bootstrap-datetimepicker/
        - bowerでインストール
        - 必要な読み込みを追加
      - moment.jsが必要
- Bootstrap
    - レイアウトに利用
- OpenStreetMap
    - 最初に利用する地図。印刷をしたいので
- マーカーにバリエーションを持たせるcoryasilva/Leaflet.ExtraMarkers
  - https://github.com/coryasilva/Leaflet.ExtraMarkers

# ファイル
- map-plotter.js
    - アプリを統合したファイル
- マップ描画プラグイン
    - 地図の描画や操作をラッピングしたもの。Leafletのものを用意
