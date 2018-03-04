import * as React from "react"
import styled from "styled-components"
import { browserHistory, Link } from "react-router"
// import "./SausageMap.css"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { default as OpenLayersMap } from "../OpenLayersMap/OpenLayersMap"

import SearchBar from "material-ui-search-bar"
// import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
// import { grey500 } from "material-ui/styles/colors"
import FlatButton from "material-ui/FlatButton"
// import { GridList, GridTile } from "material-ui/GridList"
import FullscreenDialog from "material-ui-fullscreen-dialog"

// import Snackbar from "material-ui/Snackbar"
import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionInfo, MapsLayers } from "material-ui/svg-icons"
import { blue500, deepPurple300, deepPurple500, white } from "material-ui/styles/colors"

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 80%;
    left: 10%;
`

const SearchBarContainer = styled.div``

const LayersContainer = styled.div`
    margin-left: auto;
    margin-top: 8px;

    & button {
        border-radius: 12px !important;
    }

    & span {
        color: ${white};
    }
`

const PollingPlaceCardWrapper = styled.div`
    padding: 10px;
`

const ElectionsFlexboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    /* Or do it all in one line with flex flow */
    flex-flow: row wrap;
    /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
    align-content: flex-end;
    position: relative;
    width: 80%;
    margin: 0 auto;
`

const ElectionsFlexboxItem = styled.div`
    width: 125px;
    height: 125px;
    margin: 6px;
    position: relative;
    cursor: ${props => (props.className === "selected" ? "auto" : "pointer")};

    & img {
        width: 125px;
        height: 125px;
    }
`

const ElectionTitle = styled.span`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${props => (props.className === "selected" ? "rgba(100, 181, 246, 0.6)" : "rgba(0, 0, 0, 0.4)")};
    line-height: 24px;
    text-align: center;
    color: ${white};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
`

export interface IProps {
    elections: Array<IElection>
    currentElection: IElection
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
    onClickElectionChooser: any
    isElectionChooserOpen: boolean
    onCloseElectionChooserDialog: any
    onChooseElection: any
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onElectionAnnounceClose: any
}

const getElectionVeryShortName: any = (election: IElection) => election.short_name.replace(/\s/, "").replace("20", "")

class SausageMap extends React.PureComponent<IProps, {}> {
    render() {
        const {
            elections,
            currentElection,
            queriedPollingPlaces,
            onClickElectionChooser,
            isElectionChooserOpen,
            onCloseElectionChooserDialog,
            onChooseElection,
            onQueryMap,
            onCloseQueryMapDialog,
        } = this.props

        return (
            <div>
                <OpenLayersMap key={currentElection.id} election={currentElection} onQueryMap={onQueryMap} />

                {/* <Snackbar
                    open={hasSeenElectionAnnouncement === false}
                    message="The Tasmania 2018 state election is now live!"
                    style={{ marginBottom: 56 }}
                    autoHideDuration={5000}
                    onRequestClose={onElectionAnnounceClose}
                /> */}

                <FlexboxContainer>
                    <SearchBarContainer>
                        <SearchBar
                            hintText={"Find polling places"}
                            // tslint:disable-next-line:no-empty
                            onChange={() => {}}
                            onClick={() => browserHistory.push("/search")}
                            onRequestSearch={() => console.log("onRequestSearch")}
                            // searchIcon={<DeviceLocationSearching color={grey500} />}
                            style={{
                                margin: "0 auto",
                                maxWidth: 800,
                            }}
                        />
                    </SearchBarContainer>

                    <LayersContainer>
                        <FlatButton
                            icon={<MapsLayers color={white} />}
                            label={getElectionVeryShortName(currentElection)}
                            backgroundColor={deepPurple500}
                            hoverColor={deepPurple300}
                            onClick={onClickElectionChooser}
                        />
                    </LayersContainer>
                </FlexboxContainer>

                <FullscreenDialog
                    open={isElectionChooserOpen}
                    onRequestClose={onCloseElectionChooserDialog}
                    title={"Elections"}
                    actionButton={<FlatButton label="Close" onClick={onCloseElectionChooserDialog} />}
                    containerStyle={{ paddingBottom: 56 }} /* Height of BottomNav */
                >
                    <ElectionsFlexboxContainer>
                        {elections.map((election: IElection) => (
                            <ElectionsFlexboxItem
                                key={election.id}
                                onClick={() => onChooseElection(election)}
                                className={election.id === currentElection.id ? "selected" : ""}
                            >
                                <img
                                    src={`https://api.mapbox.com/styles/v1/mapbox/light-v9/static/${election.lon},${
                                        election.lat
                                    },${election.default_zoom_level - 0.2},0,0/600x600?access_token=${
                                        process.env.REACT_APP_MAPBOX_API_KEY
                                    }`}
                                />
                                <ElectionTitle className={election.id === currentElection.id ? "selected" : ""}>
                                    {election.short_name}
                                </ElectionTitle>
                            </ElectionsFlexboxItem>
                        ))}
                    </ElectionsFlexboxContainer>
                    {/* <GridList cellHeight={100} cols={4}>
                        {elections.map((election: IElection) => (
                            <GridTile key={election.id} style={{ width: 100 }} title={election.name}>
                                <img
                                    src={`https://api.mapbox.com/styles/v1/mapbox/light-v9/static/${election.lon},${
                                        election.lat
                                    },${election.default_zoom_level - 0.1},0,0/600x600?access_token=${
                                        process.env.REACT_APP_MAPBOX_API_KEY
                                    }`}
                                />
                            </GridTile>
                        ))}
                    </GridList> */}
                </FullscreenDialog>

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
                                <PollingPlaceCardMiniContainer pollingPlace={pollingPlace} />
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
