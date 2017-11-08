import React, { Component } from 'react'
import io from 'socket.io-client'
import SoundDateRow from '../components/SoundDateRow'
import SoundTableRow from '../components/SoundTableRow'
import Paper from 'material-ui/Paper'
import { GYAON_ID } from './GyaonApp'

export default class SoundTable extends Component {
  constructor(props) {
    super(props)

    //watch gyaon DB
    const { action } = this.props
    action.get()
    const postSound = io.connect('/post');
    const deleteSound = io.connect('/delete');
    postSound.on(GYAON_ID, function (data) {
      action.addLocalItem(data.object)
    })
    deleteSound.on(GYAON_ID, function (key) {
      action.deleteLocalItem(key)
    })
  }
  render() {
    //TODO 更新中かどうか示すインジゲータを置く
    //push item per day
    const { soundTable, gyaonAppActionBind, action } = this.props
    let rows = []
    let lastDate = null
    if(soundTable.items){
      soundTable.items.forEach((item, index) => {
        rows.push(
          <SoundTableRow
            index={index}
            key={item.key}
            action={action}
            gyaonAppActionBind={gyaonAppActionBind}
            object={item} />
        )
      })
    }

    return (
      <Paper
        style={{
          position: 'absolute',
          top: '250px',
          bottom: '50px',
          left: '50px',
          right: '50px',
          overflowY: 'scroll',
          padding: '20px'
        }}>
        <table
          id={'gyaonContainer'}
          style={{
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            width: '100%'
          }}>
          <tbody>{rows}</tbody>
        </table>
      </Paper>
    )
  }
}

//https://facebook.github.io/react/docs/thinking-in-react.html
