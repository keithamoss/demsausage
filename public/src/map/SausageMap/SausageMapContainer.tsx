import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { ePollingPlaceFinderInit, setPollingPlaceFinderMode } from "../../redux/modules/app"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { clearMapToSearch, IMapFilterOptions, IMapSearchResults } from "../../redux/modules/map"
import { fetchPollingPlacesByIds, IMapPollingPlaceFeature, IPollingPlace } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import { searchPollingPlacesByGeolocation } from "../../shared/geolocation/geo"
import SausageMap from "./SausageMap"

export interface IStoreProps {
    elections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    geolocationSupported: boolean
    mapSearchResults: IMapSearchResults | null
}

export interface IDispatchProps {
    fetchQueriedPollingPlaces: Function
    onOpenFinderForAddressSearch: Function
    onOpenFinderForGeolocation: Function
    onClearMapSearch: Function
}

export interface IStateProps {
    waitingForGeolocation: boolean
    queriedPollingPlaces: Array<IPollingPlace>
    mapFilterOptions: IMapFilterOptions
}

interface IRouteProps {
    electionName: string
}

interface IOwnProps {
    params: IRouteProps
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
export class SausageMapContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "SausageMapContainer"
    static pageTitle = "Democracy Sausage"
    static pageBaseURL = ""
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
            category: "SausageMapContainer",
            action: "geolocationSupported",
            value: props.geolocationSupported ? 1 : 0,
        })
    }

    onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
        this.setState({ ...this.state, queriedPollingPlaces: pollingPlaces })
    }

    onClearQueriedPollingPlaces() {
        this.setState({ ...this.state, queriedPollingPlaces: [] })
    }

    onWaitForGeolocation() {
        this.setState({ ...this.state, waitingForGeolocation: true })
    }

    onGeolocationComplete() {
        this.setState({ ...this.state, waitingForGeolocation: false })
    }

    onGeolocationError() {
        this.setState({ ...this.state, waitingForGeolocation: false })
    }

    onClickMapFilterOption(option: string) {
        const state = option in this.state.mapFilterOptions && this.state.mapFilterOptions[option] === true ? false : true
        this.setState({ ...this.state, mapFilterOptions: { ...this.state.mapFilterOptions, [option]: state } })
    }

    render() {
        const { currentElection, geolocationSupported, fetchQueriedPollingPlaces, mapSearchResults, onClearMapSearch } = this.props
        const { waitingForGeolocation, queriedPollingPlaces, mapFilterOptions } = this.state

        return (
            <SausageMap
                currentElection={currentElection}
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
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, elections, map } = state

    return {
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        geolocationSupported: app.geolocationSupported,
        mapSearchResults: map.search,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
            gaTrack.event({
                category: "SausageMapContainer",
                action: "fetchQueriedPollingPlaces",
                label: "Polling Places Queried",
                value: pollingPlaceIds.length,
            })

            const results = await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))

            gaTrack.event({
                category: "SausageMapContainer",
                action: "fetchQueriedPollingPlaces",
                label: "Polling Places Returned",
                value: results.length,
            })

            return results
        },
        onOpenFinderForAddressSearch(this: SausageMapContainer) {
            gaTrack.event({
                category: "SausageMapContainer",
                action: "onOpenFinderForAddressSearch",
            })
            dispatch(setPollingPlaceFinderMode(ePollingPlaceFinderInit.FOCUS_INPUT))
            browserHistory.push(`/search/${getURLSafeElectionName(this.props.currentElection)}`)
        },
        onOpenFinderForGeolocation(this: SausageMapContainer) {
            const { geolocationSupported, currentElection } = this.props

            if (geolocationSupported === true) {
                gaTrack.event({
                    category: "SausageMapContainer",
                    action: "onOpenFinderForGeolocation",
                    label: "Clicked the geolocation button",
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

const SausageMapContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(SausageMapContainer)

export default SausageMapContainerWrapped
