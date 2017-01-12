import React, { Component } from 'react'

//TODO ちゃんとdbを計算する
export default class Meter extends Component {
  constructor(props){
    super(props)
    this.state = {
      rms: 0
    }
    this.audioContext
    this.scriptProcessor
    this.prevLevel
  }
  componentDidMount(){
    this.audioContext = new AudioContext()
    const BUFFER_SIZE = 2048

    navigator.getUserMedia({
      video: false,
      audio: true
    }, (localMediaStream) => {
      const mediaStreamSource = this.audioContext.createMediaStreamSource(localMediaStream)
      this.scriptProcessor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1)
      mediaStreamSource.connect(this.scriptProcessor)
      this.scriptProcessor.onaudioprocess = (event) => {
        const channel = event.inputBuffer.getChannelData(0)
        var sum = 0
        channel.forEach((value) => {
          sum += value * value
        })
        this.setState({ rms: Math.sqrt(sum / BUFFER_SIZE) })
      }
      this.scriptProcessor.connect(this.audioContext.destination) //いる？
    }, (err) => {
      throw new Error('Failed to initialize meter.')
    })
  }
  componentWillUnmount(){
    this.scriptProcessor.disconnect()
    this.scriptProcessor.onaudioprocess = null
    this.audioContext.close()
  }
  render(){
    const panel = []
    const level = Math.floor(this.state.rms * 100) + 10
    const divs = Math.max(level, this.prevLevel * 0.99)
    this.prevLevel = level
    let backgroundColor = 'green'
    if(divs > 60){
      backgroundColor = 'red'
    }
    const split = (
      <div
        style={{
          backgroundColor: backgroundColor,
          width: '3px',
          height: '100%',
          marginRight: '2px',
          float: 'left'
        }} />
    )
    for(var i = 0; i < divs; i++){
      panel.push(split)
    }
    return (
      <div
        style={{
          height: '30px',
          marginLeft: '70px',
          paddingTop: '17px'
        }}>
        {panel}
      </div>
    )
  }
}
