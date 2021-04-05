import * as React from 'react'
import { Route } from 'react-router'
import AddStallContainer from './add-stall/AddStall/AddStallContainer'
import AppContainer from './AppContainer'
import EditStallContainer from './edit-stall/EditStall/EditStallContainer'
import ElectionChooserContainer from './elections/ElectionChooser/ElectionChooserContainer'
import PollingPlaceFinderContainer from './finder/PollingPlaceFinder/PollingPlaceFinderContainer'
import SausageMapContainer from './map/SausageMap/SausageMapContainer'
import PollingPlacePermalinkContainer from './polling_places/PollingPlacePermalink/PollingPlacePermalinkContainer'
import { IStore } from './redux/modules/reducer'
import SausagelyticsContainer from './sausagelytics/Sausagelytics/SausagelyticsContainer'
import SausagelyticsContainerV1 from './sausagelytics/Sausagelytics_v1/SausagelyticsContainer_v1'
import AboutPage from './static-pages/AboutPage/AboutPage'
import MediaPage from './static-pages/MediaPage/MediaPage'

const routes = (store: IStore) => {
  return (
    <Route component={AppContainer}>
      <Route path="/elections" components={{ content: ElectionChooserContainer }} />
      <Route path="/search(/:electionName)" components={{ content: PollingPlaceFinderContainer }} />
      <Route path="/sausagelytics(/:electionName)" components={{ content: SausagelyticsContainer }} />
      <Route path="/sausagelytics_v1(/:electionName)" components={{ content: SausagelyticsContainerV1 }} />
      <Route path="/add-stall" components={{ content: AddStallContainer }} />
      <Route path="/edit-stall" components={{ content: EditStallContainer }} />
      <Route path="/about" components={{ content: AboutPage }} />
      <Route path="/media" components={{ content: MediaPage }} />
      <Route path="/(:electionName)/stalls/(:stallId)" components={{ content: PollingPlacePermalinkContainer }} />
      <Route path="/(:electionName)/polling_places/(:ecId)" components={{ content: PollingPlacePermalinkContainer }} />
      <Route
        path="/(:electionName)/polling_places/(:name)/(:premises)/(:state)"
        components={{ content: PollingPlacePermalinkContainer }}
      />
      <Route path="/(:electionName)" components={{ content: SausageMapContainer }} />
    </Route>
  )
}

export default routes
