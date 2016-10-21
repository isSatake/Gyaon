/*
Gyaonコンポーネントのリストを管理する
リロード時にまとめて音声を取得
  constructor?
  http://qiita.com/musclemikiya/items/e0b87dabc61fbb69e7ef
  Array.mapつかう
socket.ioでアップロード時にその音声を取得
*/

import React from 'react'
import Debug from 'debug'
import Request from 'superagent'
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
  render(){
    const nodes = this.state.sounds.map((sound) => {
      return(
        <GyaonAudio
          endPoint={this.state.endPoint}
          data={sound}
        />
      )
    })

    return(
      <table
        id={'gyaonContainer'}
        style={{
          borderCollapse: 'collapse',
          marginTop: '20px',
          width: '100%'
        }}>
        <tbody>
          {nodes}
        </tbody>
      </table>
    )
  }
}
