import {combineReducers} from 'redux'
import {gyaonApp} from './gyaonApp'
import {recorder} from './recorder'
import {soundTable} from './soundTable'

export const rootReducer = combineReducers({
  gyaonApp,
  recorder,
  soundTable,
});
