import * as ol from "openlayers"
import "openlayers/css/ol.css"
import * as React from "react"
import { getAPIBaseURL } from "../../redux/modules/app"
import { IElection } from "../../redux/modules/elections"
import { IMapPollingGeoJSONNoms, IMapPollingPlaceFeature } from "../../redux/modules/polling_places"
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

const styleFunctionSprite = function(feature: IMapPollingPlaceFeature) {
    const noms: IMapPollingGeoJSONNoms = feature.get("noms")

    if (noms !== null) {
        if (noms.bbq === true && noms.cake === true) {
            return spriteBBQCake
        } else if ((noms.bbq === true || noms.cake === true) && noms.run_out === true) {
            return spriteBBQCakeRunOut
        } else if (noms.bbq === true) {
            return spriteBBQ
        } else if (noms.cake === true) {
            return spriteCake
        } else if (noms.nothing === true) {
            return spriteNowt
        } else if (noms.bbq === false && noms.cake === false && noms.other === true) {
            return spriteBBQ
        }
    }

    return spriteUnknown
}
class OpenLayersMap extends React.PureComponent<IProps, {}> {
    componentDidMount() {
        const { election, onQueryMap } = this.props

        const vectorSource = new ol.source.Vector({
            url: `${getAPIBaseURL()}/0.1/map/?election_id=${election.id}&s=${Date.now()}`,
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
            gaTrack.event({
                category: "OpenLayersMap",
                action: "Basemap Shown",
                label: "Carto",
            })

            return [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        // https://carto.com/location-data-services/basemaps/
                        url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                        attributions: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.`,
                    }),
                }),
            ]
        }

        const map = new ol.Map({
            renderer: ["canvas"],
            layers: getBasemap(),
            target: "openlayers-map",
            controls: [
                new ol.control.Attribution({
                    collapsible: false,
                }),
            ],
            view: new ol.View({
                center: ol.proj.transform(election.geom.coordinates, "EPSG:4326", "EPSG:3857"),
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
                    features.push(feature)
                },
                { hitTolerance: 3 }
            )

            gaTrack.event({
                category: "OpenLayersMap",
                action: "Query Features",
                label: "Number of Features",
                value: features.length,
            })

            if (features.length > 0) {
                // SausageMap.queriedPollingPlaces displays a "Too many polling places - try to zoom/find" if we have more than 20
                onQueryMap(features.slice(0, 21))
            }
        })
    }

    render() {
        return <div id="openlayers-map" className="openlayers-map" />
    }
}

export default OpenLayersMap
