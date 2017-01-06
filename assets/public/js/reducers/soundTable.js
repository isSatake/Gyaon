import update from 'immutability-helper'
import { Messages, DELETE_ITEM, REQUEST_GET_ITEMS, SUCCEEDED_GET_ITEMS, FAILED_GET_ITEMS, ADD_LOCAL_ITEM, DELETE_LOCAL_ITEM, ON_MOUSE_ENTER, ON_MOUSE_LEAVE, ON_CAN_PLAY, PLAY_SOUND, STOP_SOUND, SUCCEEDED_UPDATE_COMMENT, FAILED_UPDATE_COMMENT, COPY_URL, FAILED_DELETE_SOUND } from '../actions/SoundTableActions'

const initialState = {
  isProcessing: false,
  items: [],
  message: null
}

function initializeItem(item) {
  item.isProcessing = true
  item.highlight = false
  item.isPlaying = false
  item.duration = '00:00'
  item.currentTime = 0
  item.message = null
  return item
}

export default function soundTable(state = initialState, action){
  switch(action.type){
    case REQUEST_GET_ITEMS:
      return Object.assign({}, state, {
        isProcessing: true,
        message: Messages.PROCESSING
      })
    case SUCCEEDED_GET_ITEMS:
      const newitem = action.items
      newitem.map(initializeItem)
      return Object.assign({}, state, {
        isProcessing: false,
        items: newitem,
        message: null
      })
    case FAILED_GET_ITEMS:
      return Object.assign({}, state, {
        isProcessing: false,
        message: Messages.FAILED
      })
    case ADD_LOCAL_ITEM: /* TODO socketが切れてたらsocketを介さずに更新したい */
      return Object.assign({}, state, {
        items: [initializeItem(action.data), ...state.items]
      })
    case DELETE_LOCAL_ITEM:
      return Object.assign({}, state, {
        items: state.items.filter(item => item.key !== action.key)
      })
    case ON_MOUSE_ENTER:
      return update(state, {
        items: {
          [action.index]: {
            highlight: {$set: true}
          }
        }
      })
    case ON_MOUSE_LEAVE:
      return update(state, {
        items: {
          [action.index]: {
            highlight: {$set: false}
          }
        }
      })
    case ON_CAN_PLAY:
      return update(state, {
        items: {
          [action.index]: {
            duration: {$set: action.duration}
          }
        }
      })
    case PLAY_SOUND:
      return update(state, {
        items: {
          [action.index]: {
            highlight: {$set: true},
            isPlaying: {$set: true}
          }
        }
      })
    case STOP_SOUND:
      return update(state, {
        items: {
          [action.index]: {
            highlight: {$set: false},
            isPlaying: {$set: false},
            currentTime: {$set: 0}
          }
        }
      })
    case SUCCEEDED_UPDATE_COMMENT:
      return Object.assign({}, state, {
        message: Messages.SUCCEEDED_UPDATE_COMMENT
      })
    case FAILED_UPDATE_COMMENT:
      return Object.assign({}, state, {
        message: Messages.FAILED_UPDATE_COMMENT
      })
    case COPY_URL:
      return Object.assign({}, state, {
        message: Messages.COPIED
      })
    case FAILED_DELETE_SOUND:
      return Object.assign({}, state, {
        message: Messages.FAILED_DELETE_SOUND
      })
    default:
      return state
  }
}
