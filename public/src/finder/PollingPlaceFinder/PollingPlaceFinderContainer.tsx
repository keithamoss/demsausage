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
    addressSearchResults: Array<IGoogleAddressSearchResult>
    locationSearched: IGoogleGeocodeResult | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult>
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceFinderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { addressSearchResults: [], nearbyPollingPlaces: [], locationSearched: null }

        this.onReceiveAddressSearchResults = this.onReceiveAddressSearchResults.bind(this)
        this.onReceiveNearbyPollingPlaces = this.onReceiveNearbyPollingPlaces.bind(this)
    }

    onReceiveAddressSearchResults(results: Array<IGoogleAddressSearchResult>) {
        this.setState({
            addressSearchResults: results,
            locationSearched: this.state.locationSearched,
            nearbyPollingPlaces: this.state.nearbyPollingPlaces,
        })
    }

    async onReceiveNearbyPollingPlaces(pollingPlaces: Array<IPollingPlaceSearchResult>, locationSearched: IGoogleGeocodeResult) {
        this.setState({
            addressSearchResults: this.state.addressSearchResults,
            locationSearched: locationSearched,
            nearbyPollingPlaces: pollingPlaces,
        })
    }

    render() {
        const { currentElection, findNearestPollingPlaces } = this.props
        const { addressSearchResults, locationSearched, nearbyPollingPlaces } = this.state

        return (
            <PollingPlaceFinder
                election={currentElection}
                addressSearchResults={addressSearchResults}
                locationSearched={locationSearched}
                nearbyPollingPlaces={nearbyPollingPlaces}
                onAddressSearchResults={this.onReceiveAddressSearchResults}
                onGeocoderResults={(value: any) => findNearestPollingPlaces(this.onReceiveNearbyPollingPlaces, currentElection, value)}
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
        findNearestPollingPlaces: function(onReceiveNearbyPollingPlaces: Function, election: IElection, value: IGoogleAddressSearchResult) {
            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: value.place_id }, async (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (results.length > 0) {
                    const pollingPlaces: Array<IPollingPlaceSearchResult> = await dispatch(fetchNearbyPollingPlaces(election, results[0]))
                    onReceiveNearbyPollingPlaces(pollingPlaces, results[0])
                }
            })
        },
    }
}

const PollingPlaceFinderContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceFinderContainer)

export default PollingPlaceFinderContainerWrapped
