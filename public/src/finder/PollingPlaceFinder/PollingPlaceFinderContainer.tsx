import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceFinder from "./PollingPlaceFinder"
import {
    IStore,
    IElection,
    IGoogleGeocodeResult,
    IGoogleAddressSearchResult,
    IPollingPlaceSearchResult,
} from "../../redux/modules/interfaces"
import { fetchNearbyPollingPlaces } from "../../redux/modules/polling_places"

export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {
    findNearestPollingPlaces: Function
}

export interface IStateProps {
    results: Array<any>
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceFinderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    onReceiveSearchResults: Function

    constructor(props: any) {
        super(props)
        this.state = { results: [] }

        this.onReceiveAddressSearchResults = this.onReceiveAddressSearchResults.bind(this)
    }

    onReceiveAddressSearchResults(results: any) {
        this.setState({ results: results })
    }

    render() {
        const { currentElection, findNearestPollingPlaces } = this.props
        const { results } = this.state

        return (
            <PollingPlaceFinder
                election={currentElection}
                onAddressSearchResults={this.onReceiveAddressSearchResults}
                addressSearchResults={results}
                onGeocoderResults={(value: any) => findNearestPollingPlaces(currentElection, value)}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections[elections.current_election_id],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        findNearestPollingPlaces: (election: IElection, value: IGoogleAddressSearchResult) => {
            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: value.place_id }, async (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (results.length > 0) {
                    const pollingPlaces: Array<IPollingPlaceSearchResult> = await dispatch(fetchNearbyPollingPlaces(election, results[0]))
                    console.log("pollingPlaces", pollingPlaces)
                }
            })
        },
    }
}

const PollingPlaceFinderContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceFinderContainer)

export default PollingPlaceFinderContainerWrapped
