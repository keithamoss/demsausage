import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { ePollingPlaceFinderInit } from "../../redux/modules/app"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { setMapToSearch } from "../../redux/modules/map"
import { IStore } from "../../redux/modules/reducer"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import { IGoogleAddressSearchResult, IGoogleGeocodeResult } from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"
import PollingPlaceFinder from "./PollingPlaceFinder"

export interface IStoreProps {
    initMode: ePollingPlaceFinderInit
    geolocationSupported: boolean
    currentElection: IElection
}

export interface IDispatchProps {
    findNearestPollingPlaces: Function
    onRequestLocationPermissions: Function
}

export interface IStateProps {}

type TComponentProps = IStoreProps & IDispatchProps
export class PollingPlaceFinderContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "PollingPlaceFinderContainer"
    static pageTitle = "Democracy Sausage | Find a polling place near you"
    static pageBaseURL = "/search"
    onRequestLocationPermissions: any

    constructor(props: IStoreProps & IDispatchProps) {
        super(props)

        this.onRequestLocationPermissions = props.onRequestLocationPermissions.bind(this)
    }

    componentDidMount() {
        const { initMode } = this.props

        if (initMode === ePollingPlaceFinderInit.GEOLOCATION) {
            // GooglePlacesAutocompleteList loads the Google APIs for us - but if we come here and try to
            // use it too soon for a geolocation request it may not be loaded yet
            const intervalId = window.setInterval(() => {
                if (window.google !== undefined) {
                    window.clearInterval(intervalId)
                    this.onRequestLocationPermissions()
                }
            }, 250)
        }
    }

    render() {
        const { initMode, geolocationSupported, currentElection, findNearestPollingPlaces } = this.props

        return (
            <PollingPlaceFinder
                initMode={initMode}
                geolocationSupported={geolocationSupported}
                election={currentElection}
                onGeocoderResults={(addressResult: IGoogleAddressSearchResult, place: IGoogleGeocodeResult) => {
                    findNearestPollingPlaces(currentElection, place)
                }}
                onRequestLocationPermissions={this.onRequestLocationPermissions}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { app, elections } = state

    return {
        initMode: app.pollingPlaceFinderMode /* In lieu of React-Router v4's browserHistory.push(url, state) */,
        geolocationSupported: app.geolocationSupported,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        findNearestPollingPlaces: function(election: IElection, value: IGoogleAddressSearchResult) {
            gaTrack.event({
                category: "PollingPlaceFinderContainer",
                action: "findNearestPollingPlaces",
                label: "Searched for polling places near an address",
            })

            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: value.place_id }, async (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (status === "OK" && results.length > 0) {
                    dispatch(
                        setMapToSearch({
                            lon: results[0].geometry.location.lng(),
                            lat: results[0].geometry.location.lat(),
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
        onRequestLocationPermissions: function(this: PollingPlaceFinderContainer) {
            const { currentElection, geolocationSupported } = this.props

            if (geolocationSupported === true) {
                gaTrack.event({
                    category: "PollingPlaceFinderContainer",
                    action: "onRequestLocationPermissions",
                    label: "Clicked the geolocation button",
                })

                navigator.geolocation.getCurrentPosition(
                    async (position: Position) => {
                        gaTrack.event({
                            category: "PollingPlaceFinderContainer",
                            action: "onRequestLocationPermissions",
                            label: "Granted geolocation permissions",
                        })

                        let locationSearched = "your current location"
                        const google = window.google
                        const geocoder = new google.maps.Geocoder()

                        geocoder.geocode(
                            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
                            async (results: Array<any>, status: string) => {
                                if (status === "OK" && results.length > 0) {
                                    const streetAddressPlace = results.find(
                                        (place: IGoogleGeocodeResult) => place.types[0] === "street_address"
                                    )
                                    if (streetAddressPlace !== undefined) {
                                        locationSearched = streetAddressPlace.formatted_address
                                    }

                                    dispatch(
                                        setMapToSearch({
                                            lon: position.coords.longitude,
                                            lat: position.coords.latitude,
                                            formattedAddress: locationSearched,
                                        })
                                    )
                                    browserHistory.push(`/${getURLSafeElectionName(currentElection)}`)
                                } else {
                                    gaTrack.event({
                                        category: "PollingPlaceFinderContainer",
                                        action: "onRequestLocationPermissions",
                                        label: "Got an error from the geocoder",
                                    })
                                }
                            }
                        )
                    },
                    (error: PositionError) => {
                        gaTrack.event({
                            category: "PollingPlaceFinderContainer",
                            action: "onRequestLocationPermissions",
                            label: "Got an error when asking for permissions",
                            value: error.code,
                        })

                        let snackbarMessage
                        switch (error.code) {
                            case 1: // PERMISSION_DENIED
                                snackbarMessage = "Sorry, we couldn't use GPS to fetch your location because you've blocked access."
                                break
                            case 2: // POSITION_UNAVAILABLE
                                snackbarMessage =
                                    "Sorry, we received an error from the GPS sensor on your device and couldn't fetch your location."
                                break
                            case 3: // TIMEOUT
                                snackbarMessage = "Sorry, we didn't receive a location fix from your device in time."
                                break
                            default:
                                snackbarMessage = "Sorry, we couldn't use GPS to fetch your location for an unknown reason."
                        }
                        dispatch(sendSnackbarNotification(snackbarMessage))
                    },
                    { maximumAge: 60 * 5 * 1000, timeout: 10000 }
                )
            }
        },
    }
}

const PollingPlaceFinderContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceFinderContainer)

export default PollingPlaceFinderContainerWrapped
