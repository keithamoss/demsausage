// import registerServiceWorker from "./registerServiceWorker"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider } from "react-redux"
import { browserHistory, Router } from "react-router"
import { syncHistoryWithStore } from "react-router-redux"
import { applyMiddleware, createStore, Store } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"
// import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import { responsiveStoreEnhancer } from "redux-responsive"
import thunkMiddleware from "redux-thunk"
import "./index.css"
import "./polyfills"
// if ("GOOGLE_ANALYTICS_UA" in Config) {
//     Middleware.push(AnalyticsMiddleware as any)
// }
import reducers, { IStore } from "./redux/modules/reducer"
import getRoutes from "./routes"
import { EALGISApiClient } from "./shared/api/EALGISApiClient"
// const Config: IConfig = require("Config") as any

// declare var DEVELOPMENT: boolean
let Middleware: Array<any> = []

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
        {/* <Router history={history as any} onUpdate={"GOOGLE_ANALYTICS_UA" in Config ? fireAnalyticsTracking : () => {}}> */}
        <Router history={history as any}>{getRoutes(store as any)}</Router>
    </Provider>,
    document.getElementById("root")
)
// registerServiceWorker()
