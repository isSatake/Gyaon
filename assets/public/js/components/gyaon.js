import React from 'react'
import Debug from 'debug'
import OnMouseAudio from './onmouse-audio.js'

const debug = Debug('gyaon:debug')
const error = Debug('gyaon:error')

export default class Gyaon extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    return(
      <OnMouseAudio
        endPoint={this.props.endPoint}
        data={this.props.data} />
    )
  }
}
