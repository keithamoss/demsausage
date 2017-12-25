import * as React from "react"
// import { IndexRoute, Route } from "react-router"
import { Route } from "react-router"
import AppContainer from "./AppContainer"
import PollingPlaceEditorContainerRoute from "./polling_places/polling_place_editor/PollingPlaceEditorContainerRoute"
import PendingStallsManagerContainer from "./stalls/PendingStallsManager/PendingStallsManagerContainer"
import ElectionsManagerContainer from "./elections/ElectionsManager/ElectionsManagerContainer"
import ElectionEditorContainer from "./elections/ElectionEditor/ElectionEditorContainer"
import ElectionCreatorContainer from "./elections/ElectionEditor/ElectionCreatorContainer"
import ElectionPollingPlaceLoaderContainer from "./elections/ElectionPollingPlaceLoader/ElectionPollingPlaceLoaderContainer"
import PendingStallEditorContainer from "./stalls/PendingStallEditor/PendingStallEditorContainer"
import { IStore } from "./redux/modules/interfaces"

export default (store: IStore) => {
  return (
    <Route path="/" component={AppContainer}>
      {/* Home (main) route */}
      {/* <IndexRoute components={{ content: Welcome }} /> */}

      {/* Elections Routes */}
      <Route path="/elections" components={{ content: ElectionsManagerContainer }} />
      <Route path="/election/new" components={{ content: ElectionCreatorContainer }} />
      <Route path="/election/:electionIdentifier/load_polling_places" components={{ content: ElectionPollingPlaceLoaderContainer }} />
      <Route path="/election/:electionIdentifier" components={{ content: ElectionEditorContainer }} />

      {/* Polling Place Routes */}
      <Route
        path="/election/:electionIdentifier/polling_places(/:pollingPlaceId)(/edit)"
        components={{ content: PollingPlaceEditorContainerRoute }}
      />

      {/* Stalls Routes */}
      <Route path="/stalls" components={{ content: PendingStallsManagerContainer }} />
      <Route path="/stalls(/:stallId)" components={{ content: PendingStallEditorContainer }} />
    </Route>
  )
}
