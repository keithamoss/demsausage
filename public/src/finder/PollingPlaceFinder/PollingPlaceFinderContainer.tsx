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
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {
    findNearestPollingPlaces: Function
}

export interface IStateProps {
    locationSearched: IGoogleGeocodeResult | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult> | null
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceFinderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { nearbyPollingPlaces: null, locationSearched: null }

        this.onReceiveNearbyPollingPlaces = this.onReceiveNearbyPollingPlaces.bind(this)
    }

    componentDidMount() {
        document.title = "Democracy Sausage | Find a polling place near you"
    }

    async onReceiveNearbyPollingPlaces(pollingPlaces: Array<IPollingPlaceSearchResult>, locationSearched: IGoogleGeocodeResult) {
        this.setState({
            locationSearched: locationSearched,
            nearbyPollingPlaces: pollingPlaces,
        })
    }

    render() {
        const { currentElection, findNearestPollingPlaces } = this.props
        const { locationSearched, nearbyPollingPlaces } = this.state

        return (
            <PollingPlaceFinder
                election={currentElection}
                locationSearched={locationSearched}
                nearbyPollingPlaces={nearbyPollingPlaces}
                onGeocoderResults={(addressResult: IGoogleAddressSearchResult, place: IGoogleGeocodeResult) =>
                    findNearestPollingPlaces(this.onReceiveNearbyPollingPlaces, currentElection, place)
                }
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        findNearestPollingPlaces: function(onReceiveNearbyPollingPlaces: Function, election: IElection, value: IGoogleAddressSearchResult) {
            gaTrack.event({ category: "Sausage", action: "PollingPlaceFinder", type: "findNearestPollingPlaces" })

            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: value.place_id }, async (results: Array<IGoogleGeocodeResult>, status: string) => {
                gaTrack.event({
                    category: "Sausage",
                    action: "PollingPlaceFinder",
                    type: "findNearestPollingPlaces",
                    value: { length: results.length },
                })

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
