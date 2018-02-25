import * as React from "react"
import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection, IPollingPlaceSearchResult, IGoogleGeocodeResult } from "../../redux/modules/interfaces"

import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList"
import EmptyState from "../../shared/empty_state/EmptyState"
import { PollingPlaceCardMiniContainer } from "../PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { DeviceLocationSearching, ActionSearch } from "material-ui/svg-icons"
import { grey500 } from "material-ui/styles/colors"

const FinderContainer = styled.div`
    padding-top: 15px;
    padding-left: 15px;
    padding-right: 15px;
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
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult> | null
    onGeocoderResults: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const { locationSearched, nearbyPollingPlaces, onGeocoderResults } = this.props

        return (
            <FinderContainer>
                <GooglePlacesAutocompleteList
                    componentRestrictions={{ country: "AU" }}
                    autoFocus={true}
                    hintText={"Enter your address"}
                    searchIcon={<DeviceLocationSearching color={grey500} />}
                    style={{
                        margin: "0 auto",
                        maxWidth: 800,
                    }}
                    onChoosePlace={onGeocoderResults}
                />

                {/* {nearbyPollingPlaces === null &&
                    locationSearched === null && <EmptyState message={"Search for polling places"} icon={<ActionSearch />} />} */}

                {nearbyPollingPlaces !== null &&
                    nearbyPollingPlaces.length > 0 && (
                        <LocationSearched>
                            Polling places near <em>{locationSearched!.formatted_address}</em>.
                        </LocationSearched>
                    )}

                {nearbyPollingPlaces !== null &&
                    nearbyPollingPlaces.length > 0 &&
                    nearbyPollingPlaces.map((value: IPollingPlaceSearchResult, index: number) => (
                        <PollingPlaceCardWrapper key={value.id}>
                            <PollingPlaceCardMiniContainer pollingPlace={value} />
                        </PollingPlaceCardWrapper>
                    ))}

                {nearbyPollingPlaces !== null &&
                    nearbyPollingPlaces.length === 0 && (
                        <EmptyState
                            message={
                                <div>
                                    Sorry, we couldn't find any<br />polling places close to you
                                </div>
                            }
                            icon={<ActionSearch />}
                        />
                    )}
            </FinderContainer>
        )
    }
}

export default PollingPlaceFinder
