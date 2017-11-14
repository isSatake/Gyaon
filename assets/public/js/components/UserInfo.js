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
    this.prevScrapbox = ''

    Request
      .get('/info/' + this.props.id)
      .then(res => {
        this.setState({
          scrapbox: res.body[0].scrapbox
        })
        this.prevScrapbox = res.body[0].scrapbox
      })
      .catch(err => console.error(err))
  }

  onChangeScrapbox(text){
    this.setState({
      scrapbox: text.target.value
    })
  }

  onFinishEditComment(){
    const { gyaonAppActionBind } = this.props
    gyaonAppActionBind.finishEditComment()

    if(this.prevScrapbox === this.state.scrapbox){
      return
    }

    Request
      .post('/scrapbox/' + this.state.id)
      .send({ title: this.state.scrapbox })
      .then(res => {
        this.prevScrapbox = this.state.scrapbox
      })
      .catch(err => console.error(err))
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
        <div
          style={{
            fontWeight: '400',
            flexGrow: '1'
          }}>
          scrapbox:
        </div>
        <TextField
          style={{
            flexGrow: '1',
            width: 'auto',
            marginLeft: '20px',
            marginRight: '20px'
          }}
          name={"scrapbox-title-field"}
          fullWidth={true}
          value={this.state.scrapbox}
          onFocus={gyaonAppActionBind.startEditComment}
          onChange={::this.onChangeScrapbox}
          onBlur={::this.onFinishEditComment} />
        <RaisedButton
          style={{ flexGrow: '2' }}
          label="GET ltsv"
          onClick={::this.onClickLtsv} />
      </div>
    )
  }
}
