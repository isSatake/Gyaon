export const RECORDER_INIT = 'RECORDER_INIT';
export const PERMISSION_RESOLVED = 'PERMISSION_RESOLVED';
export const PERMISSION_DENIED = 'PERMISSION_DENIED';
export const START_RECORD = 'START_RECORD';
export const STOP_RECORD = 'STOP_RECORD';
export const START_UPLOAD = 'START_UPLOAD';
export const SUCCEEDED_UPLOAD = 'SUCCEEDED_UPLOAD';
export const FAILED_UPLOAD = 'FAILED_UPLOAD';
export const START_PREVIEW = 'START_PREVIEW';
export const STOP_PREVIEW = 'STOP_PREVIEW'; /* プレビュー再生を止めるとき */
export const FINISH_PREVIEW = 'FINISH_PREVIEW'; /* プレビュー再生が終わったとき */
export const KEY_DOWN = 'KEY_DOWN';
export const KEY_UP = 'KEY_UP';
export const ON_TOGGLED_PREREC = 'ON_TOGGLED_PREREC';

export const RecordingStatus = {
  STOP: 'STOP',
  RECORDING: 'RECORDING',
  UPLOADING: 'UPLOADING'
};

export const Messages = {
  PROCESSING: 'Uploading ...',
  FAILED: 'Failed to upload sound.'
};

export const init = () => {
  return {
    type: RECORDER_INIT
  }
};

export const permissionResolved = () => {
  return {
    type: PERMISSION_RESOLVED
  }
};

export const permissionDenied = () => {
  return {
    type: PERMISSION_DENIED
  }
};

export const startRecord = () => {
  return {
    type: START_RECORD
  }
};

export const stopRecord = () => {
  return {
    type: STOP_RECORD
  }
};

export const uploadSound = (id, location) => {
  return {
    type: START_UPLOAD,
    gyaonId: id,
    location: location
  }
};

export const playPreview = () => {
  return {
    type: START_PREVIEW
  }
};

export const stopPreview = () => {
  return {
    type: STOP_PREVIEW
  }
};

export const finishPreview = () => {
  return {
    type: FINISH_PREVIEW
  }
};

export const keyDown = () => {
  return {
    type: KEY_DOWN
  }
};

export const keyUp = () => {
  return {
    type: KEY_UP
  }
};

export const onTogglePreRec = (toggled) => {
  return {
    type: ON_TOGGLED_PREREC,
    isPreRec: toggled
  }
};
