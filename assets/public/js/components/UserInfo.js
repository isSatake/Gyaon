import React, { Component } from 'react'
import TextField from 'material-ui/TextField'
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
            width: 'auto'
          }}
          name={"scrapbox-title-field"}
          fullWidth={true}
          value={this.state.scrapbox}
          onFocus={gyaonAppActionBind.startEditComment}
          onChange={::this.onChangeScrapbox}
          onBlur={::this.onFinishEditComment} />
      </div>
    )
  }
}
