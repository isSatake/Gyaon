import React from 'react'
import ReactDOM from 'react-dom'
import Root from './containers/Root'
import Perf from 'react-addons-perf'

//TODO: redux-devtools-extensionをつかう

window.Perf = Perf

ReactDOM.render(
  <Root />,
  document.getElementById('container')
)
