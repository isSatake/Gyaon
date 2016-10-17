import React from 'react'
import ReactDOM from 'react-dom'
import { getMuiTheme } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui/styles';
import GyaonRecorder from './components/gyaon-recorder.js'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }
  render(){
    return(
      <MuiThemeProvider>
        <div>
          <GyaonRecorder />
        </div>
      </MuiThemeProvider>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('container')
)

//Material-UIのテーマ
//http://qiita.com/usagi-f/items/24418c50faa6a5931ba8
