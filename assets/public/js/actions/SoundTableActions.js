import Request from 'superagent'
import { GYAON_ID } from '../containers/GyaonApp'

export const REQUEST_GET_ITEMS = 'REQUEST_GET_ITEMS'
export const SUCCEEDED_GET_ITEMS = 'SUCCEEDED_GET_ITEMS'
export const FAILED_GET_ITEMS = 'FAILED_GET_ITEMS'

export const ADD_LOCAL_ITEM = 'ADD_LOCAL_ITEM'
export const DELETE_LOCAL_ITEM = 'DELETE_LOCAL_ITEM'

export const ON_MOUSE_ENTER = 'ON_MOUSE_ENTER'
export const ON_MOUSE_LEAVE = 'ON_MOUSE_LEAVE'

export const ON_CAN_PLAY = 'ON_CAN_PLAY'
export const PLAY_SOUND = 'PLAY_SOUND'
export const STOP_SOUND = 'STOP_SOUND'

export const START_EDIT_COMMENT = 'START_EDIT_COMMENT'
export const FINISH_EDIT_COMMENT = 'FINISH_EDIT_COMMENT'
export const SUCCEEDED_UPDATE_COMMENT = 'SUCCEEDED_UPDATE_COMMENT'
export const FAILED_UPDATE_COMMENT = 'FAILED_UPDATE_COMMENT'

export const COPY_URL = 'COPY_URL'

export const SUCCEEDED_DELETE_ITEM = 'SUCCEEDED_DELETE_ITEM'
export const FAILED_DELETE_ITEM = 'FAILED_DELETE_ITEM'

export const Messages = {
  PROCESSING: 'Fetching items ...',
  FAILED: 'Failed to get items.',
  SUCCEEDED_UPDATE_COMMENT: 'Updated!',
  FAILED_UPDATE_COMMENT: 'Failed to update.',
  COPIED: 'Copied!',
  FAILED_DELETE_ITEM: 'Failed to delete.'
}


export function requestGetItems(){
  return {
    type: REQUEST_GET_ITEMS
  }
}

export function get() {
  return dispatch => {
    dispatch({ type: REQUEST_GET_ITEMS })
    return Request
      .get('/sounds/' + GYAON_ID)
      .then(res => {
        dispatch({
          type: SUCCEEDED_GET_ITEMS,
          items: res.body.sounds
        })
      })
      .catch(err => dispatch({ type: FAILED_GET_ITEMS }))
  }
}

export function addLocalItem(data) {
  return {
    type: ADD_LOCAL_ITEM,
    data: data
  }
}

export function deleteLocalItem(key) {
  return {
    type: DELETE_LOCAL_ITEM,
    key: key
  }
}

//change background color in component
export function onMouseEnter(index){
  return {
    type: ON_MOUSE_ENTER,
    index: index
  }
}

//change background color in component
export function onMouseLeave(index){
  return {
    type: ON_MOUSE_LEAVE,
    index: index
  }
}

//format in middleware
export function onCanPlay(index, duration){
  return {
    type: ON_CAN_PLAY,
    index: index,
    duration: duration
  }
}

//change background color in component
export function playSound(index){
  return {
    type: PLAY_SOUND,
    index: index
  }
}

//change background color in component
export function stopSound(index){
  return {
    type: STOP_SOUND,
    index: index
  }
}

//コメント入力stateをどうやってGyaonAppに伝える？->middlewareでGyaonAppのActionをdispatch
export function startEditComment(){
  return {
    type: START_EDIT_COMMENT
  }
}

export function finishEditComment(){
  return {
    type: FINISH_EDIT_COMMENT
  }
}

//async POST
//don't mutate state
export function updateComment(key, text){
  return dispatch => {
    return Request
      .post('/comment/' + key)
      .send({ value: text })
      .then(() => dispatch({ type: SUCCEEDED_UPDATE_COMMENT }))
      .catch(() => dispatch({ type: FAILED_UPDATE_COMMENT }))
  }
}

//copy url to clipboard and show message 'copied!'
export function copyUrl(index){
  return {
    type: COPY_URL,
    index: index
  }
}

//async DELETE
//delete component by SoundTable (use middleware)
export function deleteItem(key){
  return dispatch => {
    if(!window.confirm('削除しますか?')){
      return
    }
    return Request
      .delete('/' + key)
      .then(() => dispatch({ type: SUCCEEDED_DELETE_ITEM }))
      .catch(() => dispatch({ type: FAILED_DELETE_ITEM }))
  }
}
