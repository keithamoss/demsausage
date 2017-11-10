import "es6-promise/auto"
import registerServiceWorker from "./registerServiceWorker"
import "./index.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { createStore, applyMiddleware, Store } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
import { Provider } from "react-redux"
import { Router, browserHistory } from "react-router"
import { syncHistoryWithStore } from "react-router-redux"
import thunkMiddleware from "redux-thunk"
// import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import getRoutes from "./routes"
import { IStore } from "./redux/modules/interfaces"
// const Config: IConfig = require("Config") as any

// declare var DEVELOPMENT: boolean
let Middleware: Array<any> = []

// if ("GOOGLE_ANALYTICS_UA" in Config) {
//     Middleware.push(AnalyticsMiddleware as any)
// }

import reducers from "./redux/modules/reducer"

import { EALGISApiClient } from "./shared/api/EALGISApiClient"
const ealapi = new EALGISApiClient()

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
    reducers,
    composeEnhancers(applyMiddleware(thunkMiddleware.withExtraArgument(ealapi), ...Middleware))
)

const history = syncHistoryWithStore(browserHistory as any, store)

ReactDOM.render(
    <Provider store={store}>
        {/* <Router history={history as any} onUpdate={"GOOGLE_ANALYTICS_UA" in Config ? fireAnalyticsTracking : () => {}}> */}
        <Router history={history as any}>{getRoutes(store as any)}</Router>
    </Provider>,
    document.getElementById("root")
)
registerServiceWorker()
