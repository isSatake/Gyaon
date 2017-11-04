export const RECORDER_INIT = 'RECORDER_INIT'
export const PERMISSION_RESOLVED = 'PERMISSION_RESOLVED'
export const PERMISSION_DENIED = 'PERMISSION_DENIED'
export const START_RECORD = 'START_RECORD'
export const STOP_RECORD = 'STOP_RECORD'
export const START_UPLOAD = 'START_UPLOAD'
export const SUCCEEDED_UPLOAD = 'SUCCEEDED_UPLOAD'
export const FAILED_UPLOAD = 'FAILED_UPLOAD'
export const START_PREVIEW = 'START_PREVIEW'
export const STOP_PREVIEW = 'STOP_PREVIEW' /* プレビュー再生を止めるとき */
export const FINISH_PREVIEW = 'FINISH_PREVIEW' /* プレビュー再生が終わったとき */
export const KEY_DOWN = 'KEY_DOWN'
export const KEY_UP = 'KEY_UP'
export const ON_TOGGLED_PREREC = 'ON_TOGGLED_PREREC'

export const RecordingStatus = {
  STOP: 'STOP',
  RECORDING: 'RECORDING',
  UPLOADING: 'UPLOADING'
}

export const Messages = {
  PROCESSING: 'Uploading ...',
  FAILED: 'Failed to upload sound.'
}

export function init(){
  return {
    type: RECORDER_INIT
  }
}

export function permissionResolved(){
  return {
    type: PERMISSION_RESOLVED
  }
}

export function permissionDenied(){
  return {
    type: PERMISSION_DENIED
  }
}

export function startRecord(){
  return {
    type: START_RECORD
  }
}

export function stopRecord(){
  return {
    type: STOP_RECORD
  }
}

export function uploadSound(id, location){
  return {
    type: START_UPLOAD,
    gyaonId: id,
    location: location
  }
}

export function playPreview(){
  return {
    type: START_PREVIEW
  }
}

export function stopPreview(){
  return {
    type: STOP_PREVIEW
  }
}

export function finishPreview(){
  return {
    type: FINISH_PREVIEW
  }
}

export function keyDown(){
  return {
    type: KEY_DOWN
  }
}

export function keyUp(){
  return {
    type: KEY_UP
  }
}

export function onTogglePreRec(toggled) {
  return {
    type: ON_TOGGLED_PREREC,
    isPreRec: toggled
  }
}
