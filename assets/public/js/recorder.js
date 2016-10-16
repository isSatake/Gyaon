(function() {
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

  function AudioRecorder(opts) {
    var o = this;
    o.state = AudioRecorder.STATE_PREPARE;
    o.audioContext = opts.audioContext || new AudioContext();
    o.bufferSize = opts.bufferSize || 4096;
    o.localMediaStream = null;
    o.audioBufferArray = [];
  };
  AudioRecorder.STATE_PREPARE = "STATE_PREPARE";
  AudioRecorder.STATE_RECORDING = "STATE_RECORDING";
  AudioRecorder.STATE_FINISHED = "STATE_FINISHED";
  AudioRecorder.prototype.start = function(localMediaStream) {
    var o = this;
    console.log(o);
    if (o.state === AudioRecorder.STATE_RECORDING) {
      throw new Error("state is RECORDING: " + o.state);
    }
    if (!localMediaStream) {
      throw new Error("mediastream is null or undefined");
    }
    o.localMediaStream = localMediaStream;
    var mediaStreamSource =
      o.audioContext.createMediaStreamSource(localMediaStream);
    var scriptProcessor =
      o.audioContext.createScriptProcessor(o.bufferSize, 1, 1);
    mediaStreamSource.connect(scriptProcessor);
    o.audioBufferArray = [];
    scriptProcessor.onaudioprocess = function(event) {
        var channel = event.inputBuffer.getChannelData(0);
        o.audioBufferArray.push(new Float32Array(channel));    };
    //この接続でonaudioprocessが起動
    scriptProcessor.connect(o.audioContext.destination);
    o.scriptProcessor = scriptProcessor;
    o.state = AudioRecorder.STATE_RECORDING;
  };
  AudioRecorder.prototype.stop = function() {
    var o = this;
    o.scriptProcessor.disconnect();
    if (o.localMediaStream) {
      var stop = o.localMediaStream.stop;
      stop && stop();
      o.localMediaStream = null;
    }
    o.state = AudioRecorder.STATE_FINISHED;
  };
  AudioRecorder.prototype.getAudioBufferArray = function() {
    var o = this;
    return o.audioBufferArray;
  };
  AudioRecorder.prototype.getAudioBuffer = function() {
    var o = this;
    var buffer = o.audioContext.createBuffer(
      1,
      o.audioBufferArray.length * o.bufferSize,
      o.audioContext.sampleRate
    );
    var channel = buffer.getChannelData(0);
    for (var i = 0, imax = o.audioBufferArray.length; i < imax; i = (i + 1) | 0) {
      for (var j = 0, jmax = o.bufferSize; j < jmax; j = (j + 1) | 0) {
        channel[i * o.bufferSize + j] = o.audioBufferArray[i][j];
      }
    }
    return buffer;
  };
  window.AudioRecorder = AudioRecorder;
}).call(this);
