import React, { Component } from 'react'

  export default class SoundDateRow extends Component {
    constructor(props) {
      super(props)
    }
    render() {
      //TODO format date
      return (
        <tr>
          <td
            style={{ padding: '20px 0 5px 5px' }}
            colSpan='5'>
            {this.props.date}
          </td>
        </tr>
      )
    }
  }
