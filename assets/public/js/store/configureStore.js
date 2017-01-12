import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'
import { composeWithDevTools } from 'redux-devtools-extension' /* Redux開発用ChromeExtension */
import { requestPermission, recorder, uploader } from '../middlewares/recordUpload'

export default function configureStore(preloadState){
  if (process.env.NODE_ENV === 'production') {
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
  return createStore(
    rootReducer,
    preloadState,
    compose(
      applyMiddleware(
        thunk,
        requestPermission,
        recorder,
        uploader,
      )
    )
  )
}
