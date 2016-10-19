import React from 'react'
import Debug from 'debug'
import ReactAudioPlayer from 'react-audio-player'
import formatDate from '../util/formatdate'

const debug = Debug('onmouse-audio:debug')
const error = Debug('onmouse-audio:error')

export default class OnMouseAudio extends ReactAudioPlayer {
  constructor(props){
    super(props)
    this.state = {
      hovered: false,
      duration: {
        sec: NaN,
        min: NaN
      }
    }
    this.date = formatDate(this.props.data.lastmodified)
    this.src = this.props.endPoint + '/sounds/' + this.props.data.key
  }
  onMouseEnter(){
    this.setState({hovered: true})
    this.play()
  }
  onMouseLeave(){
    this.setState({hovered: false})
    this.pause()
  }
  play(){
    this.audioEl.play()
  }
  onCanPlay(){
    const durationSec = Math.round(this.audioEl.duration)
    const sec = durationSec % 60
    const min = Math.round(durationSec / 60)
    const displaySec = sec < 10 ? `0${sec}` : sec
    const displayMin = min < 10 ? `0${min}` : min
    this.setState({
      duration: {
        sec: displaySec,
        min: displayMin
      }
    })
  }
  pause(){
    this.audioEl.pause()
    this.audioEl.currentTime = 0
  }
  render(){
    const incompatibilityMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    )
    return (
      //ReactAudioPlayerからcontrolsだけ消した
      <tr
        onMouseEnter={::this.onMouseEnter}
        onMouseLeave={::this.onMouseLeave}
        style={this.props.style}
      >
        <audio
          className="react-audio-player"
          src={this.src}
          autoPlay={this.props.autoPlay}
          preload={this.props.preload}
          ref={(ref) => this.audioEl = ref}
          onPlay={this.onPlay}
          onCanPlay={::this.onCanPlay}
        >
          {incompatibilityMessage}
        </audio>
        <td className={"date"}>{this.date}</td>
        <td className={"duration"}>{this.state.duration.min}:{this.state.duration.sec}</td>
      </tr>
      )
  }
}
