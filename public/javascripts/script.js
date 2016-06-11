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
      $('i').text("mic");
      setTimeout(function(){recorder.start(localMediaStream)}, 50);
    }, alert);
  }).mouseup(function(e) {
    $('i').text("mic_none");
    recorder.stop();
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
      var memo = $("<li class=\"memo\">" + done.file + "<div class=\"deleteButton\"></div><audio src=\"" + done.url + "\" /></li>");
      $("#memos").prepend(memo);
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
        audio.play();
        $this.attr("data-playing", true);
        $this.attr("data-clipboard-text", audioUrl);
      }
      break;
      case "mouseleave":
      {
        $this.removeAttr("data-playing");
        $this.removeAttr("data-clipboard-text");
        audio.pause();
        audio.currentTime = 0;
      }
      break;
      default:
    }
  });
  $(document).on("click", ".deleteButton", function(){
    console.log("del");
    var $this = $(this);
    var fileName = $this.parent().text();
    $.ajax("/" + fileName, {
      method: "DELETE"
    }).done(function(done) {
      $this.parent().remove();
      console.log(done);
    }).fail(function(e) {
      alert("delete failed");
    });
  });
  //ファイル名クリック→URLをクリップボードにコピー
  var clipboard = new Clipboard(".memo");
  clipboard.on('success', function(e) {
    console.log("audio url copied!");
  });
  clipboard.on('error', function(e) {
    console.log("audio url copy failed");
  });
});
