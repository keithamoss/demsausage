import { IconButton, Toolbar, ToolbarGroup, ToolbarSeparator } from "material-ui"
import FullscreenDialog from "material-ui-fullscreen-dialog"
import SearchBar from "material-ui-search-bar"
import Avatar from "material-ui/Avatar"
import FlatButton from "material-ui/FlatButton"
import { ListItem } from "material-ui/List"
import { blue500, grey600 } from "material-ui/styles/colors"
import { ActionInfo, ActionSearch, DeviceLocationSearching, MapsRestaurantMenu } from "material-ui/svg-icons"
import * as React from "react"
import GoogleMapLoader from "react-google-maps-loader"
import { Link } from "react-router"
import styled from "styled-components"
// import "./SausageMap.css"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import VegoIcon from "../../icons/vego"
// import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"
import { IMapFilterOptions, IMapSearchResults, isFilterEnabled, MapMode } from "../../redux/modules/map"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { default as OpenLayersMap } from "../OpenLayersMap/OpenLayersMap"

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 85%;
    margin: 0 auto;
`

const FlexboxItem = styled.div``

const PollingPlaceFilterWrapper = styled.div`
    position: fixed;
    bottom: 56px;
    width: 100%;
    z-index: 10;
`

const PollingPlaceFilterToolbar = styled(Toolbar)`
    background-color: white !important;
`

const PollingPlaceFilterToolbarGroup = styled(ToolbarGroup)`
    width: 100%;
    max-width: 300px;
`

const PollingPlaceFilterToolbarSeparator = styled(ToolbarSeparator)`
    margin-left: 12px;
`

const PollingPlaceCardWrapper = styled.div`
    padding: 10px;
`

export interface IProps {
    currentElection: IElection
    waitingForGeolocation: boolean
    queriedPollingPlaces: Array<IPollingPlace>
    geolocationSupported: boolean
    mapMode: MapMode | null
    mapSearchResults: IMapSearchResults | null
    mapFilterOptions: IMapFilterOptions
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onOpenFinderForAddressSearch: any
    onOpenFinderForGeolocation: any
    onClearMapSearch: any
    onEmptySearchResults: any
    onClickMapFilterOption: any
}

class SausageMap extends React.PureComponent<IProps, {}> {
    private onClickMapFilterOption: Function

    constructor(props: IProps) {
        super(props)

        this.onClickMapFilterOption = (option: string) => (event: React.MouseEvent<HTMLElement>) => props.onClickMapFilterOption(option)
    }

    render() {
        const {
            currentElection,
            waitingForGeolocation,
            queriedPollingPlaces,
            geolocationSupported,
            mapMode,
            mapSearchResults,
            mapFilterOptions,
            onQueryMap,
            onCloseQueryMapDialog,
            onOpenFinderForAddressSearch,
            onOpenFinderForGeolocation,
            onClearMapSearch,
            onEmptySearchResults,
        } = this.props

        return (
            <div>
                <OpenLayersMap
                    key={currentElection.id}
                    election={currentElection}
                    mapMode={mapMode}
                    mapSearchResults={mapSearchResults}
                    mapFilterOptions={mapFilterOptions}
                    onQueryMap={onQueryMap}
                    onEmptySearchResults={onEmptySearchResults}
                />

                <FlexboxContainer>
                    <FlexboxItem>
                        <GoogleMapLoader
                            params={{
                                key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                                libraries: "places",
                            }}
                            render={(googleMaps: any) =>
                                googleMaps && (
                                    <SearchBar
                                        hintText={
                                            waitingForGeolocation === false ? "Search here or use GPS →" : "Fetching your location..."
                                        }
                                        value={
                                            mapMode === MapMode.SHOW_SEARCH_RESULTS && mapSearchResults !== null
                                                ? mapSearchResults.formattedAddress
                                                : undefined
                                        }
                                        onChange={(value: string) => {
                                            if (value === "") {
                                                onClearMapSearch()
                                            }
                                        }}
                                        onClick={onOpenFinderForAddressSearch}
                                        onRequestSearch={
                                            geolocationSupported === true ? onOpenFinderForGeolocation : onOpenFinderForAddressSearch
                                        }
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
                                        style={{
                                            margin: "0 auto",
                                            maxWidth: 800,
                                        }}
                                    />
                                )
                            }
                        />
                    </FlexboxItem>
                </FlexboxContainer>

                <PollingPlaceFilterWrapper>
                    <PollingPlaceFilterToolbar>
                        <PollingPlaceFilterToolbarGroup>
                            <MapsRestaurantMenu color={grey600} />
                            <PollingPlaceFilterToolbarSeparator />
                            <IconButton onClick={this.onClickMapFilterOption("vego")}>
                                <VegoIcon disabled={isFilterEnabled("vego", mapFilterOptions) === true ? false : true} />
                            </IconButton>
                            <IconButton onClick={this.onClickMapFilterOption("halal")}>
                                <HalalIcon disabled={isFilterEnabled("halal", mapFilterOptions) === true ? false : true} />
                            </IconButton>
                            <IconButton onClick={this.onClickMapFilterOption("coffee")}>
                                <CoffeeIcon disabled={isFilterEnabled("coffee", mapFilterOptions) === true ? false : true} />
                            </IconButton>
                            <IconButton onClick={this.onClickMapFilterOption("bacon_and_eggs")}>
                                <BaconandEggsIcon disabled={isFilterEnabled("bacon_and_eggs", mapFilterOptions) === true ? false : true} />
                            </IconButton>
                        </PollingPlaceFilterToolbarGroup>
                    </PollingPlaceFilterToolbar>
                </PollingPlaceFilterWrapper>

                {queriedPollingPlaces.length > 0 && (
                    <FullscreenDialog
                        open={true}
                        onRequestClose={onCloseQueryMapDialog}
                        title={"Polling Places"}
                        actionButton={<FlatButton label="Close" onClick={onCloseQueryMapDialog} />}
                        containerStyle={{ paddingBottom: 56 }} /* Height of BottomNav */
                    >
                        {queriedPollingPlaces.slice(0, 20).map((pollingPlace: IPollingPlace) => (
                            <PollingPlaceCardWrapper key={pollingPlace.id}>
                                <PollingPlaceCardMiniContainer pollingPlace={pollingPlace} election={currentElection} />
                            </PollingPlaceCardWrapper>
                        ))}
                        {queriedPollingPlaces.length > 20 && (
                            <ListItem
                                leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
                                primaryText={"There's a lot of polling places here"}
                                secondaryText={
                                    <span>
                                        Try zooming in on the map and querying again - or hit the <Link to={"/search"}>Find</Link> button
                                        and search by an address.
                                    </span>
                                }
                                secondaryTextLines={2}
                                disabled={true}
                            />
                        )}
                    </FullscreenDialog>
                )}
            </div>
        )
    }
}

export default SausageMap
