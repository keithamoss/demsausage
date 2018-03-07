import * as React from "react"
import styled from "styled-components"
import { browserHistory, Link } from "react-router"
// import "./SausageMap.css"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { default as OpenLayersMap } from "../OpenLayersMap/OpenLayersMap"

import { Tabs, Tab } from "material-ui/Tabs"
import SearchBar from "material-ui-search-bar"
import FlatButton from "material-ui/FlatButton"
import FullscreenDialog from "material-ui-fullscreen-dialog"

// import Snackbar from "material-ui/Snackbar"
import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionInfo, MapsLayers, ActionPowerSettingsNew } from "material-ui/svg-icons"
import { blue500, deepPurple300, deepPurple500, white, green500 } from "material-ui/styles/colors"

const ElectionTabs = styled(Tabs)`
    position: relative;
    margin-top: -10px;
    margin-bottom: 10px;
    z-index: 100;
`

const ElectionTab = styled(Tab)`
    white-space: normal;
    padding-left: 12px !important;
    padding-right: 12px !important;
` as any

// 0_o Wtf Material UI?
// https://github.com/mui-org/material-ui/issues/3622
class ElectionTabWrapper extends React.Component<any, any> {
    static muiName = "Tab"

    render() {
        return <ElectionTab {...this.props} />
    }
}

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 80%;
    margin: 0 auto;
`

const FlexboxItem = styled.div``

const LayersContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;

    & button {
        border-radius: 50% !important;
        min-width: 36px !important; /* SVG width + 12px padding */
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
    border: ${props => (props.className === "selected" ? "1px solid rgba(100, 181, 246, 1)" : "")};
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

const ActiveElectionIndicator = styled.div`
    position: absolute;
    top: 0;
    right: 0;
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
    onChooseElectionTab: any
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onElectionAnnounceClose: any
}

// const getElectionVeryShortName: any = (election: IElection) => election.short_name.replace(/\s/, "").replace("20", "")
// Yeah, sorry. Replace with a field in the database if we ditch short_name in the longer term
const getElectionKindaShortName: any = (election: IElection) =>
    election.name
        .replace("Election ", "")
        .replace(/\s[0-9]{4}$/, "")
        .replace(/ian$/, "ia")
        .replace(/\sBy-election$/, "")

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
            onChooseElectionTab,
            onQueryMap,
            onCloseQueryMapDialog,
        } = this.props

        const activeElections = elections.filter((election: IElection) => election.is_active)

        return (
            <div>
                {activeElections.length > 1 && (
                    <ElectionTabs
                        onChange={(electionId: number) => onChooseElectionTab(electionId)}
                        value={currentElection.id}
                        inkBarStyle={{ backgroundColor: "#78C8AC" }}
                    >
                        {activeElections.map((election: IElection) => (
                            <ElectionTabWrapper key={election.id} label={getElectionKindaShortName(election)} value={election.id} />
                        ))}
                    </ElectionTabs>
                )}

                <OpenLayersMap key={currentElection.id} election={currentElection} onQueryMap={onQueryMap} />

                {/* <Snackbar
                    open={hasSeenElectionAnnouncement === false}
                    message="The Tasmania 2018 state election is now live!"
                    style={{ marginBottom: 56 }}
                    autoHideDuration={5000}
                    onRequestClose={onElectionAnnounceClose}
                /> */}

                <FlexboxContainer>
                    <FlexboxItem>
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
                    </FlexboxItem>

                    <FlexboxItem>
                        <LayersContainer>
                            <FlatButton
                                icon={<MapsLayers color={white} />}
                                // label={getElectionVeryShortName(currentElection)}
                                backgroundColor={deepPurple500}
                                hoverColor={deepPurple300}
                                onClick={onClickElectionChooser}
                            />
                        </LayersContainer>
                    </FlexboxItem>
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
                                {election.is_active && (
                                    <ActiveElectionIndicator>
                                        <ActionPowerSettingsNew color={green500} />
                                    </ActiveElectionIndicator>
                                )}
                            </ElectionsFlexboxItem>
                        ))}
                    </ElectionsFlexboxContainer>
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
