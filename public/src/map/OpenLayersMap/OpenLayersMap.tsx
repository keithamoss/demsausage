import * as ol from "openlayers"
import "openlayers/css/ol.css"
import * as React from "react"
import { getAPIBaseURL } from "../../redux/modules/app"
import { IElection } from "../../redux/modules/elections"
import { IMapFilterOptions, IMapSearchResults, MapMode, olStyleFunction } from "../../redux/modules/map"
import { IMapPollingPlaceFeature } from "../../redux/modules/polling_places"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IProps {
    election: IElection
    mapMode: MapMode | null
    mapSearchResults: IMapSearchResults | null
    mapFilterOptions: IMapFilterOptions
    onQueryMap: Function
    onEmptySearchResults: Function
}

class OpenLayersMap extends React.PureComponent<IProps, {}> {
    private map: ol.Map | null

    constructor(props: IProps) {
        super(props)

        this.map = null
    }

    componentDidMount() {
        const { election, mapMode, mapSearchResults, onQueryMap } = this.props

        this.map = new ol.Map({
            renderer: ["canvas"],
            layers: this.getBasemap(),
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

        // Account for the ElectionAppBar being added/removed and changing the size of our map div
        window.setTimeout(
            (map: ol.Map) => {
                map.updateSize()
            },
            1,
            this.map
        )

        this.map.addLayer(this.getVectorLayer(this.map))

        if (mapMode === MapMode.SHOW_SEARCH_RESULTS && mapSearchResults !== null) {
            const layer = this.getYourLocationVectorLayer(this.map)
            if (layer !== null) {
                this.map.addLayer(layer)
            }
        }

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
                    layerFilter: (layer: ol.layer.Base) => {
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
        if (this.map !== null && prevProps.mapMode !== this.props.mapMode) {
            const layersToRemove: any = []
            this.map.getLayers().forEach((layer: ol.layer.Base) => {
                if (layer instanceof ol.layer.Vector && this.map !== null) {
                    layersToRemove.push(layer)
                }
            })

            layersToRemove.forEach((layer: ol.layer.Base) => {
                if (this.map !== null) {
                    this.map.removeLayer(layer)
                }
            })

            this.map.addLayer(this.getVectorLayer(this.map))

            if (this.props.mapMode === MapMode.SHOW_SEARCH_RESULTS && this.props.mapSearchResults !== null) {
                const layer = this.getYourLocationVectorLayer(this.map)
                if (layer !== null) {
                    this.map.addLayer(layer)
                }
            }
        } else if (this.map !== null && JSON.stringify(prevProps.mapFilterOptions) !== JSON.stringify(this.props.mapFilterOptions)) {
            const sausageLayer = this.getSausageLayer(this.map)
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

    private getVectorLayer(map: ol.Map) {
        const { election, mapMode, mapSearchResults, mapFilterOptions, onEmptySearchResults } = this.props

        const vectorSource = new ol.source.Vector({
            url: () => {
                if (mapMode === MapMode.SHOW_SEARCH_RESULTS && mapSearchResults !== null) {
                    return `${getAPIBaseURL()}/0.1/polling_places/nearby/?election_id=${election.id}&lonlat=${mapSearchResults.lon},${
                        mapSearchResults.lat
                    }`
                }
                return `${getAPIBaseURL()}/0.1/map/?election_id=${election.id}&s=${Date.now()}`
            },
            format: new ol.format.GeoJSON(),
        })

        // @TODO Hacky fix for the GeoJSON loading, but not rendering until the user interacts with the map
        vectorSource.on("change", function(e: any) {
            if (vectorSource.getState() === "ready") {
                window.setTimeout(function() {
                    map.getView().changed()
                    let view = map.getView()

                    if (mapMode === MapMode.SHOW_SEARCH_RESULTS && mapSearchResults !== null) {
                        if (vectorSource.getFeatures().length > 0) {
                            view.fit(vectorSource.getExtent(), {
                                size: map.getSize(),
                                duration: 750,
                                padding: [85, 0, 20, 0],
                                callback: (completed: boolean) => {
                                    if (completed === true) {
                                        let centre = view.getCenter()
                                        centre[0] -= 1
                                        view.setCenter(centre)
                                    }
                                },
                            })
                        } else {
                            onEmptySearchResults()
                        }
                    } else {
                        let centre = view.getCenter()
                        centre[0] -= 1
                        view.setCenter(centre)
                    }

                    map.setView(view)
                }, 500)
            }
        })

        const styleFunction = (feature: IMapPollingPlaceFeature, resolution: number) =>
            olStyleFunction(feature, resolution, mapFilterOptions)

        const vectorLayer = new ol.layer.Vector({
            renderMode: "image",
            source: vectorSource,
            style: styleFunction,
        } as any)

        vectorLayer.setProperties({ isSausageLayer: true })

        return vectorLayer
    }

    private getSausageLayer(map: ol.Map): ol.layer.Vector | null {
        let layer = null
        map.getLayers().forEach((l: ol.layer.Base) => {
            const props = l.getProperties()
            if ("isSausageLayer" in props && props.isSausageLayer === true) {
                layer = l
            }
        })
        return layer !== null ? layer : null
    }

    private getYourLocationVectorLayer(map: ol.Map) {
        const { mapMode, mapSearchResults } = this.props

        if (mapMode === MapMode.SHOW_SEARCH_RESULTS && mapSearchResults !== null) {
            const iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([mapSearchResults.lon, mapSearchResults.lat], "EPSG:4326", "EPSG:3857")),
            })

            iconFeature.setStyle(
                new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({ color: "#6740b4" }),
                        stroke: new ol.style.Stroke({ color: "black", width: 2 }),
                        points: 5,
                        radius: 10,
                        radius2: 4,
                        angle: 0,
                    }),
                })
            )

            return new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [iconFeature],
                }),
            })
        }
        return null
    }

    private getBasemap() {
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
}

export default OpenLayersMap
