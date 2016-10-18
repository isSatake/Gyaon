import React from 'react'
import Debug from 'debug'
import { FloatingActionButton } from 'material-ui';
import Mic from 'material-ui/svg-icons/av/mic'
import MicOff from 'material-ui/svg-icons/av/mic-off'
import MicNone from 'material-ui/svg-icons/av/mic-none'
import Request from 'superagent'
import AudioExporter from '../exporter'
import AudioRecorder from '../recorder'
import Timer from '../timer'

const debug = Debug('gyaon-recorder:debug')
const error = Debug('gyaon-recorder:error')

export default class GyaonRecorder extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      recording: false,
      buttonDisabled: false
    }
    this.gyaonId = this.props.gyaonId

    debug(this.gyaonId)

    navigator.getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia);

    this.permissionResolved = false;
    this.audioContext = new AudioContext()
    this.exporter = new AudioExporter()
    this.recorder = new AudioRecorder({
      audioContext: this.audioContext
    })

    this.requestPermission(
      (localMediaStream) => {
      this.localMediaStream = localMediaStream
      this.setPermissionResolved(true)
    }, (err) => {
      this.setPermissionResolved(false)
      error(err)
      alert(err)
    })

    //これが必要だった
    this.onUpload = ::this.onUpload
  }
  requestPermission(success, fail) {
    navigator.getUserMedia({
      video: false,
      audio: true
    }, success, fail)
  }
  setPermissionResolved(resolved) {
    this.permissionResolved = resolved;
    this.setState({buttonDisabled: !resolved})
  }
  switchRecording(){
    //クリック時(≠長押し)時はonMouseDownしか発火しない
    if(this.state.recording){
      debug("recording stop")
      this.recorder.stop()
      this.setState({
        recording: false,
        buttonDisabled: true
      })
      const blob = this.exporter.exportBlob(
        this.recorder.getAudioBufferArray(),
        this.audioContext.sampleRate
      );
      debug(blob)

      //確認再生
      const src = this.audioContext.createBufferSource()
      const buf = this.recorder.getAudioBuffer()
      src.buffer = buf
      src.connect(this.audioContext.destination)
      src.start();

      //アップロード
      const formData = new FormData()
      formData.append("file", blob, "hoge.wav")
      Request
        .post('/upload/' + this.gyaonId)
        .set('form')
        .send(formData)
        .then(this.onUpload)
        .catch(error)

    }else{
      debug("recording start")
      const mediaStreamSource = this.audioContext.createMediaStreamSource(this.localMediaStream);
      setTimeout(() => {
        this.recorder.start(this.localMediaStream);
        // startVolumeMeter();
        this.setState({recording: true})
      }, 50);
    }
  }
  onUpload(data){
    debug("onUpload")
    const url = data.body.endpoint + '/' + data.body.object.key
    debug(url)
    // this.props.onUpload(url)
    this.setState({buttonDisabled: false})
  }
  render(){
    const text = this.state.recording ? "Stop" : "Rec"
    if(this.state.buttonDisabled){
      return (
        <FloatingActionButton
          disabled={true}>
          <MicOff />
        </FloatingActionButton>
      )
    }
    if(this.state.recording){
      return (
        <div>
          <FloatingActionButton
            onMouseUp={::this.switchRecording}
            backgroundColor={"red"}>
            <Mic />
          </FloatingActionButton>
          <Timer />
        </div>
      )
    }
    return (
      <FloatingActionButton
        onMouseDown={::this.switchRecording}
        backgroundColor={"red"}>
        <MicNone />
      </FloatingActionButton>
    )
  }
}
