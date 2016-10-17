export default class AudioRecorder {
//   navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
//     navigator.mozGetUserMedia ||
//     navigator.msGetUserMedia);
  constructor(opts) {
    this.state = this.STATE_PREPARE;
    this.audioContext = opts.audioContext || new AudioContext();
    this.bufferSize = opts.bufferSize || 4096;
    this.localMediaStream = null;
    this.audioBufferArray = [];
    this.STATE_PREPARE = "STATE_PREPARE";
    this.STATE_RECORDING = "STATE_RECORDING"
    this.STATE_FINISHED = "STATE_FINISHED"
  }
  start(localMediaStream){
    if (this.state === this.STATE_RECORDING) {
      throw new Error("state is RECORDING: " + this.state);
    }
    if (!localMediaStream) {
      throw new Error("mediastream is null or undefined");
    }
    this.localMediaStream = localMediaStream;
    var mediaStreamSource =
      this.audioContext.createMediaStreamSource(localMediaStream);
    var scriptProcessor =
      this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
    mediaStreamSource.connect(scriptProcessor);
    this.audioBufferArray = [];
    scriptProcessor.onaudioprocess = (event) => {
        var channel = event.inputBuffer.getChannelData(0);
        this.audioBufferArray.push(new Float32Array(channel));    };
    //この接続でonaudioprocessが起動
    scriptProcessor.connect(this.audioContext.destination);
    this.scriptProcessor = scriptProcessor;
    this.state = this.STATE_RECORDING;
  };
  stop() {
    this.scriptProcessor.disconnect();
    if (this.localMediaStream) {
      var stop = this.localMediaStream.stop;
      stop && stop();
      this.localMediaStream = null;
    }
    this.state = this.STATE_FINISHED;
  };
  getAudioBufferArray() {
    return this.audioBufferArray;
  };
  getAudioBuffer() {
    var buffer = this.audioContext.createBuffer(
      1,
      this.audioBufferArray.length * this.bufferSize,
      this.audioContext.sampleRate
    );
    const channel = buffer.getChannelData(0);
    for (var i = 0, imax = this.audioBufferArray.length; i < imax; i = (i + 1) | 0) {
      for (var j = 0, jmax = this.bufferSize; j < jmax; j = (j + 1) | 0) {
        channel[i * this.bufferSize + j] = this.audioBufferArray[i][j];
      }
    }
    return buffer;
  };
  // window.AudioRecorder = AudioRecorder;
}
