import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { ePollingPlaceFinderInit } from "../../redux/modules/app"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { setMapToSearch } from "../../redux/modules/map"
import { IStore } from "../../redux/modules/reducer"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"
import { searchPollingPlacesByGeolocation } from "../../shared/geolocation/geo"
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

export interface IStateProps {
    waitingForGeolocation: boolean
}

type TComponentProps = IStoreProps & IDispatchProps
export class PollingPlaceFinderContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "PollingPlaceFinderContainer"
    static pageTitle = "Democracy Sausage | Find a polling place near you"
    static pageBaseURL = "/search"
    onRequestLocationPermissions: any

    constructor(props: IStoreProps & IDispatchProps) {
        super(props)

        this.state = { waitingForGeolocation: false }

        this.onWaitForGeolocation = this.onWaitForGeolocation.bind(this)
        this.onGeolocationComplete = this.onGeolocationComplete.bind(this)
        this.onRequestLocationPermissions = props.onRequestLocationPermissions.bind(this)
    }

    onWaitForGeolocation() {
        this.setState({ ...this.state, waitingForGeolocation: true })
    }

    onGeolocationComplete() {
        this.setState({ ...this.state, waitingForGeolocation: false })
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
        const { waitingForGeolocation } = this.state

        return (
            <PollingPlaceFinder
                initMode={initMode}
                geolocationSupported={geolocationSupported}
                waitingForGeolocation={waitingForGeolocation}
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

                this.onWaitForGeolocation()
                searchPollingPlacesByGeolocation(dispatch, currentElection, this.onGeolocationComplete, true)
            }
        },
    }
}

const PollingPlaceFinderContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceFinderContainer)

export default PollingPlaceFinderContainerWrapped
