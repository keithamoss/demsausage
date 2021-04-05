import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { setMapToSearch } from "../../redux/modules/map"
import { fetchNearbyPollingPlacesBBOX } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import { IGoogleGeocodeResult } from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"
import PollingPlaceFinder from "./PollingPlaceFinder"

interface IProps {}

interface IStoreProps {
    currentElection: IElection
}

interface IDispatchProps {
    findNearestPollingPlaces: Function
}

interface IStateProps {}

type TComponentProps = IStoreProps & IDispatchProps
class PollingPlaceFinderContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "PollingPlaceFinderContainer"
    static pageTitle = "Democracy Sausage | Find a polling place near you"
    static pageBaseURL = "/search"

    render() {
        const { currentElection, findNearestPollingPlaces } = this.props

        return (
            <PollingPlaceFinder
                election={currentElection}
                onGeocoderResults={(place: IGoogleGeocodeResult) => {
                    findNearestPollingPlaces(currentElection, place)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        findNearestPollingPlaces: function(election: IElection, place: IGoogleGeocodeResult) {
            gaTrack.event({
                category: "PollingPlaceFinderContainer",
                action: "findNearestPollingPlaces",
                label: "Searched for polling places near an address",
            })

            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: place.place_id }, async (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (status === "OK" && results.length > 0) {
                    dispatch(
                        setMapToSearch({
                            lon: results[0].geometry.location.lng(),
                            lat: results[0].geometry.location.lat(),
                            extent: await dispatch(
                                fetchNearbyPollingPlacesBBOX(
                                    election,
                                    results[0].geometry.location.lat(),
                                    results[0].geometry.location.lng()
                                )
                            ),
                            formattedAddress: results[0].formatted_address,
                        })
                    )
                    browserHistory.push(`/${getURLSafeElectionName(election)}`)
                } else {
                    gaTrack.event({
                        category: "PollingPlaceFinderContainer",
                        action: "findNearestPollingPlaces",
                        label: "Got an error from the geocoder",
                    })
                }
            })
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceFinderContainer)
