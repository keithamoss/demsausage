import { Checkbox, DropDownMenu, Menu, MenuItem, Popover } from "material-ui";
import Avatar from "material-ui/Avatar";
import { ListItem } from "material-ui/List";
import Paper from "material-ui/Paper";
import { blue500, grey500 } from "material-ui/styles/colors";
import { ActionInfo, ActionSearch, DeviceLocationSearching, NavigationClose } from "material-ui/svg-icons";
import * as React from "react";
import styled from "styled-components";
import BaconandEggsIcon from "../../icons/bacon-and-eggs";
import CakeIcon from "../../icons/cake";
import CoffeeIcon from "../../icons/coffee";
import HalalIcon from "../../icons/halal";
import SausageIcon from "../../icons/sausage";
import VegoIcon from "../../icons/vego";
import { ePollingPlaceFinderInit } from "../../redux/modules/app";
import { IElection } from "../../redux/modules/elections";
import { IPollingPlaceSearchResult } from "../../redux/modules/polling_places";
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceFinder.css"
import EmptyState from "../../shared/empty_state/EmptyState";
import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList";
import { PollingPlaceCardMiniContainer } from "../PollingPlaceCardMini/PollingPlaceCardMiniContainer";

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
    isShowingPlaceAutocompleteResults: boolean
    locationSearched: string | null
    nearbyPollingPlaces: Array<IPollingPlaceSearchResult> | null
    onShowPlaceAutocompleteResults: any
    onGeocoderResults: any
    onRequestLocationPermissions: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const {
            initMode,
            geolocationSupported,
            election,
            isShowingPlaceAutocompleteResults,
            locationSearched,
            nearbyPollingPlaces,
            onShowPlaceAutocompleteResults,
            onGeocoderResults,
            onRequestLocationPermissions,
        } = this.props

        return (
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
                    onRequestSearch={geolocationSupported === true ? onRequestLocationPermissions : undefined}
                    searchIcon={geolocationSupported === true ? <DeviceLocationSearching /> : <ActionSearch />}
                    closeIcon={geolocationSupported === true ? null : <NavigationClose />}
                    style={{
                        margin: "0 auto",
                        maxWidth: 800,
                    }}
                    onShowPlaceAutocompleteResults={onShowPlaceAutocompleteResults}
                    onChoosePlace={onGeocoderResults}
                />

                <Checkbox label={<SausageIcon />} />
                <Checkbox label={<CakeIcon />} />
                <Checkbox label={<VegoIcon />} />
                <Checkbox label={<HalalIcon />} />
                <Checkbox label={<CoffeeIcon />} />
                <Checkbox label={<BaconandEggsIcon />} />

                <DropDownMenu>
                    <MenuItem value={1} primaryText={<SausageIcon />} />
                    <MenuItem value={2} primaryText="Every Night" />
                    <MenuItem value={3} primaryText="Weeknights" />
                    <MenuItem value={4} primaryText="Weekends" />
                    <MenuItem value={5} primaryText="Weekly" />
                </DropDownMenu>

                <Popover
                    open={true}
                    // anchorEl={this.state.anchorEl}
                    // anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    // targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    // onRequestClose={this.handleRequestClose}
                >
                    <Menu>
                        <MenuItem primaryText="Refresh" />
                        <MenuItem primaryText="Help &amp; feedback" />
                        <MenuItem primaryText="Settings" />
                        <MenuItem primaryText="Sign out" />
                    </Menu>
                </Popover>

                {/* {nearbyPollingPlaces === null &&
                    locationSearched === null && <EmptyState message={"Search for polling places"} icon={<ActionSearch />} />} */}

                {nearbyPollingPlaces !== null && nearbyPollingPlaces.length > 0 && (
                    <LocationSearched>
                        Polling places near <em>{locationSearched}</em>.
                    </LocationSearched>
                )}

                {nearbyPollingPlaces !== null &&
                    nearbyPollingPlaces.length > 0 &&
                    nearbyPollingPlaces.map((value: IPollingPlaceSearchResult, index: number) => (
                        <PollingPlaceCardWrapper key={value.id}>
                            <PollingPlaceCardMiniContainer pollingPlace={value} election={election} />
                        </PollingPlaceCardWrapper>
                    ))}

                {nearbyPollingPlaces !== null && nearbyPollingPlaces.length === 0 && isShowingPlaceAutocompleteResults === false && (
                    <EmptyState
                        message={
                            <div>
                                Sorry, we couldn't find any
                                <br />
                                polling places close to you
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
