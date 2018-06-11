import { START_EDIT_COMMENT, FINISH_EDIT_COMMENT } from '../actions/SoundTableActions'

export const comment = store => next => action => {
  switch(action.type){
    case START_EDIT_COMMENT:
      store.dispatch({ type: START_EDIT_COMMENT });
      next(action);
      return;
    case FINISH_EDIT_COMMENT:
      store.dispatch({ type: FINISH_EDIT_COMMENT });
      next(action);
      return;
    default:
      return next(action)
  }
};
