import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
// import "./SausageMap.css"

import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { default as OpenLayersMap } from "../OpenLayersMap/OpenLayersMap"

import SearchBar from "material-ui-search-bar"
import FlatButton from "material-ui/FlatButton"
import FullscreenDialog from "material-ui-fullscreen-dialog"

import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionInfo, DeviceLocationSearching } from "material-ui/svg-icons"
import { blue500, grey500 } from "material-ui/styles/colors"

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 80%;
    margin: 0 auto;
`

const FlexboxItem = styled.div``

const PollingPlaceCardWrapper = styled.div`
    padding: 10px;
`

export interface IProps {
    currentElection: IElection
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onElectionAnnounceClose: any
    onOpenFinderForAddressSearch: any
    onOpenFinderForGeolocation: any
}

class SausageMap extends React.PureComponent<IProps, {}> {
    render() {
        const {
            currentElection,
            queriedPollingPlaces,
            // hasSeenElectionAnnouncement,
            onQueryMap,
            onCloseQueryMapDialog,
            onOpenFinderForAddressSearch,
            onOpenFinderForGeolocation,
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
                    <FlexboxItem>
                        <SearchBar
                            hintText={"Find polling places"}
                            // tslint:disable-next-line:no-empty
                            onChange={() => {}}
                            onClick={onOpenFinderForAddressSearch}
                            onRequestSearch={onOpenFinderForGeolocation}
                            searchIcon={<DeviceLocationSearching color={grey500} />}
                            style={{
                                margin: "0 auto",
                                maxWidth: 800,
                            }}
                        />
                    </FlexboxItem>
                </FlexboxContainer>

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

                {/* <Dialog
                    title="Dialog With Actions"
                    actions={[<FlatButton label="No Thanks" primary={true} />, <RaisedButton label="Yes Please" primary={true} />]}
                    modal={false}
                    open={true}
                    contentStyle={{ position: "fixed", bottom: "63px", width: "100%" }}
                    //   onRequestClose={this.handleClose}
                >
                    The actions in this window were passed in as an array of React objects.
                </Dialog> */}
            </div>
        )
    }
}

export default SausageMap
