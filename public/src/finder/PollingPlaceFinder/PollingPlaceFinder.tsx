import * as React from "react"
// import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection, IGoogleAddressSearchResult } from "../../redux/modules/interfaces"

import GoogleMapLoader from "react-google-maps-loader"
import GooglePlacesAutocomplete from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"
import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
import { grey500 } from "material-ui/styles/colors"
import { List, ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import MapsPlace from "material-ui/svg-icons/maps/place"

export interface IProps {
    election: IElection
    onAddressSearchResults: Function
    addressSearchResults: Array<IGoogleAddressSearchResult>
    onGeocoderResults: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const { addressSearchResults, onAddressSearchResults, onGeocoderResults } = this.props

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
                                onReceiveSearchResults={onAddressSearchResults}
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

                {addressSearchResults.length > 0 && (
                    <List>
                        {addressSearchResults.map((value: IGoogleAddressSearchResult, index: number) => {
                            return (
                                <ListItem
                                    key={value.place_id}
                                    leftAvatar={<Avatar icon={<MapsPlace />} />}
                                    primaryText={value.structured_formatting.main_text}
                                    secondaryText={value.structured_formatting.secondary_text}
                                    onClick={(event: any) => {
                                        onGeocoderResults(value)
                                    }}
                                />
                            )
                        })}
                    </List>
                )}
            </div>
        )
    }
}

export default PollingPlaceFinder
