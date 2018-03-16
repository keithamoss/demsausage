import * as React from "react"
// import "./OpenLayersMap.css"
import { IElection } from "../../redux/modules/interfaces"
import { getAPIBaseURL, getMapboxAPIKey } from "../../redux/modules/app"
import { isItElectionDay } from "../../redux/modules/elections"

import * as ol from "openlayers"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IProps {
    election: IElection
    onQueryMap: Function
}

const spriteCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 0],
        size: [32, 32],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQCakeRunOut = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 32],
        size: [32, 29],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 61],
        size: [32, 29],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQ = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 90],
        size: [32, 32],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteNowt = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 122],
        size: [24, 24],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteUnknown = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 146],
        size: [14, 14],
        src: "./icons/sprite_v2.png",
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
    } else if (feature.get("has_bbq") === false && feature.get("has_caek") === false && feature.get("has_other") === true) {
        return spriteBBQ
    } else {
        return spriteUnknown
    }
}

class OpenLayersMap extends React.PureComponent<IProps, {}> {
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

        const getBasemap = () => {
            if (isItElectionDay(election) === true) {
                return [
                    new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: `https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=${getMapboxAPIKey()}`,
                            crossOrigin: "anonymous",
                        }),
                    }),
                ]
            } else {
                return [
                    new ol.layer.Tile({
                        source: new ol.source.OSM({
                            // https://carto.com/location-data-services/basemaps/
                            url: "http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                            attributions: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.`,
                        }),
                    }),
                    // new ol.layer.Tile({
                    //     source: new ol.source.OSM({
                    //         attributions: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.`,
                    //     }),
                    // }),
                ]
            }
        }

        const map = new ol.Map({
            renderer: ["canvas"],
            layers: getBasemap(),
            target: "openlayers-map",
            controls: [],
            view: new ol.View({
                center: ol.proj.transform([election.lon, election.lat], "EPSG:4326", "EPSG:3857"),
                zoom: election.default_zoom_level,
            }),
        })

        map.addLayer(vectorLayer)

        map.on("singleclick", function(e: any) {
            gaTrack.event({
                category: "OpenLayersMap",
                action: "Query Features",
            })

            let features: Array<any> = []
            map.forEachFeatureAtPixel(
                e.pixel,
                (feature: any, layer: any) => {
                    features.push(feature.getProperties())
                },
                { hitTolerance: 3 }
            )

            gaTrack.event({
                category: "OpenLayersMap",
                action: "Query Features",
                label: "Number of Features",
                value: features.length,
            })

            // SausageMap.queriedPollingPlaces displays a "Too many polling places - try to zoom/find"
            // if we have more than 20
            onQueryMap(features.slice(0, 21))
        })
    }

    render() {
        return <div id="openlayers-map" className="openlayers-map" />
    }
}

export default OpenLayersMap
