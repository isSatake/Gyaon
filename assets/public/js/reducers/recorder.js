import { Messages, RecordingStatus, PERMISSION_RESOLVED, PERMISSION_DENIED, START_RECORD, STOP_RECORD, START_UPLOAD, SUCCEEDED_UPLOAD, FAILED_UPLOAD, START_PREVIEW, STOP_PREVIEW, FINISH_PREVIEW, KEY_DOWN, KEY_UP, ON_TOGGLED_PREREC } from '../actions/RecorderActions'

const initialState = {
  canRecord: false,
  isPreRec: false,
  recordingStatus: RecordingStatus.STOP,
  isPreview: false,
  isKeyDown: false,
  message: null
}

export default function recorder(state = initialState, action){
  switch(action.type){
    case PERMISSION_RESOLVED:
      return Object.assign({}, state, {
        canRecord: true
      })
    case PERMISSION_DENIED:
      return Object.assign({}, state, {
        canRecord: false
      })
    case START_RECORD:
      return Object.assign({}, state, {
        recordingStatus: RecordingStatus.RECORDING
      })
    case STOP_RECORD:
      return Object.assign({}, state, {
        recordingStatus: RecordingStatus.STOP
      })
    case START_UPLOAD:
      return Object.assign({}, state, {
        recordingStatus: RecordingStatus.UPLOADING,
        message: Messages.PROCESSING
      })
    case SUCCEEDED_UPLOAD:
      return Object.assign({}, state, {
        recordingStatus: RecordingStatus.STOP
      })
    case FAILED_UPLOAD:
      return Object.assign({}, state, {
        recordingStatus: RecordingStatus.STOP,
        message: Messages.FAILED
      })
    case START_PREVIEW:
      return Object.assign({}, state, {
        isPreview: true
      })
    case STOP_PREVIEW:
      return Object.assign({}, state, {
        isPreview: false
      })
    case FINISH_PREVIEW:
      return Object.assign({}, state, {
        isPreview: false
      })
    case KEY_DOWN:
      return Object.assign({}, state, {
        isKeyDown: true
      })
    case KEY_UP:
      return Object.assign({}, state, {
        isKeyDown: false
      })
    case ON_TOGGLED_PREREC:
      return Object.assign({}, state, {
        isPreRec: action.isPreRec
      })
    default:
      return state
  }
}
