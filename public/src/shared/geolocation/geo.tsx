import { browserHistory } from 'react-router'
import { getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import { setMapToSearch } from '../../redux/modules/map'
import { fetchNearbyPollingPlacesBBOX } from '../../redux/modules/polling_places'
import { sendNotification } from '../../redux/modules/snackbars'
import { gaTrack } from '../analytics/GoogleAnalytics'
import { IGoogleGeocodeResult } from '../ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete'

export function askForGeolocationPermissions(
  dispatch: Function,
  onGeolocationComplete?: Function,
  onGeolocationError?: Function
) {
  navigator.geolocation.getCurrentPosition(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    async (position: Position) => {
      gaTrack.event({
        category: 'Geolocation',
        action: 'onRequestLocationPermissions',
        label: 'Granted geolocation permissions',
      })

      let locationSearched = 'your current location'
      const { google } = window
      const geocoder = new google.maps.Geocoder()

      geocoder.geocode(
        { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
        async (results: Array<any>, status: string) => {
          if (status === 'OK' && results.length > 0) {
            gaTrack.event({
              category: 'Geolocation',
              action: 'geocoder.geocode',
              label: `Success for ${window.location.href}`,
            })

            // This broke searches where there were no street addresses in the list
            // Note: Not even sure why we're trying to gecode the current location
            // when we can already zoom the map to the `position` object we get here.
            // When this gets up to findNearestPollingPlaces() in PollingPlaceFinderContainer
            // we only care about getting a set of coordinates we can zoom to.
            // Tested with Toodyay Road and had no issues with that being a not-a-point feature.
            // *shrugs* Deal with it in the redesign
            // const streetAddressPlace = results.find(
            //   (place: IGoogleGeocodeResult) => place.types[0] === 'street_address'
            // )
            const streetAddressPlace = results[0]

            if (streetAddressPlace !== undefined) {
              locationSearched = streetAddressPlace.formatted_address
            }

            if (onGeolocationComplete !== undefined) {
              onGeolocationComplete(position, streetAddressPlace, locationSearched)
            }
          } else {
            gaTrack.event({
              category: 'Geolocation',
              action: 'geocoder.geocode',
              label: 'Got an error from the geocoder',
            })

            dispatch(sendNotification('Sorry, we encountered an error trying to fetch your location'))

            if (onGeolocationError !== undefined) {
              locationSearched = 'error fetching location'
              onGeolocationError()
            }
          }
        }
      )
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    (error: PositionError) => {
      if (onGeolocationError !== undefined) {
        onGeolocationError()
      }

      gaTrack.event({
        category: 'Geolocation',
        action: 'onRequestLocationPermissions',
        label: 'Got an error when asking for permissions',
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
      dispatch(sendNotification(snackbarMessage))
    },
    { maximumAge: 60 * 5 * 1000, timeout: 10000 }
  )
}

export function searchPollingPlacesByGeolocation(
  dispatch: Function,
  election: IElection,
  onGeolocationComplete: Function,
  onGeolocationError: Function,
  navigateToElection = false
) {
  askForGeolocationPermissions(
    dispatch,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    async (position: Position, place: IGoogleGeocodeResult, locationSearched: string) => {
      if (onGeolocationComplete !== undefined) {
        onGeolocationComplete()
      }

      dispatch(
        setMapToSearch({
          lon: position.coords.longitude,
          lat: position.coords.latitude,
          extent: await dispatch(
            fetchNearbyPollingPlacesBBOX(election, position.coords.latitude, position.coords.longitude)
          ),
          formattedAddress: locationSearched,
        })
      )

      if (navigateToElection === true) {
        browserHistory.push(`/${getURLSafeElectionName(election)}`)
      }
    },
    onGeolocationError
  )
}
