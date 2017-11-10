import * as React from "react"
// import { IndexRoute, Route } from "react-router"
import { Route } from "react-router"
import App from "./App"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
    return (
        <Route path="/" component={App}>
            {/* Home (main) route */}
            {/* <IndexRoute components={{ content: Welcome }} /> */}
        </Route>
    )
}
