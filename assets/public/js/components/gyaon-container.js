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
import Gyaon from './gyaon'

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
      .then(onInit)
      .catch(error)
  }
  onInit(data){
    this.setState({
      sounds: data.list
    })
  }
  render(){
    const nodes = this.state.sounds.map((sound) => {
      return <Gyaon data={sound} />
    })

    return(
      <div>
        {nodes}
      </div>
    )
  }
}
