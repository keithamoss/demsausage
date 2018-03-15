import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import SausageMap from "./SausageMap"
import { IStore, IElection, IMapPollingPlace, IPollingPlace, ePollingPlaceFinderInit } from "../../redux/modules/interfaces"

import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { setPollingPlaceFinderMode } from "../../redux/modules/app"
import { getURLSafeElectionName } from "../../redux/modules/elections"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IStoreProps {
    elections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    geolocationSupported: boolean
}

export interface IDispatchProps {
    fetchQueriedPollingPlaces: Function
    onOpenFinderForAddressSearch: Function
    onOpenFinderForGeolocation: Function
}

export interface IStateProps {
    queriedPollingPlaces: Array<IPollingPlace>
}

interface IRouteProps {
    electionName: string
}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.Component<IStoreProps & IDispatchProps & IOwnProps, IStateProps> {
    static muiName = "SausageMapContainer"
    static pageTitle = "Democracy Sausage"
    static pageBaseURL = ""
    onOpenFinderForAddressSearch: Function
    onOpenFinderForGeolocation: Function

    constructor(props: any) {
        super(props)

        this.state = { queriedPollingPlaces: [] }

        this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
        this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
        this.onOpenFinderForAddressSearch = props.onOpenFinderForAddressSearch.bind(this)
        this.onOpenFinderForGeolocation = props.onOpenFinderForGeolocation.bind(this)

        gaTrack.event({
            category: "SausageMapContainer",
            action: "geolocationSupported",
            value: props.geolocationSupported ? 1 : 0,
        })
    }

    onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: pollingPlaces }))
    }

    onClearQueriedPollingPlaces() {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: [] }))
    }

    render() {
        const { currentElection, geolocationSupported, fetchQueriedPollingPlaces } = this.props
        const { queriedPollingPlaces } = this.state

        return (
            <SausageMap
                currentElection={currentElection}
                queriedPollingPlaces={queriedPollingPlaces}
                geolocationSupported={geolocationSupported}
                onQueryMap={async (features: Array<IMapPollingPlace>) => {
                    const pollingPlaceIds: Array<number> = features.map((feature: IMapPollingPlace) => feature.id)
                    const pollingPlaces = await fetchQueriedPollingPlaces(currentElection, pollingPlaceIds)
                    this.onSetQueriedPollingPlaces(pollingPlaces)
                }}
                onCloseQueryMapDialog={() => this.onClearQueriedPollingPlaces()}
                onOpenFinderForAddressSearch={this.onOpenFinderForAddressSearch}
                onOpenFinderForGeolocation={this.onOpenFinderForGeolocation}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app, elections } = state

    return {
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        geolocationSupported: app.geolocationSupported,
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
            gaTrack.event({
                category: "SausageMapContainer",
                action: "onOpenFinderForGeolocation",
            })
            dispatch(setPollingPlaceFinderMode(ePollingPlaceFinderInit.GEOLOCATION))
            browserHistory.push(`/search/${getURLSafeElectionName(this.props.currentElection)}`)
        },
    }
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
