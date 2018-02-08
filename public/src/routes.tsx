import * as React from "react"
// import { IndexRoute, Route } from "react-router"
import { Route, IndexRoute } from "react-router"
import AppContainer from "./AppContainer"
import SausageMapContainer from "./map/SausageMap/SausageMapContainer"
import PollingPlaceFinderContainer from "./finder/PollingPlaceFinder/PollingPlaceFinderContainer"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
    return (
        <Route path="/" component={AppContainer}>
            <IndexRoute components={{ content: SausageMapContainer }} />
            <Route path="/search" components={{ content: PollingPlaceFinderContainer }} />
            <Route path="/add-stall" components={{ content: SausageMapContainer }} />
        </Route>
    )
}
