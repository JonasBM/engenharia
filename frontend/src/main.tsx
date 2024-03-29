import React from 'react'
// import ReactDOM from 'react-dom/client'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'

import store, { persistor } from "./redux/store"

import { BrowserRouter } from "react-router-dom"
import { PersistGate } from "redux-persist/integration/react"
import { Provider } from 'react-redux'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,document.getElementById('root')
)