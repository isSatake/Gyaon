import React from 'react'
import ReactDOM from 'react-dom'
import GyaonRecorder from './components/gyaon-recorder.js'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }
  render(){
    return(
      <div>
        <GyaonRecorder />
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
)
