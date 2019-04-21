// This must be the first line in src/index.js
import "./polyfills"

import * as Sentry from "@sentry/browser"

// This should be run as soon as possible
if ("REACT_APP_RAVEN_URL" in process.env) {
    Sentry.init({
        dsn: process.env.REACT_APP_RAVEN_URL,
        environment: process.env.REACT_APP_ENVIRONMENT,
        // @ts-ignore
        site: process.env.REACT_APP_RAVEN_SITE_NAME,
    })
}

import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { browserHistory, Router } from "react-router"
import { syncHistoryWithStore } from "react-router-redux"
import { applyMiddleware, createStore, Store } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { responsiveStoreEnhancer } from "redux-responsive"
import thunkMiddleware from "redux-thunk"
import "./index.css"
// import { getEnvironment, eAppEnv } from "./redux/modules/app"
import reducers, { IStore } from "./redux/modules/reducer"
import getRoutes from "./routes"
import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import { APIClient } from "./shared/api/APIClient"
import sentry from "./redux/sentry"
// const Config: IConfig = require("Config") as any

let Middleware: Array<any> = []

if ("REACT_APP_RAVEN_URL" in process.env) {
    Middleware.push(sentry)
}

if ("REACT_APP_GOOGLE_ANALYTICS_UA" in process.env) {
    Middleware.push(AnalyticsMiddleware as any)
}

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
    reducers,
    composeEnhancers(responsiveStoreEnhancer, applyMiddleware(thunkMiddleware.withExtraArgument(new APIClient()), ...Middleware))
)

const history = syncHistoryWithStore(browserHistory as any, store)

ReactDOM.render(
    <Provider store={store}>
        <Router history={history as any} onUpdate={"REACT_APP_GOOGLE_ANALYTICS_UA" in process.env ? fireAnalyticsTracking : undefined}>
            {getRoutes(store as any)}
        </Router>
    </Provider>,
    document.getElementById("root")
)
// registerServiceWorker()
