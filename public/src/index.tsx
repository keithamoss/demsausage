import "es6-promise/auto"
// import registerServiceWorker from "./registerServiceWorker"
import "./index.css"
import "./polyfills"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createStore, applyMiddleware, Store } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { Provider } from "react-redux"
import { Router, browserHistory } from "react-router"
import { syncHistoryWithStore } from "react-router-redux"
import thunkMiddleware from "redux-thunk"
import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import * as Raven from "raven-js"
import * as createRavenMiddleware from "raven-for-redux"
import { responsiveStoreEnhancer } from "redux-responsive"
import getRoutes from "./routes"
import { getEnvironment, eAppEnv } from "./redux/modules/app"
import { IStore } from "./redux/modules/interfaces"
// const Config: IConfig = require("Config") as any

let Middleware: Array<any> = []

if (getEnvironment() === eAppEnv.PROD && "REACT_APP_RAVEN_URL" in process.env) {
    Raven.config(process.env.REACT_APP_RAVEN_URL!).install()
    Middleware.push(createRavenMiddleware(Raven))
}

if ("REACT_APP_GOOGLE_ANALYTICS_UA" in process.env) {
    Middleware.push(AnalyticsMiddleware as any)
}

import reducers from "./redux/modules/reducer"

import { EALGISApiClient } from "./shared/api/EALGISApiClient"
const ealapi = new EALGISApiClient()

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
    reducers,
    composeEnhancers(responsiveStoreEnhancer, applyMiddleware(thunkMiddleware.withExtraArgument(ealapi), ...Middleware))
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
