import Attribution from "ol/control/Attribution"
import Feature from "ol/Feature"
import GeoJSON from "ol/format/GeoJSON"
import Point from "ol/geom/Point"
import BaseLayer from "ol/layer/Base"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import Map from "ol/Map"
import "ol/ol.css"
// c.f. Re proj import https://github.com/openlayers/openlayers/issues/8037
// @ts-ignore
import { transform, transformExtent } from "ol/proj.js"
import OSM from "ol/source/OSM"
import VectorSource from "ol/source/Vector"
import Fill from "ol/style/Fill"
import RegularShape from "ol/style/RegularShape"
import Stroke from "ol/style/Stroke"
import Style from "ol/style/Style"
import View from "ol/View"
import * as React from "react"
import { getAPIBaseURL } from "../../redux/modules/app"
import { IElection } from "../../redux/modules/elections"
import { IMapFilterOptions, IMapSearchResults, olStyleFunction } from "../../redux/modules/map"
import { IMapPollingPlaceFeature } from "../../redux/modules/polling_places"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IProps {
    election: IElection
    mapSearchResults: IMapSearchResults | null
    mapFilterOptions: IMapFilterOptions
    onQueryMap: Function
}

class OpenLayersMap extends React.PureComponent<IProps, {}> {
    private map: Map | null

    constructor(props: IProps) {
        super(props)

        this.map = null
    }

    componentDidMount() {
        const { election, onQueryMap } = this.props

        this.map = new Map({
            layers: this.getBasemap(),
            target: "openlayers-map",
            controls: [new Attribution()],
            view: new View({
                center: transform(election.geom.coordinates, "EPSG:4326", "EPSG:3857"),
                zoom: election.default_zoom_level,
            }),
        })

        // Account for the ElectionAppBar potentially being added/removed and changing the size of our map div
        window.setTimeout(
            (map: Map) => {
                map.updateSize()
            },
            1,
            this.map
        )

        this.map.addLayer(this.getMapDataVectorLayer(this.map))

        const map = this.map
        this.map.on("singleclick", function(e: any) {
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
                {
                    hitTolerance: 3,
                    layerFilter: (layer: BaseLayer) => {
                        const props = layer.getProperties()
                        if ("isSausageLayer" in props && props.isSausageLayer === true) {
                            return true
                        }
                        return false
                    },
                }
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

    componentDidUpdate(prevProps: IProps) {
        if (this.map !== null && prevProps.mapSearchResults !== this.props.mapSearchResults) {
            const { mapSearchResults } = this.props

            // Zoom the user down to the bounding box of the polling places that are near their search area
            if (mapSearchResults !== null) {
                this.zoomMapToSearchResults(this.map)
            }
        } else if (this.map !== null && JSON.stringify(prevProps.mapFilterOptions) !== JSON.stringify(this.props.mapFilterOptions)) {
            const sausageLayer = this.getLayerByProperties(this.map, "isSausageLayer", true)
            if (sausageLayer !== null) {
                // @ts-ignore
                sausageLayer.setStyle((feature: IMapPollingPlaceFeature, resolution: number) =>
                    olStyleFunction(feature, resolution, this.props.mapFilterOptions)
                )
            }
        }
    }

    render() {
        return <div id="openlayers-map" className="openlayers-map" />
    }

    private getMapDataVectorLayer(map: Map) {
        const { election, mapSearchResults, mapFilterOptions } = this.props

        const vectorSource = new VectorSource({
            url: `${getAPIBaseURL()}/0.1/map/?election_id=${election.id}&s=${Date.now()}`,
            format: new GeoJSON(),
        })

        // @TODO Hacky fix for the GeoJSON loading, but not rendering until the user interacts with the map
        const that = this
        vectorSource.on("change", function(e: any) {
            // OpenLayers can take some time to actually render larger vector sources (i.e. Federal elections). Wait for a bit before zooming to give it time.
            if (vectorSource.getState() === "ready") {
                window.setTimeout(function() {
                    map.getView().changed()
                    let view = map.getView()

                    if (mapSearchResults !== null) {
                        that.zoomMapToSearchResults(map)
                    } else {
                        let centre = view.getCenter()
                        centre[0] -= 1
                        view.setCenter(centre)
                    }

                    map.setView(view)
                }, 750)
            }
        })

        const styleFunction = (feature: IMapPollingPlaceFeature, resolution: number) =>
            olStyleFunction(feature, resolution, mapFilterOptions)

        const vectorLayer = new VectorLayer({
            renderMode: "image",
            source: vectorSource,
            style: styleFunction,
        } as any)

        vectorLayer.setProperties({ isSausageLayer: true })

        return vectorLayer
    }

    private getLayerByProperties(map: Map, propName: string, propValue: any): VectorLayer | null {
        let layer = null
        map.getLayers().forEach((l: BaseLayer) => {
            const props = l.getProperties()
            if (propName in props && props[propName] === propValue) {
                layer = l
            }
        })
        return layer
    }

    private getSearchResultsVectorLayer(map: Map) {
        const { mapSearchResults } = this.props

        if (mapSearchResults !== null) {
            const iconFeature = new Feature({
                geometry: new Point(transform([mapSearchResults.lon, mapSearchResults.lat], "EPSG:4326", "EPSG:3857")),
            })

            iconFeature.setStyle(
                new Style({
                    image: new RegularShape({
                        fill: new Fill({ color: "#6740b4" }),
                        stroke: new Stroke({ color: "black", width: 2 }),
                        points: 5,
                        radius: 10,
                        radius2: 4,
                        angle: 0,
                    }),
                })
            )

            const vectorLayer = new VectorLayer({
                source: new VectorSource({
                    features: [iconFeature],
                }),
            })

            vectorLayer.setProperties({ isSearchIndicatorLayer: true })

            return vectorLayer
        }
        return null
    }

    private zoomMapToSearchResults(map: Map) {
        const { mapSearchResults } = this.props

        if (mapSearchResults !== null && mapSearchResults.extent !== null) {
            // Remove any existing search indicator layer
            const searchResultsVectorLayer = this.getLayerByProperties(map, "isSearchIndicatorLayer", true)
            if (searchResultsVectorLayer !== null) {
                map.removeLayer(searchResultsVectorLayer)
            }

            let view = map.getView()
            view.fit(transformExtent(mapSearchResults.extent, "EPSG:4326", "EPSG:3857"), {
                size: map.getSize(),
                duration: 750,
                padding: [85, 0, 20, 0],
                callback: (completed: boolean) => {
                    if (completed === true) {
                        let centre = view.getCenter()
                        centre[0] -= 1
                        view.setCenter(centre)

                        const searchResultsVectorLayerNew = this.getSearchResultsVectorLayer(map)
                        if (searchResultsVectorLayerNew !== null) {
                            map.addLayer(searchResultsVectorLayerNew)
                        }
                    }
                },
            })
        }
    }

    private getBasemap() {
        gaTrack.event({
            category: "OpenLayersMap",
            action: "Basemap Shown",
            label: "Carto",
        })

        return [
            new TileLayer({
                source: new OSM({
                    // https://carto.com/location-data-services/basemaps/
                    url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
                    attributions: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.`,
                }),
            }),
        ]
    }
}

export default OpenLayersMap
