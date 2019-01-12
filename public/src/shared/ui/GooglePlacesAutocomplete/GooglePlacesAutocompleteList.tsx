import Avatar from "material-ui/Avatar"
import { List, ListItem } from "material-ui/List"
import MapsPlace from "material-ui/svg-icons/maps/place"
import * as React from "react"
import GoogleMapLoader from "react-google-maps-loader"
import { connect } from "react-redux"
import { IStore } from "../../../redux/modules/reducer"
import { gaTrack } from "../../../shared/analytics/GoogleAnalytics"
import GooglePlacesAutocomplete, { IGoogleAddressSearchResult, IGoogleGeocodeResult } from "./GooglePlacesAutocomplete"

export interface IProps {
    onShowPlaceAutocompleteResults?: Function
    onChoosePlace: Function
    // From SearchBar via GooglePlacesAutocomplete
    componentRestrictions: object
    autoFocus: boolean
    searchIcon: JSX.Element
    closeIcon?: JSX.Element
    hintText: string
    onRequestSearch?: Function
}
export interface IStoreProps {}

export interface IDispatchProps {
    fetchGeocodedPlace: Function
}

export interface IStateProps {
    addressSearchResults: Array<IGoogleAddressSearchResult>
}

interface IOwnProps {}

export class GooglePlacesAutocompleteList extends React.PureComponent<IProps & IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { addressSearchResults: [] }

        this.onReceiveAddressSearchResults = this.onReceiveAddressSearchResults.bind(this)
        this.onPlaceChosen = this.onPlaceChosen.bind(this)
    }

    onReceiveAddressSearchResults(results: Array<IGoogleAddressSearchResult>) {
        gaTrack.event({
            category: "GooglePlacesAutocompleteList",
            action: "onReceiveAddressSearchResults",
            label: "Number of address search results from the geocoder",
            value: results.length,
        })

        this.setState({
            addressSearchResults: results,
        })

        if (this.props.onShowPlaceAutocompleteResults !== undefined) {
            this.props.onShowPlaceAutocompleteResults()
        }
    }

    onPlaceChosen() {
        this.setState({ addressSearchResults: [] })
    }

    render() {
        const {
            onChoosePlace,
            fetchGeocodedPlace,
            componentRestrictions,
            autoFocus,
            searchIcon,
            closeIcon,
            hintText,
            onRequestSearch,
        } = this.props
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
                                hintText={hintText}
                                autoFocus={autoFocus}
                                searchIcon={searchIcon}
                                closeIcon={closeIcon}
                                // tslint:disable-next-line:no-empty
                                onRequestSearch={onRequestSearch === undefined ? () => {} : onRequestSearch}
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
                                onClick={(event: any) => {
                                    fetchGeocodedPlace(onChoosePlace, value, this.onPlaceChosen)
                                }}
                            />
                        ))}
                    </List>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchGeocodedPlace: function(onChoosePlace: Function, addressResult: IGoogleAddressSearchResult, onPlaceChosen: Function) {
            gaTrack.event({ category: "GooglePlacesAutocompleteList", action: "fetchGeocodedPlace", label: "Chose an address" })

            const google = window.google
            const geocoder = new google.maps.Geocoder()
            geocoder.geocode({ placeId: addressResult.place_id }, (results: Array<IGoogleGeocodeResult>, status: string) => {
                if (status === "OK" && results.length > 0) {
                    gaTrack.event({
                        category: "GooglePlacesAutocompleteList",
                        action: "fetchGeocodedPlace",
                        label: "Number of geocoder results",
                        value: results.length,
                    })

                    onPlaceChosen()
                    onChoosePlace(addressResult, results[0])
                } else {
                    gaTrack.event({
                        category: "GooglePlacesAutocompleteList",
                        action: "fetchGeocodedPlace",
                        label: "Got an error from the geocoder",
                    })
                }
            })
        },
    }
}

const GooglePlacesAutocompleteListWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(GooglePlacesAutocompleteList)

export default GooglePlacesAutocompleteListWrapped as any
