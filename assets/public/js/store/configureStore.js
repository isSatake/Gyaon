import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'
import { composeWithDevTools } from 'redux-devtools-extension' /* Redux開発用ChromeExtension */
import { requestPermission, recorder, uploader } from '../middlewares/recordUpload'

export default function configureStore(preloadState){
  return createStore(
    rootReducer,
    preloadState,
    composeWithDevTools(
      applyMiddleware(
        thunk,
        requestPermission,
        recorder,
        uploader,
      )
    )
  )
}
