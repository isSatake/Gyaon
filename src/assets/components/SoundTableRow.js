import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { grey200 } from 'material-ui/styles/colors'
import Clear from 'material-ui/svg-icons/content/clear'
import Copy from 'material-ui/svg-icons/content/content-copy'
import ReactAudioPlayer from 'react-audio-player'
import Snackbar from 'material-ui/Snackbar'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import asString from 'date-format'

import { ENDPOINT } from '../containers/GyaonApp'

export default class SoundTableRow extends ReactAudioPlayer {
  constructor(props) {
    super(props);
    this.audioEl;
    this.prevComment;
    this.comment
  }
  shouldComponentUpdate = (nextProps, nextState) => {
    return this.props.object !== nextProps.object;
  };
  onMouseEnter = () => {
    const { index, action } = this.props;
    action.onMouseEnter(index);
    action.playSound(index);
    this.play()
  };
  onMouseLeave = () => {
    const { index, action } = this.props;
    console.log(`SoundTableRow onMouseLeave`);
    action.onMouseLeave(index);
    action.stopSound(index);
    this.pause()
  };
  onCanPlay = () => {
    //set audio duration
    const { index, action } = this.props;
    const durationSec = Math.round(this.audioEl.duration);
    const sec = durationSec % 60;
    const min = Math.round(durationSec / 60);
    const displaySec = sec < 10 ? `0${sec}` : sec;
    const displayMin = min < 10 ? `0${min}` : min;
    action.onCanPlay(index, displayMin + ':' + displaySec)
  };
  play = () => {
    this.audioEl.play()
  };
  pause = () => {
    this.audioEl.pause();
    this.audioEl.currentTime = 0
  };
  finishEditComment = () => {
    if(this.prevComment === this.comment){
      return
    }
    const { action, gyaonAppActionBind, object } = this.props;
    action.updateComment(object.name, this.comment);
    gyaonAppActionBind.finishEditComment()
  };
  deleteItem = () => {
    const { object, action } = this.props;
    action.deleteItem(object.name)
  };
  copyUrl = () => {
    const { index, action } = this.props;
    action.copyUrl(index)
  };
  render = () => {
    //TODO render soundTableRow.message as tool tip
    const { index, action, gyaonAppActionBind, object } = this.props;
    const backgroundColor = object.highlight ? grey200 : 'white'; /* TODO フェードしたい */
    const buttonTdStyle = { width: '35px' }; /* tdのstyle */
    const iconStyle = { width: '15px', height: '15px' }; /* SVGアイコンの大きさ */
    const iconButtonStyle = { width: '35px', height: '35px', padding: '6px' }; /* アイコンを入れるボタン */
    const src = ENDPOINT + '/sound/' + object.name;
    const date = new Date(object.lastmodified);
    this.prevComment = object.comment;
    return (
      //ReactAudioPlayerからcontrolsだけ消した
      <tr
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        style={{
          backgroundColor: backgroundColor,
          transition: 'background-color .25s ease',
          cursor: 'pointer',
          fontSize: '20px'
        }}>
        <audio
          className="react-audio-player"
          src={src}
          preload="metadata"
          ref={(ref) => this.audioEl = ref}
          onCanPlay={this.onCanPlay}>
        </audio>
        <td
          style={{
            width: '160px',
            padding: '5px'
           }}
          className={"date"}>
          {asString('yyyy-MM-dd hh:mm', date)}
        </td>
        <td
          style={{ padding: '5px 20px 5px 20px' }}
          className={"comment"}>
          <TextField
            name={"comment-text-field"}
            fullWidth={true}
            defaultValue={object.comment}
            onChange={(text) => this.comment = text.target.value}
            onFocus={gyaonAppActionBind.startEditComment}
            onBlur={this.finishEditComment} />
        </td>
        <td
          className={"duration"}
          style={{
            width: '50px',
            padding: '5px 10px 5px 5px'
           }}>
          {object.duration}
        </td>
        <td
          style={buttonTdStyle}>
          <IconButton
            className={"delete-button"}
            iconStyle={iconStyle}
            style={iconButtonStyle}
            onClick={this.deleteItem}
            tooltip="delete">
            <Clear />
          </IconButton>
        </td>
        <CopyToClipboard
          text={src}>
          <td
            style={buttonTdStyle}
            className={"copy-button"}>
            <IconButton
              className={"copy-button"}
              iconStyle={iconStyle}
              style={iconButtonStyle}
              onClick={this.copyUrl}
              tooltip="copy URL">
              <Copy />
            </IconButton>
            </td>
        </CopyToClipboard>
      </tr>
    )
  }
}
