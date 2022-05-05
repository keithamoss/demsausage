import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { ePollingPlaceFinderInit, getAPIBaseURL, getBaseURL, setPollingPlaceFinderMode } from '../../redux/modules/app'
import { getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import {
  clearMapToSearch,
  IMapFilterOptions,
  IMapSearchResults,
  setSausageNearMeSearchGeocodePlaceResult,
} from '../../redux/modules/map'
import { fetchPollingPlacesByIds, IMapPollingPlaceFeature, IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { gaTrack } from '../../shared/analytics/GoogleAnalytics'
import { searchPollingPlacesByGeolocation } from '../../shared/geolocation/geo'
import { IGoogleGeocodeResult } from '../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete'
import SausageMap from './SausageMap'

interface IRouteProps {
  electionName: string
}

interface IOwnProps {
  params: IRouteProps
}

interface IProps extends IOwnProps {}

interface IStoreProps {
  elections: Array<IElection>
  currentElection: IElection
  defaultElection: IElection
  embeddedMap: boolean
  geolocationSupported: boolean
  mapSearchResults: IMapSearchResults | null
}

interface IDispatchProps {
  onGeolocationComplete: Function
  fetchQueriedPollingPlaces: Function
  onOpenFinderForAddressSearch: Function
  onOpenFinderForGeolocation: Function
  onClearMapSearch: Function
}

interface IStateProps {
  waitingForGeolocation: boolean
  queriedPollingPlaces: Array<IPollingPlace>
  mapFilterOptions: IMapFilterOptions
}

const getPageTitle = (election: IElection | undefined) =>
  election !== undefined ? `Democracy Sausage | ${election.name}` : 'Democracy Sausage'

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
class SausageMapContainer extends React.Component<TComponentProps, IStateProps> {
  static muiName = 'SausageMapContainer'

  static pageTitle = 'Democracy Sausage'

  static pageBaseURL = ''

  onOpenFinderForAddressSearch: Function

  onOpenFinderForGeolocation: Function

  constructor(props: TComponentProps) {
    super(props)

    this.state = { waitingForGeolocation: false, queriedPollingPlaces: [], mapFilterOptions: {} }

    this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
    this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
    this.onWaitForGeolocation = this.onWaitForGeolocation.bind(this)
    this.onGeolocationComplete = this.onGeolocationComplete.bind(this)
    this.onGeolocationError = this.onGeolocationError.bind(this)
    this.onClickMapFilterOption = this.onClickMapFilterOption.bind(this)
    this.onOpenFinderForAddressSearch = props.onOpenFinderForAddressSearch.bind(this)
    this.onOpenFinderForGeolocation = props.onOpenFinderForGeolocation.bind(this)

    gaTrack.event({
      category: 'SausageMapContainer',
      action: 'geolocationSupported',
      value: props.geolocationSupported ? 1 : 0,
    })
  }

  onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, queriedPollingPlaces: pollingPlaces })
  }

  onClearQueriedPollingPlaces() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, queriedPollingPlaces: [] })
  }

  onWaitForGeolocation() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, waitingForGeolocation: true })
  }

  onGeolocationComplete(position: any /* Position */, place: IGoogleGeocodeResult, locationSearched: string) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, waitingForGeolocation: false })

    this.props.onGeolocationComplete(this.props.currentElection, position, place, locationSearched)
  }

  onGeolocationError() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, waitingForGeolocation: false })
  }

  onClickMapFilterOption(option: keyof IMapFilterOptions) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const state = !(option in this.state.mapFilterOptions && this.state.mapFilterOptions[option] === true)
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, mapFilterOptions: { ...this.state.mapFilterOptions, [option]: state } })
  }

  render() {
    const {
      currentElection,
      embeddedMap,
      geolocationSupported,
      fetchQueriedPollingPlaces,
      mapSearchResults,
      onClearMapSearch,
    } = this.props
    const { waitingForGeolocation, queriedPollingPlaces, mapFilterOptions } = this.state
    return (
      <React.Fragment>
        <Helmet>
          <title>{getPageTitle(currentElection)}</title>

          {/* Open Graph / Facebook / Twitter */}
          <meta property="og:url" content={`${getBaseURL()}/${getURLSafeElectionName(currentElection)}`} />
          <meta property="og:title" content={getPageTitle(currentElection)} />
          <meta property="og:image" content={`${getAPIBaseURL()}/0.1/map_image/${currentElection.id}/`} />
        </Helmet>

        <SausageMap
          currentElection={currentElection}
          embeddedMap={embeddedMap}
          waitingForGeolocation={waitingForGeolocation}
          queriedPollingPlaces={queriedPollingPlaces}
          geolocationSupported={geolocationSupported}
          mapSearchResults={mapSearchResults}
          mapFilterOptions={mapFilterOptions}
          onQueryMap={async (features: Array<IMapPollingPlaceFeature>) => {
            const pollingPlaceIds: Array<number> = features.map((feature: IMapPollingPlaceFeature) => feature.getId())
            const pollingPlaces = await fetchQueriedPollingPlaces(currentElection, pollingPlaceIds)
            this.onSetQueriedPollingPlaces(pollingPlaces)
          }}
          onCloseQueryMapDialog={() => this.onClearQueriedPollingPlaces()}
          onOpenFinderForAddressSearch={this.onOpenFinderForAddressSearch}
          onOpenFinderForGeolocation={this.onOpenFinderForGeolocation}
          onClearMapSearch={onClearMapSearch}
          onClickMapFilterOption={this.onClickMapFilterOption}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: IStore, _ownProps: IProps): IStoreProps => {
  const { app, elections, map } = state

  return {
    elections: elections.elections,
    currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
    embeddedMap: app.embedded_map,
    geolocationSupported: app.geolocationSupported,
    mapSearchResults: map.search,
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    onGeolocationComplete: (
      currentElection: IElection,
      _position: any /* Position */,
      place: IGoogleGeocodeResult,
      _locationSearched: string
    ) => {
      dispatch(setSausageNearMeSearchGeocodePlaceResult(place))

      browserHistory.push(`/search/${getURLSafeElectionName(currentElection)}`)
    },
    fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
      gaTrack.event({
        category: 'SausageMapContainer',
        action: 'fetchQueriedPollingPlaces',
        label: 'Polling Places Queried',
        value: pollingPlaceIds.length,
      })

      const results = await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))

      gaTrack.event({
        category: 'SausageMapContainer',
        action: 'fetchQueriedPollingPlaces',
        label: 'Polling Places Returned',
        value: results.length,
      })

      return results
    },
    onOpenFinderForAddressSearch(this: SausageMapContainer) {
      gaTrack.event({
        category: 'SausageMapContainer',
        action: 'onOpenFinderForAddressSearch',
      })
      dispatch(setPollingPlaceFinderMode(ePollingPlaceFinderInit.FOCUS_INPUT))
      browserHistory.push(`/search/${getURLSafeElectionName(this.props.currentElection)}`)
    },
    onOpenFinderForGeolocation(this: SausageMapContainer) {
      const { geolocationSupported, currentElection } = this.props

      if (geolocationSupported === true) {
        gaTrack.event({
          category: 'SausageMapContainer',
          action: 'onOpenFinderForGeolocation',
          label: 'Clicked the geolocation button',
        })

        this.onWaitForGeolocation()
        searchPollingPlacesByGeolocation(dispatch, currentElection, this.onGeolocationComplete, this.onGeolocationError)
      }
    },
    onClearMapSearch() {
      dispatch(clearMapToSearch())
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(SausageMapContainer)
