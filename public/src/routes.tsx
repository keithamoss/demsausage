import * as React from "react"
import { Route } from "react-router"
import AppContainer from "./AppContainer"
import SausageMapContainer from "./map/SausageMap/SausageMapContainer"
import PollingPlaceFinderContainer from "./finder/PollingPlaceFinder/PollingPlaceFinderContainer"
import AddStallContainer from "./add-stall/AddStall/AddStallContainer"
import SausagelyticsContainer from "./sausagelytics/Sausagelytics/SausagelyticsContainer"
import AboutPage from "./static-pages/AboutPage/AboutPage"
import MediaPage from "./static-pages/MediaPage/MediaPage"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
    return (
        <Route component={AppContainer}>
            <Route path="/search(/:electionName)" components={{ content: PollingPlaceFinderContainer }} />
            <Route path="/sausagelytics(/:electionName)" components={{ content: SausagelyticsContainer }} />
            <Route path="/add-stall" components={{ content: AddStallContainer }} />
            <Route path="/about" components={{ content: AboutPage }} />
            <Route path="/media" components={{ content: MediaPage }} />
            <Route path="/(:electionName)" components={{ content: SausageMapContainer }} />
        </Route>
    )
}
