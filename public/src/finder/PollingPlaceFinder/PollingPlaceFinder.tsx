import * as React from "react"
// import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection } from "../../redux/modules/interfaces"

import GoogleMapLoader from "react-google-maps-loader"
import GooglePlacesAutocomplete from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"
// import SearchBar from "material-ui-search-bar"
import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
import { grey500 } from "material-ui/styles/colors"
import { List, ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
// import ActionInfo from "material-ui/svg-icons/action/info"
// import FileFolder from "material-ui/svg-icons/file/folder"
import MapsPlace from "material-ui/svg-icons/maps/place"

export interface IProps {
    election: IElection
    onReceiveAddressSearchResults: Function
    addressSearchResults: Array<any>
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const { addressSearchResults } = this.props

        return (
            <div>
                <GoogleMapLoader
                    params={{
                        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Define your api key here
                        libraries: "places", // To request multiple libraries, separate them with a comma
                    }}
                    render={(googleMaps: any) =>
                        googleMaps && (
                            <GooglePlacesAutocomplete
                                onReceiveSearchResults={this.props.onReceiveAddressSearchResults}
                                componentRestrictions={{ country: "AU" }}
                                hintText={"Find polling places with sausages"}
                                onRequestSearch={() => console.log("onRequestSearch")}
                                searchIcon={<DeviceLocationSearching color={grey500} />}
                                style={{
                                    margin: "0 auto",
                                    maxWidth: 800,
                                }}
                            />
                        )
                    }
                />

                <List>
                    {addressSearchResults.map((value: any, index: number) => {
                        return (
                            <ListItem
                                key={value.id}
                                leftAvatar={<Avatar icon={<MapsPlace />} />}
                                primaryText={value.structured_formatting.main_text}
                                secondaryText={value.structured_formatting.secondary_text}
                                onClick={() => {
                                    const google = window.google
                                    const geocoder = new google.maps.Geocoder()
                                    geocoder.geocode({ placeId: value.place_id }, (results: Array<any>, status: string) => {
                                        // results[0].geometry.location.lat()
                                        // results[0].geometry.location.lng()
                                        console.log("geocoder", results[0], status)
                                    })
                                }}
                            />
                        )
                    })}
                </List>
            </div>
        )
    }
}

export default PollingPlaceFinder
