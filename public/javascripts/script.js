$(function() {
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);
  var $recordButton = $("#recordButton");
  var permissionResolved = false;
  var audioContext = new AudioContext();
  var exporter = new AudioExporter();
  var recorder = new AudioRecorder({
    audioContext: audioContext
  });
  var localMediaStream;
  var volumeMeterCanvas = $("#volumeMeter");
  var canvasContext = document.getElementById("volumeMeter").getContext("2d");
  var canvasWidth = volumeMeterCanvas.attr("width");
  var canvasHeight = volumeMeterCanvas.attr("height");
  var volumeMeter = createAudioMeter(audioContext);
  var volumeMeterRafID;
  var playTimeMeterRafID;
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
  // .memoを追加
  var createMemo = function(endpoint, sound){
    return $(
        `<li class="memo z-depth-1 hoverable waves-effect" key="${sound.key}">`
      +   `<span class="memoTitle">${sound.lastmodified}</span>`
      +     `<div class="actions">`
      +       `<i class="deleteButton tiny material-icons">clear</i>`
      +       `<i class="copyButton tiny material-icons">content_copy</i>`
      +     `</div>`
      +   `<audio src="${endpoint + sound.key}" />`
      + `</li>`
    );
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
  // マイクのパーミッションをリクエスト
  requestPermission(function(localMediaStream) {
    setPermissionResolved(true);
  }, function(err) {
    setPermissionResolved(false);
    console.error(err);
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
    src.connect(audioContext.destination);
    src.start();
    var blob = exporter.exportBlob(
      recorder.getAudioBufferArray(),
      audioContext.sampleRate
    );
    // file名は使ってない
    var formData = new FormData();
    formData.append("file", blob, "hoge.wav");
    $.ajax("/upload", {
      method: "POST",
      data: formData,
      processData: false,
      contentType: false
    }).done(function(done) {
      console.log(done);
      $("#memos").prepend(createMemo(done.endpoint, done.object));
    }).fail(function(e) {
      alert("export failed");
    });
    console.log(blob);
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
    var $indeterminate = $this.parent().find('.indeterminate');
    switch(e.type){
      case "progress":
      {
        $determinate.hide();
        $indeterminate.show();
      }
      break;
      case "loadeddata":
      {
        $determinate.hide();
        $indeterminate.hide();
      }
      break;
      case "play":
      {
        $determinate.show();
        $indeterminate.hide();
        drawPlayTimeMeter($this, $determinate);
      }
      break;
      case "pause":
      {
        $determinate.hide();
        $indeterminate.hide();
        window.cancelAnimationFrame(playTimeMeterRafID);
      }
      break;
      default:
    }
  });
});
