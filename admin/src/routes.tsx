import * as React from "react"
// import { IndexRoute, Route } from "react-router"
import { Route } from "react-router"
import AppContainer from "./AppContainer"
import PollingPlaceEditorContainer from "./polling_places/polling_place_editor/PollingPlaceEditorContainer"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
    return (
        <Route path="/" component={AppContainer}>
            {/* Home (main) route */}
            {/* <IndexRoute components={{ content: Welcome }} /> */}

            {/* Polling Place Routes */}
            <Route path="/election/:electionIdentifier(/:pollingPlaceId)(/edit)" components={{ content: PollingPlaceEditorContainer }} />
        </Route>
    )
}
