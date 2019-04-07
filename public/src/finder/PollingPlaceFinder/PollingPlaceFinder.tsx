import Avatar from "material-ui/Avatar"
import { ListItem } from "material-ui/List"
import Paper from "material-ui/Paper"
import { blue500 } from "material-ui/styles/colors"
import { ActionInfo, ActionSearch, DeviceLocationSearching, NavigationClose } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import { ePollingPlaceFinderInit } from "../../redux/modules/app"
import { IElection } from "../../redux/modules/elections"
import GooglePlacesAutocompleteList from "../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList"

const FinderContainer = styled.div`
    padding-top: 15px;
    padding-left: 15px;
    padding-right: 15px;
`

export interface IProps {
    initMode: ePollingPlaceFinderInit
    geolocationSupported: boolean
    waitingForGeolocation: boolean
    election: IElection
    onGeocoderResults: any
    onRequestLocationPermissions: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
    render() {
        const {
            initMode,
            geolocationSupported,
            waitingForGeolocation,
            election,
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
                    hintText={
                        geolocationSupported === true
                            ? waitingForGeolocation === false
                                ? "Search here or use GPS →"
                                : "Fetching your location..."
                            : "Search here"
                    }
                    onRequestSearch={geolocationSupported === true ? onRequestLocationPermissions : undefined}
                    searchIcon={
                        geolocationSupported === true ? (
                            waitingForGeolocation === false ? (
                                <DeviceLocationSearching />
                            ) : (
                                <DeviceLocationSearching className="spin" />
                            )
                        ) : (
                            <ActionSearch />
                        )
                    }
                    closeIcon={geolocationSupported === true ? null : <NavigationClose />}
                    style={{
                        margin: "0 auto",
                        maxWidth: 800,
                    }}
                    onChoosePlace={onGeocoderResults}
                />
            </FinderContainer>
        )
    }
}

export default PollingPlaceFinder
