import {START_EDIT_COMMENT, FINISH_EDIT_COMMENT} from '../actions/GyaonAppActions'

const initialState = {
  isEditingComment: false
};

export const gyaonApp = (state = initialState, action) => {
  switch (action.type) {
    case START_EDIT_COMMENT:
      return Object.assign({}, state, {
        isEditingComment: true
      });
    case FINISH_EDIT_COMMENT:
      return Object.assign({}, state, {
        isEditingComment: false
      });
    default:
      return state
  }
}
