import * as React from "react"
// import { IndexRoute, Route } from "react-router"
import { Route, IndexRoute } from "react-router"
import AppContainer from "./AppContainer"
import SausageMapContainer from "./map/SausageMap/SausageMapContainer"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
    return (
        <Route path="/" component={AppContainer}>
            {/* Home (main) route */}
            <IndexRoute components={{ content: SausageMapContainer }} />

            {/* Main Routes */}
        </Route>
    )
}
