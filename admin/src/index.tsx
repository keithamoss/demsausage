// import registerServiceWorker from "./registerServiceWorker"
import * as createRavenMiddleware from "raven-for-redux"
import * as Raven from "raven-js"
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

if ("REACT_APP_RAVEN_URL" in process.env) {
    Raven.config(process.env.REACT_APP_RAVEN_URL!, {
        environment: process.env.NODE_ENV,
        // @ts-ignore
        site: process.env.REACT_APP_RAVEN_SITE_NAME!,
    }).install()
    Middleware.push(
        createRavenMiddleware(Raven, {
            breadcrumbDataFromAction: (action: any) => {
                return JSON.stringify(action)
            },
        })
    )
}

const api = new EALGISApiClient()

const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
})
const store: Store<IStore> = createStore(
    reducers,
    composeEnhancers(responsiveStoreEnhancer, applyMiddleware(thunkMiddleware.withExtraArgument(api), ...Middleware))
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
