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
  // .memoを追加
  var createMemo = function(fileName, url){
    return $("<li class=\"memo z-depth-1 hoverable waves-effect\"><span class=\"memoTitle\">" + fileName + "</span><div class=\"actions\"><i class=\"deleteButton tiny material-icons\">clear</i><i class=\"copyButton tiny material-icons\">content_copy</i></div><audio src=\"" + url + "\" /></li>");
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
      setTimeout(function(){recorder.start(localMediaStream)}, 50);
    }, alert);
  }).mouseup(function(e) {
    $('#recordButton i').text("mic_none");
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
      $("#memos").prepend(createMemo(done.file, done.url));
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
      }
      break;
      case "mouseleave":
      {
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
    console.log("delete");
    var $memo = $(this).parents('.memo');
    var fileName = $memo.find("span").text();
    $.ajax("/" + fileName, {
      method: "DELETE"
    }).done(function(done) {
      $memo.remove();
      console.log("delete completed");
    }).fail(function(e) {
      alert("delete failed");
    });
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
});
