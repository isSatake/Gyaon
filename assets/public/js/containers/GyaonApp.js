import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import SoundTable from './SoundTable'
import UserInfo from '../components/UserInfo'
import Recorder from '../components/Recorder'
import { getMuiTheme } from 'material-ui/styles';
import { MuiThemeProvider } from 'material-ui/styles';
import * as gyaonAppActions from '../actions/GyaonAppActions'
import * as recorderActions from '../actions/RecorderActions'
import * as soundTableActions from '../actions/SoundTableActions'
import injectTapEventPlugin from 'react-tap-event-plugin'

//Warning: Unknown prop `onTouchTap`回避
//https://github.com/callemall/material-ui/issues/4758
injectTapEventPlugin()

export const ENDPOINT = window.location.origin
export const GYAON_ID = window.location.pathname.substring(1)

class GyaonApp extends Component {
  constructor(props){
    super(props)
  }
  render(){
    const { gyaonApp, recorder, soundTable, gyaonAppActionBind, recorderActionBind, soundTableActionBind } = this.props
    return(
      <MuiThemeProvider>
        <div>
          <div
            style={{
              position: 'fixed',
              top: '50px',
              left: '50px',
              right: '50px',
              height: '140px',
            }}
            className='header' >
            <UserInfo id={GYAON_ID} />
            <Recorder
              recorder={recorder}
              gyaonApp={gyaonApp}
              action={recorderActionBind} />
          </div>
          <SoundTable
            soundTable={soundTable}
            gyaonAppActionBind={gyaonAppActionBind}
            action={soundTableActionBind} />
        </div>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    gyaonApp: state.gyaonApp,
    recorder: state.recorder,
    soundTable: state.soundTable,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    gyaonAppActionBind: bindActionCreators(gyaonAppActions, dispatch),
    recorderActionBind: bindActionCreators(recorderActions, dispatch),
    soundTableActionBind: bindActionCreators(soundTableActions, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GyaonApp)

//Material-UIのテーマ
//http://qiita.com/usagi-f/items/24418c50faa6a5931ba8
