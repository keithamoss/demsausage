import * as React from "react"
import styled from "styled-components"
import { browserHistory, Link } from "react-router"
// import "./SausageMap.css"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
import { getAPIBaseURL } from "../../redux/modules/app"
import { PollingPlaceCardMiniContainer } from "../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer"

import * as ol from "openlayers"
import SearchBar from "material-ui-search-bar"
// import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
// import { grey500 } from "material-ui/styles/colors"
import FlatButton from "material-ui/FlatButton"
import FullscreenDialog from "material-ui-fullscreen-dialog"

// import Snackbar from "material-ui/Snackbar"
import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { ActionInfo } from "material-ui/svg-icons"
import { blue500 } from "material-ui/styles/colors"

const SearchBarContainer = styled.div`
    position: relative;
    display: block;
    margin-top: 30px;
    margin-left: 20px;
    margin-right: 20px;
`

const PollingPlaceCardWrapper = styled.div`
    padding: 10px;
`

export interface IProps {
    election: IElection
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
    onQueryMap: Function
    onCloseQueryMapDialog: any
    onElectionAnnounceClose: any
}

const spriteCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 0],
        size: [32, 32],
        src: "./icons/sprite.png",
    }),
    zIndex: 1,
})
const spriteBBQCakeRunOut = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 32],
        size: [32, 29],
        src: "./icons/sprite.png",
    }),
    zIndex: 1,
})
const spriteBBQCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 61],
        size: [32, 29],
        src: "./icons/sprite.png",
    }),
    zIndex: 1,
})
const spriteBBQ = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 90],
        size: [32, 32],
        src: "./icons/sprite.png",
    }),
    zIndex: 1,
})
const spriteNowt = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 122],
        size: [24, 24],
        src: "./icons/sprite.png",
    }),
    zIndex: 1,
})
const spriteUnknown = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 146],
        size: [14, 14],
        src: "./icons/sprite.png",
        opacity: 0.4,
    }),
    zIndex: 0,
})

const styleFunctionSprite = function(feature: any) {
    if (feature.get("has_bbq") === true && feature.get("has_caek") === true) {
        return spriteBBQCake
    } else if ((feature.get("has_bbq") === true || feature.get("has_caek") === true) && feature.get("has_run_out") === true) {
        return spriteBBQCakeRunOut
    } else if (feature.get("has_bbq") === true) {
        return spriteBBQ
    } else if (feature.get("has_caek") === true) {
        return spriteCake
    } else if (feature.get("has_nothing") === true) {
        return spriteNowt
    } else {
        return spriteUnknown
    }
}

class SausageMap extends React.PureComponent<IProps, {}> {
    componentDidMount() {
        const { election, onQueryMap } = this.props

        const vectorSource = new ol.source.Vector({
            url: `${getAPIBaseURL()}/elections/election.php?id=${election.id}&s=${Date.now()}`,
            format: new ol.format.GeoJSON(),
        })

        // Hacky fix for the GeoJSON loading, but not rendering until the user interacts with the map
        vectorSource.on("change", function(e: any) {
            if (vectorSource.getState() === "ready") {
                window.setTimeout(function() {
                    map.getView().changed()
                    let view = map.getView()
                    let centre = view.getCenter()
                    centre[0] -= 1
                    view.setCenter(centre)
                    map.setView(view)
                }, 1000)
            }
        })

        const vectorLayer = new ol.layer.Vector({
            renderMode: "image",
            source: vectorSource,
            style: styleFunctionSprite,
        } as any)

        const map = new ol.Map({
            renderer: ["canvas"],
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: `https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=${
                            process.env.REACT_APP_MAPBOX_API_KEY
                        }`,
                        crossOrigin: "anonymous",
                    }),
                }),
            ],
            target: "openlayers-map",
            controls: [],
            view: new ol.View({
                center: ol.proj.transform([election.lon, election.lat], "EPSG:4326", "EPSG:3857"),
                zoom: election.default_zoom_level,
            }),
        })

        map.addLayer(vectorLayer)

        map.on("singleclick", function(e: any) {
            let features: Array<any> = []
            map.forEachFeatureAtPixel(
                e.pixel,
                (feature: any, layer: any) => {
                    features.push(feature.getProperties())
                }
                // { hitTolerance: 5 }
            )
            onQueryMap(features)
        })
    }

    render() {
        const { queriedPollingPlaces, onCloseQueryMapDialog } = this.props

        return (
            <div>
                <div id="openlayers-map" className="openlayers-map" />

                {/* <Snackbar
                    open={hasSeenElectionAnnouncement === false}
                    message="The Tasmania 2018 state election is now live!"
                    style={{ marginBottom: 56 }}
                    autoHideDuration={5000}
                    onRequestClose={onElectionAnnounceClose}
                /> */}

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
