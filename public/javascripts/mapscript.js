$(function() {
  navigator.getUserMedia  = ( navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia );

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
      +     `<audio src="${endpoint}/sounds/${sound.key}" />`
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
    $memo.find("audio")[0].play();

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

  //位置を指定して音声リストを取得
  $.ajax("/map/" + $('#gyaonId').text() + "/location", {
    method: "GET",
    data: {
      "x1": 36,
      "y1": 112,
      "x2": 37,
      "y2": 113
    }
  }).done(function(done) {
    console.log(done);
    // $("#memos").prepend(createMemo(done.endpoint, done.object));
  }).fail(function(e) {
    alert("failed to get sounds");
  });

  // 録音ボタン
  $recordButton.mousedown(function(e) {
    requestPermission(function(localMediaStream) {
      $('#recordButton i').text("mic");
      setTimeout(function(){
        recorder.start(localMediaStream);
        startVolumeMeter();
      }, 50);
    }, alert);
  }).mouseup(function(e) {
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
    formData.append("location_x", 36.5);
    formData.append("location_y", 113);
    formData.append("file", blob, "hoge.wav");
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
  });

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
      }
      break;
      case "mouseleave":
      {
        // stopMeter();
        $this.removeAttr("data-playing");
        audio.pause();
        audio.currentTime = 0;
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
    console.log(`post: ${data.object.key}`);
    $("#memos").prepend(createMemo(data.endpoint, data.object));
  });
  deleteSound.on($('#gyaonId').text(), function (data) {
    console.log(`delete: ${data}`);
    $("[key='" + data + "']").remove();
  });
});
