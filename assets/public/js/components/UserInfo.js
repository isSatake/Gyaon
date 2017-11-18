import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Request from 'superagent'

export default class UserInfo extends Component {
  constructor(props){
    super(props)
    this.state = {
      id: this.props.id
    }
  }

  onClickLtsv(){
    window.prompt('Your ltsv', `https://gyaon.s3-us-west-2.amazonaws.com/${this.state.id}.ltsv`)
  }

  render(){
    const { gyaonAppActionBind } = this.props
    return (
      <div
        style={{
          display: 'flex',
          marginBottom: '20px',
          alignItems: 'center'
        }}>
        <div
          style={{
            fontWeight: '400',
            flexGrow: '18'
          }}>
          your id: {this.state.id}
        </div>
        <RaisedButton
          style={{ flexGrow: '2' }}
          label="GET ltsv"
          onClick={::this.onClickLtsv} />
      </div>
    )
  }
}
