import FullscreenDialog from "material-ui-fullscreen-dialog"
import SearchBar from "material-ui-search-bar"
import Avatar from "material-ui/Avatar"
import FlatButton from "material-ui/FlatButton"
import { ListItem } from "material-ui/List"
import { blue500 } from "material-ui/styles/colors"
import { ActionInfo, ActionSearch, DeviceLocationSearching } from "material-ui/svg-icons"
import * as React from "react"
import { Link } from "react-router"
import styled from "styled-components"
// import "./SausageMap.css"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { default as OpenLayersMap } from "../OpenLayersMap/OpenLayersMap"

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
    geolocationSupported: boolean
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onOpenFinderForAddressSearch: any
    onOpenFinderForGeolocation: any
}

class SausageMap extends React.PureComponent<IProps, {}> {
    render() {
        const {
            currentElection,
            queriedPollingPlaces,
            geolocationSupported,
            onQueryMap,
            onCloseQueryMapDialog,
            onOpenFinderForAddressSearch,
            onOpenFinderForGeolocation,
        } = this.props

        return (
            <div>
                <OpenLayersMap key={currentElection.id} election={currentElection} onQueryMap={onQueryMap} />

                <FlexboxContainer>
                    <FlexboxItem>
                        <SearchBar
                            hintText={"Find polling places"}
                            // tslint:disable-next-line:no-empty
                            onChange={() => {}}
                            onClick={onOpenFinderForAddressSearch}
                            onRequestSearch={geolocationSupported === true ? onOpenFinderForGeolocation : onOpenFinderForAddressSearch}
                            searchIcon={geolocationSupported === true ? <DeviceLocationSearching /> : <ActionSearch />}
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
