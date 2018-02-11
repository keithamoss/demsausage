import * as React from "react"
import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection, IGoogleAddressSearchResult, IPollingPlaceSearchResult, IGoogleGeocodeResult } from "../../redux/modules/interfaces"

import GoogleMapLoader from "react-google-maps-loader"
import GooglePlacesAutocomplete from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete"
import { PollingPlaceCardMiniContainer } from "../PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
import { grey500 } from "material-ui/styles/colors"
import { List, ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import MapsPlace from "material-ui/svg-icons/maps/place"

const FinderContainer = styled.div`
    padding: 10px;
`

const LocationSearched = styled.div`
    margin-top: 20px;
    margin-bottom: 20px;
    color: ${grey500};
    font-size: 12px;
`

const PollingPlaceCardWrapper = styled.div`
    margin-bottom: 15px;
`

export interface IProps {
    election: IElection
    addressSearchResults: Array<IGoogleAddressSearchResult>
    locationSearched: IGoogleGeocodeResult | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult>
    onAddressSearchResults: Function
    onGeocoderResults: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const { addressSearchResults, locationSearched, nearbyPollingPlaces, onAddressSearchResults, onGeocoderResults } = this.props

        return (
            <FinderContainer>
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

                {nearbyPollingPlaces.length === 0 &&
                    addressSearchResults.length > 0 && (
                        <List>
                            {addressSearchResults.map((value: IGoogleAddressSearchResult, index: number) => (
                                <ListItem
                                    key={value.place_id}
                                    leftAvatar={<Avatar icon={<MapsPlace />} />}
                                    primaryText={value.structured_formatting.main_text}
                                    secondaryText={value.structured_formatting.secondary_text}
                                    onClick={(event: any) => {
                                        onGeocoderResults(value)
                                    }}
                                />
                            ))}
                        </List>
                    )}

                {nearbyPollingPlaces.length > 0 && (
                    <LocationSearched>
                        Polling places near <em>{locationSearched!.formatted_address}</em>.
                    </LocationSearched>
                )}

                {nearbyPollingPlaces.length > 0 &&
                    nearbyPollingPlaces.map((value: IPollingPlaceSearchResult, index: number) => (
                        <PollingPlaceCardWrapper key={value.id}>
                            <PollingPlaceCardMiniContainer pollingPlace={value} />
                        </PollingPlaceCardWrapper>
                    ))}
            </FinderContainer>
        )
    }
}

export default PollingPlaceFinder
