import React, { Component } from 'react'
import { RecordingStatus } from '../actions/RecorderActions'
import Timer from './Timer'
import Meter from './Meter'
import { GYAON_ID } from '../containers/GyaonApp'
import { FloatingActionButton } from 'material-ui';
import Toggle from 'material-ui/Toggle'
import Mic from 'material-ui/svg-icons/av/mic'
import MicOff from 'material-ui/svg-icons/av/mic-off'
import MicNone from 'material-ui/svg-icons/av/mic-none'

export default class Recorder extends Component {
  constructor(props) {
    super(props)
    this.recordKeyCode = 82 //R key
  }
  //TODO 音量が変化するイベントがあれば、ActionをDispatchしてメーターの描画に使いたい
  componentDidMount(){
    const { action } = this.props
    action.init()
    window.addEventListener('keydown', ::this.handleKeyDown)
    window.addEventListener('keyup', ::this.handleKeyUp)
  }
  switchRecording(){
    const { recorder, action } = this.props
    //クリック時(≠長押し)時はonMouseDownしか発火しない
    if(recorder.recordingStatus === RecordingStatus.RECORDING){
      action.stopRecord()
      action.playPreview()
      navigator.geolocation.getCurrentPosition(function(position) {
        action.uploadSound(GYAON_ID, {lat: position.coords.latitude, lon: position.coords.longitude})
      })
    }else{
      action.startRecord()
    }
  }
  handleKeyDown(e){
    const { recorder, gyaonApp, action } = this.props
    if(recorder.recordingStatus === RecordingStatus.RECORDING || recorder.isKeydown || e.keyCode != this.recordKeyCode || gyaonApp.isEditingComment){
      return
    }
    action.keyDown()
    this.switchRecording()
  }
  handleKeyUp(e){
    const { recorder, gyaonApp, action } = this.props
    if(e.keyCode != this.recordKeyCode || gyaonApp.isEditingComment){
      return
    }
    action.keyUp()
    this.switchRecording()
  }
  onTogglePreRec(e, toggled){
    const { action } = this.props
    action.onTogglePreRec(toggled)
  }
  render() {
    const { recorder, gyaonApp } = this.props
    const toggleStyle = {
      clear: 'left',
      width: '150px',
      paddingTop: '20px'
    }
    const buttonStyle = { float: 'left' }
    let button
    let timer
    let meter
    let togglePreRec
    if(!recorder.canRecord || gyaonApp.isEditingComment ){ /* disable rec button */
      button = (
        <FloatingActionButton
          style={buttonStyle}
          disabled={true}>
          <MicOff />
        </FloatingActionButton>
      )
      togglePreRec = (
        <Toggle
          style={toggleStyle}
          disabled={true}
          label="pre-recording" />
      )
    } else if(recorder.recordingStatus === RecordingStatus.RECORDING){ /* recording */
      button = (
        <FloatingActionButton
          style={buttonStyle}
          onMouseUp={::this.switchRecording}
          backgroundColor={"red"}>
          <Mic />
        </FloatingActionButton>
      )
      togglePreRec = (
        <Toggle
          style={toggleStyle}
          label="pre-recording" />
      )
      meter = (
        <Meter />
      )
      timer = (
        <Timer style={{ float: 'right' }} />
      )
    } else { /* waiting */
      button = (
        <FloatingActionButton
          style={buttonStyle}
          onMouseDown={::this.switchRecording}
          backgroundColor={"red"}>
          <MicNone />
        </FloatingActionButton>
      )
      togglePreRec = (
        <Toggle
          style={toggleStyle}
          label="pre-recording"
          onToggle={::this.onTogglePreRec} />
      )
    }

    return(
      <div>
        {button}
        {meter}
        {timer}
        {togglePreRec}
      </div>
    )
  }
}
