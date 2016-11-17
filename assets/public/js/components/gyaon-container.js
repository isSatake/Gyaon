/*
Gyaonコンポーネントのリストを管理する
リロード時にまとめて音声を取得
  constructor?
  http://qiita.com/musclemikiya/items/e0b87dabc61fbb69e7ef
  Array.mapつかう
socket.ioでアップロード時にその音声を取得
*/

import React from 'react'
import update from 'react-addons-update'
import Debug from 'debug'
import Request from 'superagent'
import io from 'socket.io-client'
import GyaonAudio from './gyaon-audio'

const debug = Debug('gyaon-container:debug')
const error = Debug('gyaon-container:error')

export default class GyaonContainer extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      sounds: [],
    }
    this.gyaonId = this.props.gyaonId
    this.postSound = io.connect('/post')
    this.deleteSound = io.connect('/delete')

    this.getSounds = ::this.getSounds
    this.getSounds()
  }
  componentDidMount(){
    debug(this.postSound)
    this.postSound.on(this.gyaonId, ::this.addSound)
    this.deleteSound.on(this.gyaonId, this.getSounds)
  }
  getSounds(){
    debug("aaaaa getSOUNDS")
    Request
      .get('/sounds/' + this.gyaonId)
      .then(::this.onInit)
      .catch(error)
  }
  onInit(data){
    debug(data)
    /**********************************
      data: {
        body: {
          endpoint: {},
          sounds: [
            0: {
              key: String,
              lastmodified: Date,
              name: String,
              user: String
            },
            1: {}, ...
          ]
        }
      }
     **********************************/
    this.setState({
      endPoint: data.body.endpoint,
      sounds: data.body.sounds
    })
  }
  addSound(data){
    this.setState({sounds: update(this.state.sounds, {$unshift: [data.object]})})
  }
  deleteSound(data){
    // debug("aaaaaaaaaaaaaa")
    // getSounds()
  }
  startEditComment(){
    this.props.startEditComment()
  }
  finishEditComment(){
    this.props.finishEditComment()
  }
  render(){
    //先頭の要素のみ描画
    const s = this.state.sounds[0]
    debug("aaaa")
    debug(s)
    const gyaonaudio = <GyaonAudio
      endPoint={this.state.endPoint}
      data={s}
      startEditComment={::this.startEditComment}
      finishEditComment={::this.finishEditComment}
    />
    return(
      <table
        id={'gyaonContainer'}
        style={{
          borderCollapse: 'collapse',
          marginTop: '20px',
          width: '100%'
        }}>
        <tbody>
        </tbody>
      </table>
    )

    // const nodes = this.state.sounds.map((sound) => {
    //   return(
    //     <GyaonAudio
    //       endPoint={this.state.endPoint}
    //       data={sound}
    //       startEditComment={::this.startEditComment}
    //       finishEditComment={::this.finishEditComment}
    //     />
    //   )
    // })
    //
    // return(
    //   <table
    //     id={'gyaonContainer'}
    //     style={{
    //       borderCollapse: 'collapse',
    //       marginTop: '20px',
    //       width: '100%'
    //     }}>
    //     <tbody>
    //       {nodes}
    //     </tbody>
    //   </table>
    // )
  }
}
