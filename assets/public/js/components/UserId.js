import React, { Component } from 'react'

export default class UserId extends Component {
  constructor(props){
    super(props)
    this.state = {
      id: this.props.id
    }
  }
  render(){
    return (
      <div
        style={{
          marginBottom: '20px',
          fontWeight: '400'
        }}>
        your id: {this.state.id}
      </div>
    )
  }
}
