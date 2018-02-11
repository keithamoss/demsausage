import * as React from "react"
import styled from "styled-components"
import { browserHistory } from "react-router"
// import "./SausageMap.css"
import { IElection } from "../../redux/modules/interfaces"
import { getAPIBaseURL } from "../../redux/modules/app"

import * as ol from "openlayers"
import SearchBar from "material-ui-search-bar"
import DeviceLocationSearching from "material-ui/svg-icons/device/location-searching"
import { grey500 } from "material-ui/styles/colors"

const SearchBarContainer = styled.div`
    position: relative;
    display: block;
    margin-top: 30px;
    margin-left: 20px;
    margin-right: 20px;
`

export interface IProps {
    election: IElection
}

const spriteBBQ = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 61],
        size: [32, 32],
        src: "./icons/sprite.png",
    }),
})
const spriteCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 0],
        size: [32, 32],
        src: "./icons/sprite.png",
    }),
})
const spriteBBQCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 32],
        size: [32, 29],
        src: "./icons/sprite.png",
    }),
})
const spriteNowt = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 93],
        size: [24, 24],
        src: "./icons/sprite.png",
    }),
})
const spriteUnknown = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 117],
        size: [14, 14],
        src: "./icons/sprite.png",
        opacity: 0.6,
    }),
})

const styleFunctionSprite = function(feature: any) {
    if (feature.get("has_bbq") === true && feature.get("has_caek") === true) {
        return spriteBBQCake
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
        const { election } = this.props

        const vectorSource = new ol.source.Vector({
            url: `${getAPIBaseURL()}/elections/election.php?id=${election.id}&s=${Date.now()}`,
            format: new ol.format.GeoJSON(),
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
    }

    render() {
        return (
            <div>
                <div id="openlayers-map" className="openlayers-map" />

                <SearchBarContainer>
                    <SearchBar
                        hintText={"Find polling places with sausages"}
                        // tslint:disable-next-line:no-empty
                        onChange={() => {}}
                        onClick={() => browserHistory.push("/search")}
                        onRequestSearch={() => console.log("onRequestSearch")}
                        searchIcon={<DeviceLocationSearching color={grey500} />}
                        style={{
                            margin: "0 auto",
                            maxWidth: 800,
                        }}
                    />
                </SearchBarContainer>
            </div>
        )
    }
}

export default SausageMap
