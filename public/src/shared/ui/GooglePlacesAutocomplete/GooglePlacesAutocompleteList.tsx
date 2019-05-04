import Avatar from "material-ui/Avatar"
import { List, ListItem } from "material-ui/List"
import { ActionSearch, DeviceLocationSearching, NavigationClose } from "material-ui/svg-icons"
import MapsPlace from "material-ui/svg-icons/maps/place"
import * as React from "react"
import GoogleMapLoader from "react-google-maps-loader"
import { connect } from "react-redux"
import { ePollingPlaceFinderInit } from "../../../redux/modules/app"
import { IStore } from "../../../redux/modules/reducer"
import { gaTrack } from "../../../shared/analytics/GoogleAnalytics"
import { askForGeolocationPermissions } from "../../geolocation/geo"
import GooglePlacesAutocomplete, { IGoogleAddressSearchResult, IGoogleGeocodeResult } from "./GooglePlacesAutocomplete"

export interface IProps {
    gps?: boolean
    onShowPlaceAutocompleteResults?: Function
    onChoosePlace: (place: IGoogleGeocodeResult, addressResult?: IGoogleAddressSearchResult) => void
    onCancelSearch?: Function
    // From SearchBar via GooglePlacesAutocomplete
    componentRestrictions: object
    autoFocus?: boolean
    hintText: string
    style?: any
}
export interface IStoreProps {
    initMode: ePollingPlaceFinderInit
    geolocationSupported: boolean
}

export interface IDispatchProps {
    onRequestLocationPermissions: Function
    fetchLocationFromGeocoder: Function
}

export interface IStateProps {
    waitingForGeolocation: boolean
    addressSearchResults: Array<IGoogleAddressSearchResult>
}

interface IOwnProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class GooglePlacesAutocompleteList extends React.PureComponent<TComponentProps, IStateProps> {
    onRequestLocationPermissions: any

    constructor(props: TComponentProps) {
        super(props)

        this.state = { waitingForGeolocation: false, addressSearchResults: [] }

        this.onRequestLocationPermissions = props.onRequestLocationPermissions.bind(this)
        this.onWaitForGeolocation = this.onWaitForGeolocation.bind(this)
        this.onGeolocationComplete = this.onGeolocationComplete.bind(this)
        this.onGeolocationError = this.onGeolocationError.bind(this)

        this.onReceiveAddressSearchResults = this.onReceiveAddressSearchResults.bind(this)
        this.onPlaceChosen = this.onPlaceChosen.bind(this)
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

    onWaitForGeolocation() {
        this.setState({ ...this.state, waitingForGeolocation: true })
    }

    onGeolocationComplete(position: Position, place: IGoogleGeocodeResult, locationSearched: string) {
        const { onChoosePlace } = this.props
        this.setState({ ...this.state, waitingForGeolocation: false })

        this.onPlaceChosen()
        onChoosePlace(place)
    }

    onGeolocationError() {
        this.setState({ ...this.state, waitingForGeolocation: false })
    }

    onReceiveAddressSearchResults(results: Array<IGoogleAddressSearchResult>) {
        gaTrack.event({
            category: "GooglePlacesAutocompleteList",
            action: "onReceiveAddressSearchResults",
            label: "Number of address search results from the geocoder",
            value: results.length,
        })

        this.setState({
            ...this.state,
            addressSearchResults: results,
        })

        if (this.props.onShowPlaceAutocompleteResults !== undefined) {
            this.props.onShowPlaceAutocompleteResults()
        }
    }

    onPlaceChosen() {
        this.setState({ ...this.state, addressSearchResults: [] })
    }

    render() {
        const { onChoosePlace, onCancelSearch, fetchLocationFromGeocoder, componentRestrictions, style } = this.props
        const { addressSearchResults } = this.state

        return (
            <div>
                <GoogleMapLoader
                    params={{
                        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                        libraries: "places",
                    }}
                    render={(googleMaps: any) =>
                        googleMaps && (
                            <GooglePlacesAutocomplete
                                onReceiveSearchResults={this.onReceiveAddressSearchResults}
                                componentRestrictions={componentRestrictions}
                                hintText={this.getHintText()}
                                autoFocus={this.getAutoFocus()}
                                searchIcon={this.getSearchIcon()}
                                closeIcon={<NavigationClose />}
                                // tslint:disable-next-line: no-empty
                                onRequestSearch={this.canUseGPS() === true ? this.onRequestLocationPermissions : () => {}}
                                onCancelSearch={onCancelSearch}
                                style={style}
                            />
                        )
                    }
                />

                {addressSearchResults.length > 0 && (
                    <List>
                        {addressSearchResults.map((value: IGoogleAddressSearchResult, index: number) => (
                            <ListItem
                                key={value.place_id}
                                leftAvatar={<Avatar icon={<MapsPlace />} />}
                                primaryText={value.structured_formatting.main_text}
                                secondaryText={value.structured_formatting.secondary_text}
                                secondaryTextLines={2}
                                onClick={(event: any) => {
                                    fetchLocationFromGeocoder(onChoosePlace, value, this.onPlaceChosen)
                                }}
                            />
                        ))}
                    </List>
                )}
            </div>
        )
    }

    public canUseGPS() {
        return (this.props.gps === true || this.props.gps === undefined) && this.props.geolocationSupported
    }

    private getAutoFocus() {
        return this.props.autoFocus === true || this.props.initMode === ePollingPlaceFinderInit.FOCUS_INPUT
    }

    private getHintText() {
        const { hintText } = this.props
        const { waitingForGeolocation } = this.state

        return this.canUseGPS() === true
            ? waitingForGeolocation === false
                ? `${hintText} or use GPS →`
                : "Fetching your location..."
            : hintText
    }

    private getSearchIcon() {
        const { waitingForGeolocation } = this.state

        return this.canUseGPS() === true ? (
            waitingForGeolocation === false ? (
                <DeviceLocationSearching />
            ) : (
                <DeviceLocationSearching className="spin" />
            )
        ) : (
            <ActionSearch />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { app } = state

    return {
        initMode: app.pollingPlaceFinderMode /* In lieu of React-Router v4's browserHistory.push(url, state) */,
        geolocationSupported: app.geolocationSupported,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onRequestLocationPermissions: function(this: GooglePlacesAutocompleteList) {
            if (this.canUseGPS() === true) {
                gaTrack.event({
                    category: "GooglePlacesAutocompleteList",
                    action: "onRequestLocationPermissions",
                    label: "Clicked the geolocation button",
                })

                this.onWaitForGeolocation()
                askForGeolocationPermissions(dispatch, this.onGeolocationComplete, this.onGeolocationError)
            }
        },
        fetchLocationFromGeocoder: function(
            onChoosePlace: (place: IGoogleGeocodeResult, addressResult?: IGoogleAddressSearchResult) => void,
            addressResult: IGoogleAddressSearchResult,
            onPlaceChosen: Function
        ) {
            gaTrack.event({ category: "GooglePlacesAutocompleteList", action: "fetchLocationFromGeocoder", label: "Chose an address" })

            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: addressResult.place_id }, (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (status === "OK" && results.length > 0) {
                    gaTrack.event({
                        category: "GooglePlacesAutocompleteList",
                        action: "fetchLocationFromGeocoder",
                        label: "Number of geocoder results",
                        value: results.length,
                    })

                    onPlaceChosen()
                    onChoosePlace(results[0], addressResult)
                } else {
                    gaTrack.event({
                        category: "GooglePlacesAutocompleteList",
                        action: "fetchLocationFromGeocoder",
                        label: "Got an error from the geocoder",
                    })
                }
            })
        },
    }
}

const GooglePlacesAutocompleteListWrapped = connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(GooglePlacesAutocompleteList)

export default GooglePlacesAutocompleteListWrapped
