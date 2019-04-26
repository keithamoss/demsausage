import { FloatingActionButton, IconButton, Toolbar, ToolbarGroup, ToolbarSeparator } from "material-ui"
import FullscreenDialog from "material-ui-fullscreen-dialog"
import SearchBar from "material-ui-search-bar"
import Avatar from "material-ui/Avatar"
import FlatButton from "material-ui/FlatButton"
import { ListItem } from "material-ui/List"
import { blue500, grey600 } from "material-ui/styles/colors"
import { ActionInfo, ActionSearch, DeviceLocationSearching, MapsAddLocation, MapsRestaurantMenu } from "material-ui/svg-icons"
import * as React from "react"
import GoogleMapLoader from "react-google-maps-loader"
import { Link } from "react-router"
import styled from "styled-components"
import PollingPlaceCardMiniContainer from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import VegoIcon from "../../icons/vego"
import { IElection } from "../../redux/modules/elections"
import { IMapFilterOptions, IMapSearchResults, isFilterEnabled } from "../../redux/modules/map"
import { IPollingPlace } from "../../redux/modules/polling_places"
import SausageLoader from "../../shared/loader/SausageLoader"
import OpenLayersMapContainer from "../OpenLayersMap/OpenLayersMapContainer"
// import "./SausageMap.css"

const FlexboxMapContainer = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
`

const SearchBarContainer = styled.div`
    position: absolute;
    width: 85%;
    margin-top: 10px;
    margin-left: 7.5%;
    margin-right: 7.5%;
`

const MapLoadingContainer = styled.div`
    position: absolute;
    height: calc(100% - 80px); /* Height of PollingPlaceFilterToolbar */
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: auto;
`

const MapLoaderBar = styled.div`
    height: 100px;
    width: 100%;
    background-color: rgba(103, 64, 180, 0.8);
`

const AddStallFABContainer = styled.div`
    position: absolute;
    bottom: 16px;
    right: 16px;
`

const PollingPlaceFilterToolbar = styled(Toolbar)`
    background-color: white !important;
`

const PollingPlaceFilterToolbarGroup = styled(ToolbarGroup)`
    width: 100%;
    max-width: 300px;
`

const PollingPlaceFilterToolbarSeparator = styled(ToolbarSeparator)`
    margin-left: 12px !important;
`

const PollingPlaceCardWrapper = styled.div`
    padding: 10px;
`

export interface IProps {
    currentElection: IElection
    waitingForGeolocation: boolean
    queriedPollingPlaces: Array<IPollingPlace>
    geolocationSupported: boolean
    mapSearchResults: IMapSearchResults | null
    mapFilterOptions: IMapFilterOptions
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onOpenFinderForAddressSearch: any
    onOpenFinderForGeolocation: any
    onClearMapSearch: any
    onClickMapFilterOption: any
}

export interface IState {
    mapLoading: boolean | undefined
}

class SausageMap extends React.PureComponent<IProps, IState> {
    private onMapBeginLoading: Function
    private onMapLoaded: Function
    private onClickMapFilterOption: Function

    constructor(props: IProps) {
        super(props)

        this.state = { mapLoading: undefined }

        this.onMapBeginLoading = () => this.setState({ mapLoading: true })
        this.onMapLoaded = () => this.setState({ mapLoading: false })
        this.onClickMapFilterOption = (option: string) => (event: React.MouseEvent<HTMLElement>) => props.onClickMapFilterOption(option)
    }

    render() {
        const {
            currentElection,
            waitingForGeolocation,
            queriedPollingPlaces,
            geolocationSupported,
            mapSearchResults,
            mapFilterOptions,
            onQueryMap,
            onCloseQueryMapDialog,
            onOpenFinderForAddressSearch,
            onOpenFinderForGeolocation,
            onClearMapSearch,
        } = this.props
        const { mapLoading } = this.state

        return (
            <React.Fragment>
                <FlexboxMapContainer>
                    <div className="openlayers-map-container">
                        <OpenLayersMapContainer
                            key={currentElection.id}
                            election={currentElection}
                            mapSearchResults={mapSearchResults}
                            mapFilterOptions={mapFilterOptions}
                            onMapBeginLoading={this.onMapBeginLoading}
                            onMapLoaded={this.onMapLoaded}
                            onQueryMap={onQueryMap}
                        />
                        <AddStallFABContainer>
                            <FloatingActionButton containerElement={<Link to={"/add-stall"} />}>
                                <MapsAddLocation />
                            </FloatingActionButton>
                        </AddStallFABContainer>
                    </div>

                    {mapLoading === true && (
                        <MapLoadingContainer>
                            <MapLoaderBar>
                                <SausageLoader />
                            </MapLoaderBar>
                        </MapLoadingContainer>
                    )}

                    <SearchBarContainer>
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
                                        value={mapSearchResults !== null ? mapSearchResults.formattedAddress : undefined}
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
                    </SearchBarContainer>

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
                </FlexboxMapContainer>

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
            </React.Fragment>
        )
    }
}

export default SausageMap
