import * as React from "react"
import { Route } from "react-router"
import AddStallContainer from "./add-stall/AddStall/AddStallContainer"
import AppContainer from "./AppContainer"
import EditStallContainer from "./edit-stall/EditStall/EditStallContainer"
import ElectionChooserContainer from "./elections/ElectionChooser/ElectionChooserContainer"
import PollingPlaceFinderContainer from "./finder/PollingPlaceFinder/PollingPlaceFinderContainer"
import SausageMapContainer from "./map/SausageMap/SausageMapContainer"
import { IStore } from "./redux/modules/reducer"
// import SausagelyticsContainer from "./sausagelytics/Sausagelytics/SausagelyticsContainer"
import AboutPage from "./static-pages/AboutPage/AboutPage"
import MediaPage from "./static-pages/MediaPage/MediaPage"

export default (store: IStore) => {
    return (
        <Route component={AppContainer}>
            <Route path="/elections" components={{ content: ElectionChooserContainer }} />
            <Route path="/search(/:electionName)" components={{ content: PollingPlaceFinderContainer }} />
            {/* <Route path="/sausagelytics(/:electionName)" components={{ content: SausagelyticsContainer }} /> */}
            <Route path="/add-stall" components={{ content: AddStallContainer }} />
            <Route path="/edit-stall" components={{ content: EditStallContainer }} />
            <Route path="/about" components={{ content: AboutPage }} />
            <Route path="/media" components={{ content: MediaPage }} />
            <Route path="/(:electionName)" components={{ content: SausageMapContainer }} />
        </Route>
    )
}
