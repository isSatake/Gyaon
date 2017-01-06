import React, { Component } from 'react'

/*
  面倒臭いのでReducerは使わない
*/

export default class Timer extends Component {
  constructor(props){
    super(props)
    this.state = {
      sec: 0,
      min: 0
    }
    this.timerId
  }
  componentWillUnmount(){
    clearTimeout(this.timerId)
  }
  tick(){
    //長押しすると2秒飛びになってしまう
    let sec = this.state.sec + 1
    if(sec == 60){
      sec = 0
      this.countMin()
      return
    }
    this.setState({ sec: sec })
  }
  countMin(){
    const min = this.state.min + 1
    this.setState({
      sec: 0,
      min: min
    })
  }
  render(){
    this.timerId = setTimeout(::this.tick, 1000)
    const {sec, min} = this.state
    const displaySec = sec < 10 ? `0${sec}` : sec
    const displayMin = min < 10 ? `0${min}` : min
    return <div style={this.props.style}>{displayMin}:{displaySec}</div>
  }
}
