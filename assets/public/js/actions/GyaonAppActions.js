export const START_EDIT_COMMENT = 'START_EDIT_COMMENT';
export const FINISH_EDIT_COMMENT = 'FINISH_EDIT_COMMENT';

export const startEditComment = () => {
  return {
    type: START_EDIT_COMMENT
  }
};

export const finishEditComment = () => {
  return {
    type: FINISH_EDIT_COMMENT
  }
};
