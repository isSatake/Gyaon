$(function() {
  navigator.getUserMedia  = ( navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia );

  var isSmartPhone        = false;
  if (( navigator.userAgent.indexOf('iPhone') > 0 &&
        navigator.userAgent.indexOf('iPad') == -1) ||
        navigator.userAgent.indexOf('iPod') > 0 ||
        navigator.userAgent.indexOf('Android') > 0) {
    isSmartPhone = true;
    $('head').append('<meta name="viewport" content="width=360" >');
    $('body').append('<link rel="stylesheet" type="text/css" href="../stylesheets/sp.css">');
  }

  var $recordButton       = $("#recordButton");
  var isInputComment      = false;
  var permissionResolved  = false;

  var audioContext        = new AudioContext();
  var exporter            = new AudioExporter();
  var recorder            = new AudioRecorder({ audioContext: audioContext });
  var localMediaStream;

  var volumeMeterCanvas   = $("#volumeMeter");
  var canvasContext       = document.getElementById("volumeMeter").getContext("2d");
  var canvasWidth         = volumeMeterCanvas.attr("width");
  var canvasHeight        = volumeMeterCanvas.attr("height");
  var volumeMeter         = createAudioMeter(audioContext);
  var volumeMeterRafID;
  var playTimeMeterRafID;

  var postSound = io.connect('/post');
  var deleteSound = io.connect('/delete');

  var endPoint;

  var watchPositionId;
  var map;
  var currentPositionMarker;
  var sounds = [];
  var audioElements = [];
  var canPlay = false;


  var soundMarkers = [];
  var markerIcon = "../images/sound.png";
  var playingMarkerIcon = "../images/sound_playing.png";

  // 録音のパーミッションをリクエストする
  var requestPermission = function(success, fail) {
    navigator.getUserMedia({
      video: false,
      audio: true
    }, success, fail);
  };

  // 録音のパーミッションの状態を設定する
  var setPermissionResolved = function(resolved) {
    permissionResolved = resolved;
    if (resolved) {
      $recordButton.removeClass("disabled");
    } else {
      $recordButton.addClass("disabled");
    }
  }

  var toDoubleDigits = function(num){
    num += "";
    if(num.length === 1){
      num = "0" + num;
    }
    return num;
  }
  var formatDate = function(_date){
    var date = new Date(_date);
    var Y = date.getFullYear();
    var M = toDoubleDigits(date.getMonth() + 1);
    var D = toDoubleDigits(date.getDate());
    var h = toDoubleDigits(date.getHours());
    var m = toDoubleDigits(date.getMinutes());
    return `${Y}-${M}-${D} ${h}:${m}`;
  };

  // .memoを追加
  var createMemo = function(endpoint, sound){
    var $memo = $(
        `<tr key="${sound.key}" class="memo">`
      +   `<td class="date">`
      +     `${formatDate(sound.lastmodified)}`
      +     `<audio id="${sound.key}" src="${endpoint}/sounds/${sound.key}" preload="metadata"/>`
      +   `</td>`
      +   `<td class="comment"><input type="text"></td>`
      +   `<td class="delete-button">`
      +     `<i class="deleteButton tiny material-icons">clear</i>`
      +   `</td>`
      +   `<td class="copy-button">`
      +     `<i class="copyButton tiny material-icons">content_copy</i>`
      +   `</td>`
      + `</tr>`
    );

    return $memo;
  }

  //音量メータ描画
  var drawVolumeMeter = function() {
    canvasContext.clearRect(0,0,canvasWidth,canvasHeight);
    if (volumeMeter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";
    canvasContext.fillRect(0, 0, volumeMeter.volume*canvasWidth*1.4, canvasHeight);
    volumeMeterRafID = window.requestAnimationFrame(drawVolumeMeter);
  }
  var startVolumeMeter = function() {
    volumeMeterCanvas.css("visibility", "visible");
    requestPermission(function(localMediaStream){
      mediaStreamSource = audioContext.createMediaStreamSource(localMediaStream);
      mediaStreamSource.connect(volumeMeter);
      drawVolumeMeter();
    }, function(err){
      console.log(err);
    });
  }
  var stopVolumeMeter = function() {
    volumeMeterCanvas.css("visibility", "hidden");
    mediaStreamSource.disconnect(volumeMeter);
    window.cancelAnimationFrame(volumeMeterRafID);
  }
  var drawPlayTimeMeter = function(audioElement, determinateBar) {
    var update = function(){
      determinateBar.css("width", audioElement[0].currentTime / audioElement[0].duration*100 + "%");
      playTimeMeterRafID = window.requestAnimationFrame(update);
    }
    update();
  }

  //url末尾にgyaonIdを挿入
  window.history.replaceState('', '', $('#gyaonId').text());

  // マイクのパーミッションをリクエスト
  requestPermission(function(localMediaStream) {
    setPermissionResolved(true);
  }, function(err) {
    setPermissionResolved(false);
    console.error(err);
  });

  /* 緯度 == y軸 == latitude
   * 経度 == x軸 == longitude
   */
  //GoogleMap関連
  //初期化
  var initMap = function(){
    console.log("initialize Google Map.")
    var opts = {
      zoom: 15,
      center: new google.maps.LatLng(35.388664, 139.427951) //SFC学事
    };
    map = new google.maps.Map(document.getElementById("map"), opts);

    //地図の移動イベント
    map.addListener('idle', function() {
      //表示領域の左下・右上座標を取得
      var swLatlng = map.getBounds().getSouthWest();
      var neLatlng = map.getBounds().getNorthEast();
      // getSoundsByLocation(swLatlng.lng(), swLatlng.lat(), neLatlng.lng(), neLatlng.lat());
    });

    // registerWatchPosition();
  }

  $('#regist').click(function(e){
    registerWatchPosition();
  });

  window.initMap = function(){
    if(map) return;
    initMap();
  }

  if(!navigator.geolocation){
    alert("failed to get location.");
  }

  var registerWatchPosition = function(){
    watchPositionId = navigator.geolocation.watchPosition(onChangePosition, onPositionError, option);
  }

  var onChangePosition = function(pos){
    console.log("onchangeposition");
    if(!map) return;

    var latitude = pos.coords.latitude;
    var longitude = pos.coords.longitude;
    console.log("moved to " + latitude + " " + longitude);
    var latlng = new google.maps.LatLng(latitude, longitude);
    map.panTo(latlng);
    if(!currentPositionMarker){
      currentPositionMarker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map
      });
      return;
    }
    currentPositionMarker.setPosition(latlng);

    //現在位置付近の音声を再生
    if(isSmartPhone){
      //0.00002度で3mくらいらしい
      var radius = 0.00002
      var nearBySounds = sounds.filter(function(sound){
        if (sound.location_x >= longitude - radius &&
            sound.location_x <= longitude + radius &&
            sound.location_y >= latitude - radius &&
            sound.location_y <= latitude + radius){
            return true;
        }
      });
      console.log(nearBySounds);
      //どうやって再生していくか
      //順番に再生できる？
      if(nearBySounds.length > 0){
        // $('recordButton').hover();
        // document.getElementById('aiu').play();
        // document.getElementById(nearBySounds[0].key).play();
        // var key = nearBySounds[0].key;
        // var $tr = $('#memos').find(`tr[key="${key}"]`);
        // var $audio = $tr.find('audio')[0];
        // console.log($audio);
        //   $audio.play();

      }
    }
  }
  var onPositionError = function(err){
    alert("位置情報の利用を許可して下さい");
  }
  var option = {
    enableHighAccuracy: false,
    maximumAge: 3000
  };

  var getAllSoundsAndLoad = function(){
    // document.getElementById('aiu').load();
    $.ajax("/map/sounds/" + $('#gyaonId').text(), {
        method: "GET"
      }).done(function(done) {

        //配列に入れる
        sounds = done.sounds;
        //iterateしてaudioElement作る
        //audioElementの参照を配列に入れる
        //その配列をiterateして全部load()する
        sounds.map(function(sound){
          var $tr = $("#memos").append(createMemo(done.endpoint, sound));
          sound.element = $tr.find('audio')[0];
          sound.element.load();

          //ピンを立てる
          //ピン毎にaudioElementとリンクしたイベントをbindする
          sound.marker = new google.maps.Marker({
            position: new google.maps.LatLng(sound.location_y, sound.location_x),
            map: map,
            icon: markerIcon
          });
          sound.marker.addListener('mouseover', function(){
            sound.element.play();
            $tr.attr("data-playing", true);
            this.setIcon(playingMarkerIcon);
          });
          sound.marker.addListener('mouseout', function(){
            sound.element.pause();
            sound.element.currentTime = 0;
            $tr.removeAttr("data-playing");
            this.setIcon(markerIcon);
          });
        });
        console.log(sounds);
      }).fail(function(e) {
        alert("failed to get sounds.");
      });
  }

  // 録音ボタン
  var startRec = function(){
    requestPermission(function(localMediaStream) {
      $('#recordButton i').text("mic");
      setTimeout(function(){
        recorder.start(localMediaStream);
        startVolumeMeter();
      }, 50);
    }, alert);
  };
  var stopRec = function(){
    $('#recordButton i').text("mic_none");
    recorder.stop();
    stopVolumeMeter();
    var src = audioContext.createBufferSource();
    var buf = recorder.getAudioBuffer();
    src.buffer = buf;
    var blob = exporter.exportBlob(
      recorder.getAudioBufferArray(),
      audioContext.sampleRate
    );
    // file名は使ってない
    var formData = new FormData();
    formData.append("gyaonId", $('#gyaonId').text());
    formData.append("location_x", map.getCenter().lng());
    formData.append("location_y", map.getCenter().lat());
    formData.append("file", blob, "hoge.wav");
    console.log(formData);
    $.ajax("/upload", {
      method: "POST",
      data: formData,
      processData: false,
      contentType: false
    }).done(function(done) {
      console.log(done);
      // $("#memos").prepend(createMemo(done.endpoint, done.object));
    }).fail(function(e) {
      alert("export failed");
    });
    console.log(blob);
  }
  if(isSmartPhone){
    $recordButton.on('touchstart', function(e){
      startRec();
    });
    $recordButton.on('touchend', function(e){
      stopRec();
    });
  }else{
    $recordButton.mousedown(function(e) {
      startRec();
    }).mouseup(function(e) {
      stopRec();
    });
  }

  //Rキーで録音
  var isRec = false;
  $(window).on('keydown keyup', function(e){
    if(e.keyCode != 82 || isInputComment){
      return;
    }
    switch(e.type){
      case 'keydown':
      {
        if(isRec){
          return;
        }
        isRec = true;
        $recordButton.trigger('mousedown');
      }
      break;
      case 'keyup':
      {
        isRec = false;
        $recordButton.trigger('mouseup');
      }
      break;
      default:
    }
  });

  // 録音一覧
  $(document).on("mouseenter mouseleave", ".memo", function(e) {
    var $this = $(this);
    var audio = $this.find("audio")[0];
    var audioUrl = audio.src;
    switch (e.type) {
      case "mouseenter":
      {
        // startMeter();
        audio.play();
        $this.attr("data-playing", true);
        var playingMarker = soundMarkers.filter(function(marker){
          return (marker.key == $this.attr("key"));
        });
        playingMarker[0].marker.setIcon(playingMarkerIcon);
      }
      break;
      case "mouseleave":
      {
        // stopMeter();
        $this.removeAttr("data-playing");
        audio.pause();
        audio.currentTime = 0;
        var playingMarker = soundMarkers.filter(function(marker){
          return (marker.key == $this.attr("key"));
        });
        playingMarker[0].marker.setIcon(markerIcon);
      }
      break;
      default:
    }
  });

  // 削除
  $(document).on("click", ".deleteButton", function(){
    if(window.confirm('削除しますか?')){
      console.log("delete");
      var $memo = $(this).parents('.memo');
      var key = $memo.attr("key");
      $.ajax("/" + key, {
        method: "DELETE"
      }).done(function(done) {
        $memo.remove();
        console.log("delete completed");
      }).fail(function(e) {
        alert("delete failed");
      });
    }
  });

  // URLコピー
  $(document).on("mouseenter mouseleave", ".copyButton", function(e){
    var $this = $(this);
    var $memo = $this.parents('.memo');
    var url = $memo.find("audio").attr("src")
    switch(e.type){
      case "mouseenter":
      {
        $this.attr("data-clipboard-text", url);
      }
      break;
      case "mouseleave":
      {
        $this.removeAttr("data-clipboard-text");
      }
      break;
      default:
    }
  });

  //ファイル名クリック→URLをクリップボードにコピー
  var clipboard = new Clipboard(".copyButton");
  clipboard.on('success', function(e) {
    console.log("audio url copied!");
    Materialize.toast('Copied!', 1000);
  });
  clipboard.on('error', function(e) {
    console.log("audio url copy failed");
  });

  //プログレスバー
  $("audio").on("progress loadeddata play pause", function(e){
    var $this = $(this);
    var $determinate = $this.parent().find('.determinate');
    switch(e.type){
      case "play":
      {
        $determinate.show();
        drawPlayTimeMeter($this, $determinate);
      }
      break;
      case "pause":
      {
        $determinate.hide();
        window.cancelAnimationFrame(playTimeMeterRafID);
      }
      break;
      default:
    }
  });

  //コメント
  $(document).on("focusin focusout", ".comment", function(e){
    if(e.type == "focusin"){
      isInputComment = true;
      return;
    }
    isInputComment = false;
    var $this = $(this);
    var key = $this.parent().attr('key');
    var text = $this.find('input')[0].value;
    $.ajax(`/comment/${key}`, {
      method: "POST",
      data: { "value": text }
    }).done(function(done) {
      console.log(done);
    }).fail(function(e) {
      alert("save failed");
    });
  });

  //アップロード,削除されたら同期
  postSound.on($('#gyaonId').text(), function (data) {
    var key = data.object.key;
    var sound = data.object;
    console.log(`post: ${key}`);
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(sound.location_y, sound.location_x),
      map: map,
      icon: markerIcon
    });
    marker.addListener('mouseover', function(){
      var $tr = $('#memos').find(`tr[key="${sound.key}"]`);
      var $audio = $tr.find('audio')[0];
      $audio.play();
      $tr.attr("data-playing", true);
      this.setIcon(playingMarkerIcon);
    });
    marker.addListener('mouseout', function(){
      var $tr = $('#memos').find(`tr[key="${sound.key}"]`);
      var $audio = $tr.find('audio')[0];
      $audio.pause();
      $audio.currentTime = 0;
      $tr.removeAttr("data-playing");
      this.setIcon(markerIcon);
    });
    soundMarkers.push({
      key: key,
      marker: marker
    });
    $("#memos").prepend(createMemo(data.endpoint, sound));
  });

  deleteSound.on($('#gyaonId').text(), function (data) {
    console.log(`delete: ${data}`);
    $("[key='" + data + "']").remove();
    //TODO マーカーも消す
  });

  $('#tracking').on("change", function(e){
    switch($(this).prop('checked')){
      case true:
      {
        getAllSoundsAndLoad();
        registerWatchPosition();
      }
      break;
      case false:
      {

      }
      break;
      default:
    }
  });
});
