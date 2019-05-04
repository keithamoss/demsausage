/**
 * Based heavily on the work of https://github.com/sautumn/material-ui-autocomplete-google-places
 * with additions to return the whole result object, fixed a bug with looking up the wrong placeId, and a few optimisations.
 * See https://github.com/ealgis/material-ui-autocomplete-google-places/tree/ealgis
 * We're not using that directly because we couldn't work out how to get all of the fancy node module
 * building guff working automaticlaly.
 *
 * Go back and have a go at that later on.
 */

/**
 * IMPORTANT!
 * Hacked for Democracy Sausage to handle using /TeamWertarbyte/material-ui-search-bar
 * instead of Material UI's Autocomplete.
 */

import { debounce } from "lodash-es"
import { MenuItem } from "material-ui"
import SearchBar from "material-ui-search-bar"
import * as React from "react"

// const styles: React.CSSProperties = {
//     menuItem: {
//         fontSize: 13,
//         display: "block",
//         paddingRight: 20,
//         overflow: "hidden",
//     },
//     menuItemInnerDiv: {
//         paddingRight: 38,
//         paddingLeft: 38,
//     },
//     menuItemMarker: {
//         width: "20px",
//     },
// }

interface IProps {
    // Google componentRestrictions
    componentRestrictions?: object
    types?: Array<any>
    // AutoComplete properties
    anchorOrigin?: object
    animated?: boolean
    animation?: Function
    errorStyle?: object
    errorText?: any
    floatingLabelText?: string
    fullWidth?: boolean
    hintText?: string
    listStyle?: object
    maxSearchResults?: number
    menuCloseDelay?: number
    menuProps?: object
    menuStyle?: object
    onClose?: Function
    onCancelSearch?: Function
    onNewRequest?: Function
    onUpdateInput?: Function
    open?: boolean
    openOnFocus?: boolean
    popoverProps?: object
    searchText?: string
    style?: object
    targetOrigin?: object
    textFieldStyle?: object
    // Prop types for dataSource
    innerDivStyle?: object
    menuItemStyle?: object
    results?: Function
    // Our props
    inputStyle?: object
    // Begin Democracy Sausage customisation
    onReceiveSearchResults: any
    onRequestSearch?: any
    searchIcon?: any
    closeIcon?: any
    autoFocus?: boolean
    // End Democracy Sausage customisation
    name?: string
    // Internals
}

interface IState {
    data: Array<IGoogleAddressSearchResult>
    searchText: string
}

declare global {
    // tslint:disable-next-line:interface-name
    interface Window {
        google: any
    }
}

export interface IGoogleAddressSearchResult {
    id: string
    place_id: string
    description: string
    reference: string
    matched_substrings: Array<{ length: number; offset: number }>
    structured_formatting: {
        main_text: string
        main_text_matched_substrings: Array<{ length: number; offset: number }>
        secondary_text: string
    }
    terms: Array<{ offset: number; value: string }>
    types: Array<string>
}

export interface IGoogleGeocodeResult {
    address_components: Array<{ long_name: string; short_name: string; types: Array<string> }>
    formatted_address: string
    geometry: {
        bounds: any
        location: any
        location_type: string
        viewport: any
    }
    place_id: string
    plus_code: {
        compound_code: string
        global_code: string
    }
    types: Array<string>
}

class GooglePlacesAutocomplete extends React.Component<IProps, IState> {
    geocoder: any
    service: any
    getPlacePredictions: any

    constructor(props: IProps) {
        super(props)

        this.state = {
            data: [],
            searchText: "",
        }

        const google = window.google
        this.geocoder = new google.maps.Geocoder()

        const sw = new google.maps.LatLng(-44.2422476272383, 112.568664550781)
        const ne = new google.maps.LatLng(-10.1135419412474, 154.092864990234)
        const extentOfAustralia = new google.maps.LatLngBounds(sw, ne)

        // Documentation for AutocompleteService
        // https://developers.google.com/maps/documentation/javascript/places-autocomplete#place_autocomplete_service
        this.service = new google.maps.places.AutocompleteService(null)

        // binding for functions
        this.updateInput = this.updateInput.bind(this)
        this.populateData = this.populateData.bind(this)
        this.getCurrentDataState = this.getCurrentDataState.bind(this)
        this.getLatLgn = this.getLatLgn.bind(this)
        this.getPlacePredictions = debounce(
            function(this: GooglePlacesAutocomplete) {
                if (this.state.searchText.length >= 3) {
                    const outerScope = this
                    this.service.getPlacePredictions(
                        {
                            input: this.state.searchText,
                            // componentRestrictions: this.props.componentRestrictions,
                            // Couldn't get admin area suggestions to work (didn't dig deep, tho - and we could always filter on our side)
                            // componentRestrictions: {
                            //     administrative_area: "Perth",
                            // },
                            region: "au",
                            bounds: extentOfAustralia,
                            types: this.props.types,
                        },
                        (predictions: Array<any>) => {
                            if (predictions) {
                                outerScope.populateData(predictions)
                            }
                        }
                    )
                } else {
                    this.populateData([])
                }
            },
            1500
            // { maxWait: 5000 },
        )
    }

    getCurrentDataState() {
        return this.state.data
    }

    getLatLgn(locationID: any, cb: Function) {
        this.geocoder.geocode({ placeId: locationID }, (results: Array<any>, status: any) => {
            cb(results, status)
        })
    }

    updateInput(searchText: string) {
        // v0.4x of material-ui-search-bar doesn't implement onCancelSearch
        // So let's hack around that here.
        if (searchText === "" && this.props.onCancelSearch !== undefined) {
            this.props.onCancelSearch()
        }

        this.setState(
            {
                searchText,
            },
            this.getPlacePredictions
        )
    }

    populateData(array: Array<IGoogleAddressSearchResult>) {
        // const currentPlaceIds: Array<string> = this.state.data.map((o: IGoogleAddressSearchResult) => o.place_id)
        // const newPlaceIds: Array<string> = array.map((o: IGoogleAddressSearchResult) => o.place_id)

        // Optimising this causes issues when the user changes the search term, but the
        // geocder results don't actually chance.
        // It appears to the user as if the search did nothing if they've already selected
        // a polling place and then gone back and changed the search.
        // if (isEqual(currentPlaceIds, newPlaceIds) === false) {
        this.props.onReceiveSearchResults(array)
        this.setState({ data: array })
        // }
    }

    getPoweredByGoogleMenuItem() {
        // disabled removed because https://github.com/callemall/material-ui/issues/5131
        return {
            text: "",
            value: (
                <MenuItem
                    style={{ cursor: "default" }}
                    children={
                        <div style={{ paddingTop: 20 }}>
                            <img
                                style={{ float: "right" }}
                                width={96}
                                height={12}
                                src="https://developers.google.com/places/documentation/images/powered-by-google-on-white.png"
                                alt="presentation"
                            />
                        </div>
                        // tslint:disable-next-line:jsx-curly-spacing
                    }
                />
            ),
        }
    }

    render() {
        // https://github.com/callemall/material-ui/pull/6231
        const { componentRestrictions, onReceiveSearchResults, onCancelSearch, ...autocompleteProps } = this.props

        return (
            <SearchBar
                {...autocompleteProps as any}
                // Used by Google Places API / No user input
                searchText={this.state.searchText}
                onChange={this.updateInput}
            />
        )
    }
}

export default GooglePlacesAutocomplete
