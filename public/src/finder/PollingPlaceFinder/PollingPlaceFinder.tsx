import * as React from "react"
import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import { IElection, IPollingPlaceSearchResult, ePollingPlaceFinderInit } from "../../redux/modules/interfaces"

import ElectionChooserContainer from "../../elections/ElectionChooser/ElectionChooserContainer"
import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList"
import EmptyState from "../../shared/empty_state/EmptyState"
import { PollingPlaceCardMiniContainer } from "../PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { DeviceLocationSearching, ActionSearch } from "material-ui/svg-icons"
import { grey500 } from "material-ui/styles/colors"

import Paper from "material-ui/Paper"
import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionInfo } from "material-ui/svg-icons"
import { blue500 } from "material-ui/styles/colors"

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
    initMode: ePollingPlaceFinderInit
    geolocationSupported: boolean
    election: IElection
    locationSearched: string | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult> | null
    onGeocoderResults: any
    onRequestLocationPermissions: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const {
            initMode,
            geolocationSupported,
            election,
            locationSearched,
            nearbyPollingPlaces,
            onGeocoderResults,
            onRequestLocationPermissions,
        } = this.props

        return (
            <div>
                <ElectionChooserContainer pageTitle={"Democracy Sausage | Find a polling place near you"} pageBaseURL={"/search"} />

                <FinderContainer>
                    {election.polling_places_loaded === false && (
                        <Paper style={{ marginBottom: 15 }}>
                            <ListItem
                                leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
                                primaryText={"Polling places haven't been annonced yet"}
                                secondaryText={"Until then we're only listing stalls reported by the community."}
                                secondaryTextLines={2}
                                disabled={true}
                            />
                        </Paper>
                    )}

                    <GooglePlacesAutocompleteList
                        componentRestrictions={{ country: "AU" }}
                        autoFocus={initMode === ePollingPlaceFinderInit.FOCUS_INPUT}
                        hintText={geolocationSupported === true ? "Enter your address or use GPS →" : "Enter your address"}
                        searchIcon={geolocationSupported === true ? <DeviceLocationSearching color={grey500} /> : null}
                        onRequestSearch={onRequestLocationPermissions}
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
                                Polling places near <em>{locationSearched}</em>.
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
            </div>
        )
    }
}

export default PollingPlaceFinder
