// This must be the first line in src/index.js
import * as Sentry from '@sentry/browser'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory, Router } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { applyMiddleware, createStore, Store } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { responsiveStoreEnhancer } from 'redux-responsive'
import thunkMiddleware from 'redux-thunk'
import './index.css'
import './polyfills'
import reducers, { IStore } from './redux/modules/reducer'
import sentry from './redux/sentry'
import reportWebVitals from './reportWebVitals'
import getRoutes from './routes'
import { AnalyticsMiddleware, fireAnalyticsTracking } from './shared/analytics/GoogleAnalytics'
import { APIClient } from './shared/api/APIClient'

// const Config: IConfig = require("Config") as any

const Middleware: Array<any> = []

// This should be run as soon as possible
if ('REACT_APP_RAVEN_URL' in process.env) {
  Sentry.init({
    dsn: process.env.REACT_APP_RAVEN_URL,
    environment: process.env.REACT_APP_ENVIRONMENT,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    site: process.env.REACT_APP_RAVEN_SITE_NAME,
    attachStacktrace: true,
  })
  Middleware.push(sentry)
}

if ('REACT_APP_GOOGLE_ANALYTICS_UA' in process.env) {
  Middleware.push(AnalyticsMiddleware as any)
}

const composeEnhancers = composeWithDevTools({
  // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
  reducers,
  composeEnhancers(
    responsiveStoreEnhancer,
    applyMiddleware(thunkMiddleware.withExtraArgument(new APIClient()), ...Middleware)
  )
)

const history = syncHistoryWithStore(browserHistory as any, store)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router
        history={history as any}
        onUpdate={'REACT_APP_GOOGLE_ANALYTICS_UA' in process.env ? fireAnalyticsTracking : undefined}
      >
        {getRoutes(store as any)}
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
// registerServiceWorker()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
