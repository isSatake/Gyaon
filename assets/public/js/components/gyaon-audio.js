import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import Debug from 'debug'
import { grey200 } from 'material-ui/styles/colors'
import Clear from 'material-ui/svg-icons/content/clear'
import Copy from 'material-ui/svg-icons/content/content-copy'
import ReactAudioPlayer from 'react-audio-player'
import Request from 'superagent'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'
import formatDate from '../util/formatdate'

const debug = Debug('gyaon-audio:debug')
const error = Debug('gyaon-audio:error')

export default class GyaonAudio extends ReactAudioPlayer {
  constructor(props){
    super(props)
    this.state = {
      comment: this.props.data.comment,
      hovered: false
    }
    this.buttonStyle = {width: '15px'}
    this.date = formatDate(this.props.data.lastmodified)
    this.key = this.props.data.key
    this.src = this.props.endPoint + '/sounds/' + this.key
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
      duration: displayMin + ':' + displaySec,
      open: false
    })
  }
  pause(){
    this.audioEl.pause()
    this.audioEl.currentTime = 0
  }
  onEditComment(){
    Request
      .post('/comment/' + this.key)
      .send({ value: this.comment })
      .then(() => {
        this.setState({ comment: this.comment })
      })
      .catch(error)
  }
  deleteAudio(){
    //実際にElementを消すのはcontainerがやる
    Request
      .delete('/' + this.key)
      .then(debug('delete!'))
      .catch(error)
  }
  onCopy(){
    this.setState({ open: true })
  }
  render(){
    const incompatibilityMessage = this.props.children || (
      <p>Your browser does not support the <code>audio</code> element.</p>
    )
    this.backgroundColor = this.state.hovered ? grey200 : 'white'
    return (
      //ReactAudioPlayerからcontrolsだけ消した
      <tr
        onMouseEnter={::this.onMouseEnter}
        onMouseLeave={::this.onMouseLeave}
        style={{
          backgroundColor: this.backgroundColor,
          cursor: 'pointer'
        }}>
        <audio
          className="react-audio-player"
          src={this.src}
          autoPlay={this.props.autoPlay}
          preload="metadata"
          ref={(ref) => this.audioEl = ref}
          onPlay={this.onPlay}
          onCanPlay={::this.onCanPlay}>
          {incompatibilityMessage}
        </audio>
        <td className={"date"}>{this.date}</td>
        <td className={"comment"}>
          <TextField
            defaultValue={this.state.comment}
            onChange={(text) => {
              this.comment = text.target.value
            }}
            onBlur={::this.onEditComment} />
        </td>
        <td
          className={"duration"}
          style={{ width: '50px' }}>
          {this.state.duration}
        </td>
        <td
          className={"delete-button"}
          onClick={::this.deleteAudio}>
          <Clear style= {this.buttonStyle} />
        </td>
        <CopyToClipboard
          text={this.src}
          onCopy={::this.onCopy}>
          <td className={"copy-button"}>
            <Copy style={this.buttonStyle} />
            <Snackbar
              open={this.state.open}
              message="URL opied!"
              style={{ width: '200px'}}
            />
          </td>
        </CopyToClipboard>
      </tr>
      )
  }
}
