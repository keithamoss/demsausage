import { browserHistory } from "react-router"
import { getURLSafeElectionName, IElection } from "../../redux/modules/elections"
import { setMapToSearch } from "../../redux/modules/map"
import { sendNotification } from "../../redux/modules/snackbars"
import { gaTrack } from "../analytics/GoogleAnalytics"
import { IGoogleGeocodeResult } from "../ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"

export function searchPollingPlacesByGeolocation(dispatch: Function, election: IElection, geolocationComplete: any = null) {
    navigator.geolocation.getCurrentPosition(
        async (position: Position) => {
            if (geolocationComplete !== null) {
                geolocationComplete()
            }

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
                        const streetAddressPlace = results.find((place: IGoogleGeocodeResult) => place.types[0] === "street_address")
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
                        browserHistory.push(`/${getURLSafeElectionName(election)}`)
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
            if (geolocationComplete !== null) {
                geolocationComplete()
            }

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
                    snackbarMessage = "Sorry, we received an error from the GPS sensor on your device and couldn't fetch your location."
                    break
                case 3: // TIMEOUT
                    snackbarMessage = "Sorry, we didn't receive a location fix from your device in time."
                    break
                default:
                    snackbarMessage = "Sorry, we couldn't use GPS to fetch your location for an unknown reason."
            }
            dispatch(sendNotification(snackbarMessage))
        },
        { maximumAge: 60 * 5 * 1000, timeout: 10000 }
    )
}
