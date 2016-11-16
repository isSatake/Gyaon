import React from 'react'
import ReactDOM from 'react-dom'
import Cookie from 'cookie-cutter'
import { getMuiTheme } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui/styles';
import GyaonContainer from './components/gyaon-container.js'
import GyaonRecorder from './components/gyaon-recorder.js'

class App extends React.Component {
  constructor(props){
    super(props)
    this.gyaonId = window.location.pathname.substring(1);
  }
  render(){
    return(
      <MuiThemeProvider>
        <div style={{ padding: '50px' }}>
          <p>
            id: {this.gyaonId}
          </p>
          <GyaonRecorder gyaonId={this.gyaonId}/>
          <GyaonContainer gyaonId={this.gyaonId}/>
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
