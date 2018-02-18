import * as React from "react"
import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection, IPollingPlaceSearchResult, IGoogleGeocodeResult } from "../../redux/modules/interfaces"

import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList"
import { PollingPlaceCardMiniContainer } from "../PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
import { grey500 } from "material-ui/styles/colors"

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
    locationSearched: IGoogleGeocodeResult | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult>
    onGeocoderResults: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const { locationSearched, nearbyPollingPlaces, onGeocoderResults } = this.props

        return (
            <FinderContainer>
                <GooglePlacesAutocompleteList
                    componentRestrictions={{ country: "AU" }}
                    hintText={"Find polling places"}
                    searchIcon={<DeviceLocationSearching color={grey500} />}
                    style={{
                        margin: "0 auto",
                        maxWidth: 800,
                    }}
                    onChoosePlace={onGeocoderResults}
                />

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
