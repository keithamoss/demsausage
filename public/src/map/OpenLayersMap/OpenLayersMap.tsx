// @ts-ignore
import { MapBrowserEvent } from "ol.js"
import Attribution from "ol/control/Attribution"
import Control from "ol/control/Control"
import Event from "ol/events/Event"
import Feature from "ol/Feature"
// @ts-ignore
import { xhr } from "ol/featureloader.js"
import GeoJSON from "ol/format/GeoJSON"
import Point from "ol/geom/Point"
import Polygon from "ol/geom/Polygon"
import Interaction from "ol/interaction/Interaction"
import BaseLayer from "ol/layer/Base"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import Map from "ol/Map"
import * as Observable from "ol/Observable"
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
import { IGeoJSONFeatureCollection } from "../../redux/modules/interfaces"
import { IMapFilterOptions, IMapSearchResults, olStyleFunction } from "../../redux/modules/map"
import { IMapPollingPlaceFeature } from "../../redux/modules/polling_places"
import { gaTrack } from "../../shared/analytics/GoogleAnalytics"

export interface IProps {
    election: IElection
    geojson: IGeoJSONFeatureCollection | undefined
    mapSearchResults: IMapSearchResults | null
    mapFilterOptions: IMapFilterOptions
    onMapBeginLoading: Function
    onMapDataLoaded: Function
    onMapLoaded: Function
    onQueryMap: Function
}

class OpenLayersMap extends React.PureComponent<IProps, {}> {
    private map: Map | null
    private vectorSourceChangedEventKey: any | undefined /* ol.EventsKey */
    private timeoutIds: number[]

    constructor(props: IProps) {
        super(props)

        this.map = null
        this.timeoutIds = []
    }

    componentDidMount() {
        const { election } = this.props

        this.map = new Map({
            layers: this.getBasemap(),
            target: "openlayers-map",
            controls: [new Attribution()],
        })

        let view = this.map.getView()
        // @ts-ignore
        const polygon = new Polygon(election.geom.coordinates).transform("EPSG:4326", "EPSG:3857")
        // @ts-ignore
        view.fit(polygon, {
            size: this.map.getSize(),
            // padding: [1, 1, 1, 1],
            callback: (completed: boolean) => {
                if (completed === true) {
                    let centre = view.getCenter()
                    centre[0] -= 1
                    view.setCenter(centre)
                }
            },
        })

        // Accommodate the window resizing
        window.onresize = this.onMapContainerResize.bind(this)

        // Account for the ElectionAppBar potentially being added/removed and changing the size of our map div
        this.onMapContainerResize()

        this.map.addLayer(this.getMapDataVectorLayer(this.map))

        this.map.on("singleclick", this.onClickMap.bind(this))
    }

    componentDidUpdate(prevProps: IProps) {
        if (this.map !== null) {
            if (prevProps.mapSearchResults !== this.props.mapSearchResults) {
                // The user has performed a search by location
                const { mapSearchResults } = this.props

                // Zoom the user down to the bounding box of the polling places that are near their search area
                if (mapSearchResults !== null) {
                    this.zoomMapToSearchResults(this.map)
                } else {
                    // Remove any existing search indicator layer
                    this.clearSearchResultsVectorLayer(this.map)
                }
            } else if (JSON.stringify(prevProps.mapFilterOptions) !== JSON.stringify(this.props.mapFilterOptions)) {
                // The user has changed the noms filter options
                const sausageLayer = this.getLayerByProperties(this.map, "isSausageLayer", true)
                if (sausageLayer !== null) {
                    // @ts-ignore
                    sausageLayer.setStyle((feature: IMapPollingPlaceFeature, resolution: number) =>
                        olStyleFunction(feature, resolution, this.props.mapFilterOptions)
                    )
                }
            }
        }
    }

    componentWillUnmount() {
        // 1. Remove the "on data loaded" change event
        // This doesn't work - presumably because of .bind(this)
        // l.getSource().un("changed", this.onVectorSourceChanged.bind(this))

        // ... So we use Observable.unByKey
        // https://gis.stackexchange.com/a/241531
        if (this.vectorSourceChangedEventKey !== undefined) {
            // @ts-ignore
            Observable.unByKey(this.vectorSourceChangedEventKey)
        }

        // 2. Cancel any window.setTimeout() calls that may be running
        this.timeoutIds.forEach((timeoutId: number) => window.clearTimeout(timeoutId))

        // 3. Remove all layers, controls, and interactions on the map
        if (this.map !== null) {
            const layers = [...this.map.getLayers().getArray()]
            layers.forEach((l: BaseLayer | VectorLayer) => {
                if (this.map !== null) {
                    this.map.removeLayer(l)
                }
            })

            const controls = [...this.map.getControls().getArray()]
            controls.forEach((c: Control) => {
                if (this.map !== null) {
                    this.map.removeControl(c)
                }
            })

            const interactions = [...this.map.getInteractions().getArray()]
            interactions.forEach((i: Interaction) => {
                if (this.map !== null) {
                    this.map.removeInteraction(i)
                }
            })
        }

        // 4. And finally clean up the map object itself
        // https://stackoverflow.com/a/25997026
        if (this.map !== null) {
            // @ts-ignore
            this.map.setTarget(null)
            this.map = null
        }
    }

    render() {
        return <div id="openlayers-map" className="openlayers-map" />
    }

    private onMapContainerResize() {
        // Potted history of responding to window/container resize events in OpenLayers
        // https://gis.stackexchange.com/questions/31409/openlayers-redrawing-map-after-container-resize

        const timeoutId = setTimeout(
            (map: Map) => {
                map.updateSize()
            },
            200,
            this.map
        )

        this.timeoutIds.push(timeoutId)
    }

    private onVectorSourceChanged(event: Event) {
        const { geojson, mapSearchResults, onMapDataLoaded, onMapLoaded } = this.props
        const vectorSource = event.target

        if (vectorSource.getState() === "ready") {
            // Cache GeoJSON features in the local Redux store for recycling if the user navigates back
            if (geojson === undefined) {
                const writer = new GeoJSON()
                onMapDataLoaded(writer.writeFeaturesObject(vectorSource.getFeatures()))
            }

            // OpenLayers can take some time to actually render larger vector sources (i.e. Federal elections).
            // Wait for a bit before doing map onLoad things like zooming to search results.
            // If we don't wait then OpenLayers seems to stop rendering when the zoom starts, so the user sees nothing.
            const timeoutId = window.setTimeout(
                function(this: OpenLayersMap) {
                    if (this.map !== null) {
                        onMapLoaded()

                        if (mapSearchResults !== null) {
                            this.zoomMapToSearchResults(this.map)
                        } else {
                            this.workaroundOLRenderingBug(this.map.getView())
                        }
                    }
                }.bind(this),
                750
            )

            this.timeoutIds.push(timeoutId)
        }
    }

    private workaroundOLRenderingBug(view: View) {
        // @TODO Hacky fix for the GeoJSON loading, but not rendering until the map view changes.
        // const centre = view.getCenter()
        // centre[0] -= 1
        // view.setCenter(centre)
        // view.changed()
    }

    private getMapDataVectorLayer(map: Map) {
        const { election, geojson, mapFilterOptions, onMapBeginLoading } = this.props

        const vectorSource = new VectorSource({
            format: new GeoJSON(),
            loader: async function(this: VectorSource, extent: any, resolution: number, projection: any) {
                if (geojson === undefined) {
                    // Fetch GeoJSON from remote
                    onMapBeginLoading()
                    const url = `${getAPIBaseURL()}/0.1/map/?election_id=${election.id}&s=${Date.now()}`
                    xhr(url, this.getFormat()).call(this, extent, resolution, projection)
                } else {
                    // Load GeoJSON from local Redux store
                    this.addFeatures((this.getFormat() as GeoJSON).readFeatures(geojson))
                }
            },
        })

        this.vectorSourceChangedEventKey = vectorSource.once("change", this.onVectorSourceChanged.bind(this))

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

    private addSearchResultsVectorLayer(map: Map) {
        this.workaroundOLRenderingBug(map.getView())

        const searchResultsVectorLayerNew = this.getSearchResultsVectorLayer(map)
        if (searchResultsVectorLayerNew !== null) {
            map.addLayer(searchResultsVectorLayerNew)
        }
    }

    private clearSearchResultsVectorLayer(map: Map) {
        const searchResultsVectorLayer = this.getLayerByProperties(map, "isSearchIndicatorLayer", true)
        if (searchResultsVectorLayer !== null) {
            map.removeLayer(searchResultsVectorLayer)
        }
    }

    private zoomMapToSearchResults(map: Map) {
        const { mapSearchResults } = this.props
        const that = this

        if (mapSearchResults !== null) {
            let view = map.getView()

            if (mapSearchResults.extent !== null) {
                // Remove any existing search indicator layer
                this.clearSearchResultsVectorLayer(map)

                view.fit(transformExtent(mapSearchResults.extent, "EPSG:4326", "EPSG:3857"), {
                    size: map.getSize(),
                    duration: 750,
                    padding: [85, 0, 20, 0],
                    callback: (completed: boolean) => {
                        if (completed === true) {
                            that.addSearchResultsVectorLayer(map)
                        }
                    },
                })
            } else if (mapSearchResults.lat !== null && mapSearchResults.lon !== null) {
                view.fit(new Point(transform([mapSearchResults.lon, mapSearchResults.lat], "EPSG:4326", "EPSG:3857")), {
                    minResolution: 4,
                    size: map.getSize(),
                    duration: 750,
                })
            }
        }
    }

    private onClickMap(event: MapBrowserEvent) {
        const { onQueryMap } = this.props

        if (this.map !== null) {
            gaTrack.event({
                category: "OpenLayersMap",
                action: "Query Features",
            })

            let features: Array<any> = []
            this.map.forEachFeatureAtPixel(
                event.pixel,
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
        }
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
