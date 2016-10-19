import React from 'react'
import Debug from 'debug'
import ReactAudioPlayer from 'react-audio-player'
import formatDate from '../util/formatdate'

const debug = Debug('onmouse-audio:debug')
const error = Debug('onmouse-audio:error')

export default class OnMouseAudio extends ReactAudioPlayer {
  constructor(props){
    super(props)
    this.state = {hovered: false}
    this.date = formatDate(this.props.data.lastmodified)
    this.src = this.props.endPoint + '/sounds/' + this.props.data.key
      debug(this.audioEl.duration)
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
    debug(this.audioEl.duration)
    this.audioEl.play()
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
        <td className={"date"}>{this.date}</td>
        <audio
          className="react-audio-player"
          src={this.src}
          autoPlay={this.props.autoPlay}
          preload={this.props.preload}
          ref={(ref) => this.audioEl = ref}
          onPlay={this.onPlay}
        >
          {incompatibilityMessage}
        </audio>
      </tr>
      )
  }
}
