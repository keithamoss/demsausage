import OpenLayersMap from 'ol/Map';
import * as Observable from 'ol/Observable';
import Attribution from 'ol/control/Attribution';
import type Control from 'ol/control/Control';
import type BaseEvent from 'ol/events/Event';
import { xhr } from 'ol/featureloader.js';
import GeoJSON from 'ol/format/GeoJSON';
import type Geometry from 'ol/geom/Geometry';
import { DblClickDragZoom, MouseWheelZoom, defaults as defaultInteractions } from 'ol/interaction';
import type Interaction from 'ol/interaction/Interaction';
import type BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
// c.f. Re proj import https://github.com/openlayers/openlayers/issues/8037
import type { MapBrowserEvent } from 'ol';
import type Feature from 'ol/Feature';
import View from 'ol/View';
import type { EventsKey } from 'ol/events';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import type { StyleFunction } from 'ol/style/Style';
import * as React from 'react';
import type { Election } from '../../../app/services/elections';
import { getAPIBaseURL } from '../../../app/utils';
import type { OLMapView } from '../../app/appSlice';
import type { IMapFilterSettings } from '../../pollingPlaces/pollingPlacesInterfaces';
import type { IMapPollingPlaceFeature, IMapPollingPlaceGeoJSONFeatureCollection } from '../mapHelpers';
import { olStyleFunction } from '../mapStyleHelpers';
import './OpenLayersMap.css';
// import { getAPIBaseURL } from '../../redux/modules/app'
// import { IElection } from '../../redux/modules/elections'
// import { IGeoJSONFeatureCollection } from '../../redux/modules/interfaces'
// import { IMapPollingPlaceFeature } from '../../redux/modules/polling_places'
// import { gaTrack } from '../../shared/analytics/GoogleAnalytics'

interface IProps {
	election: Election;
	olMapRef: React.MutableRefObject<OpenLayersMap | undefined>;
	initialMapView: Partial<OLMapView> | undefined;
	mapView: Partial<OLMapView> | undefined;
	// geojson: IGeoJSONFeatureCollection | undefined

	mapFilterSettings: IMapFilterSettings;
	onMapBeginLoading: () => void;
	onMapDataLoaded: (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) => void;
	onMapLoaded: () => void;
	onQueryMap: (features: Feature[]) => void;
	onMoveEnd?: (event: MapBrowserEvent<UIEvent>) => void;
	onDoubleClick?: (event: MapBrowserEvent<UIEvent>) => void;
	onPointerDown?: (event: MapBrowserEvent<UIEvent>) => void;
	onPointerUp?: (event: MapBrowserEvent<UIEvent>) => void;
	onWheelStart?: () => void;
	onWheelEnd?: () => void;
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
class DemSausageOpenLayersMap extends React.PureComponent<IProps, {}> {
	private map: OpenLayersMap | null;

	private vectorSourceChangedEventKey: EventsKey | undefined;

	private eventsKeys: EventsKey[];

	private onPointerDownBound: undefined | ((event: MapBrowserEvent<UIEvent>) => void);

	private onPointerUpBound: undefined | ((event: MapBrowserEvent<UIEvent>) => void);

	private wheelEventEndTimeout: number | undefined;

	private onWheelBound: undefined | ((event: MapBrowserEvent<UIEvent>) => void);

	private timeoutIds: number[];

	constructor(props: IProps) {
		super(props);

		this.map = null;
		this.timeoutIds = [];
		this.eventsKeys = [];
		this.onPointerDownBound = undefined;
		this.onPointerUpBound = undefined;
		this.wheelEventEndTimeout = undefined;
		this.onWheelBound = undefined;

		this.onMapContainerResize = this.onMapContainerResize.bind(this);
	}

	componentDidMount() {
		const { olMapRef, initialMapView } = this.props;

		this.map = new OpenLayersMap({
			layers: this.getBasemap(),
			target: 'openlayers-map',
			controls: [new Attribution()],
			interactions: defaultInteractions({
				mouseWheelZoom: false,
				pinchRotate: false,
				altShiftDragRotate: false,
			}).extend([new DblClickDragZoom(), new MouseWheelZoom()]),
			view: initialMapView !== undefined ? new View(initialMapView) : undefined,
		});
		olMapRef.current = this.map;

		// Accommodate the window resizing
		window.addEventListener('resize', this.onMapContainerResize.bind(this));

		// Account for the ElectionAppBar potentially being added/removed and changing the size of our map div
		this.onMapContainerResize();

		this.map.addLayer(this.getMapDataVectorLayer(/*this.map*/));

		this.eventsKeys.push(this.map.on('singleclick', this.onClickMap.bind(this)));

		this.eventsKeys.push(this.map.on('dblclick', this.onDoubleClick.bind(this)));

		// @TODO
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		this.eventsKeys.push(this.map.on('moveend' as any, this.onMoveEnd.bind(this)));

		this.onWheelBound = this.onWheel.bind(this);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		this.map.addEventListener('wheel', this.onWheelBound as any);

		// The pointer down/up events on OL's PointerInteractions don't do what we expect, so we use the regular 'ol pointerdown/pointerup events
		this.onPointerDownBound = this.onPointerDown.bind(this);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		this.map.addEventListener('pointerdown', this.onPointerDownBound as any);

		this.onPointerUpBound = this.onPointerUp.bind(this);
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		this.map.addEventListener('pointerup', this.onPointerUpBound as any);
	}

	componentDidUpdate(prevProps: IProps) {
		if (this.map !== null) {
			// Allow for elections changing
			if (prevProps.election !== this.props.election) {
				this.clearMapDataVectorLayer(this.map);
				this.map.addLayer(this.getMapDataVectorLayer(/*this.map*/));
			}

			// The view has changed and we've asked to update it
			if (this.props.mapView !== undefined) {
				this.map.setView(new View(this.props.mapView));
			}

			// The user has changed the noms filter options
			if (JSON.stringify(prevProps.mapFilterSettings) !== JSON.stringify(this.props.mapFilterSettings)) {
				const sausageLayer = this.getLayerByProperties(this.map, 'isSausageLayer', true);

				if (sausageLayer !== null) {
					const styleFunction = (feature: IMapPollingPlaceFeature, resolution: number) =>
						olStyleFunction(feature, resolution, this.props.mapFilterSettings, this.props.election.id);
					sausageLayer.setStyle(styleFunction as StyleFunction);
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
			Observable.unByKey(this.vectorSourceChangedEventKey);
			this.vectorSourceChangedEventKey = undefined;
		}

		// 1.1 And the other event listeners can go too
		if (this.eventsKeys !== undefined) {
			Observable.unByKey(this.eventsKeys);
		}

		// 2. Cancel any window.setTimeout() calls that may be running
		for (const timeoutId of this.timeoutIds) {
			window.clearTimeout(timeoutId);
		}

		// 3. Remove the window.onresize event that lets the map know to update its size when the viewport changes
		window.removeEventListener('resize', this.onMapContainerResize.bind(this));

		// 3.1 Remove other map event listeners
		if (this.map !== null) {
			if (this.onPointerDownBound !== undefined) {
				// @TODO
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				this.map.removeEventListener('pointerdown', this.onPointerDownBound as any);
				this.onPointerDownBound = undefined;
			}

			if (this.onPointerUpBound !== undefined) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				this.map.removeEventListener('pointerup', this.onPointerUpBound as any);
				this.onPointerUpBound = undefined;
			}

			if (this.onWheelBound !== undefined) {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				this.map.removeEventListener('wheel', this.onWheelBound as any);
				this.onWheelBound = undefined;
			}
		}

		// 4. Remove all layers, controls, and interactions on the map
		if (this.map !== null) {
			const layers = [...this.map.getLayers().getArray()];
			for (const l of layers) {
				if (this.map !== null) {
					this.map.removeLayer(l);
				}
			}

			const controls = [...this.map.getControls().getArray()];
			for (const c of controls) {
				if (this.map !== null) {
					this.map.removeControl(c);
				}
			}

			const interactions = [...this.map.getInteractions().getArray()];
			for (const i of interactions) {
				if (this.map !== null) {
					this.map.removeInteraction(i);
				}
			}
		}

		// 5. And finally clean up the map object itself
		// https://stackoverflow.com/a/25997026
		if (this.map !== null) {
			this.map.setTarget(undefined);
			this.map = null;
		}
	}

	private onMapContainerResize() {
		// Potted history of responding to window/container resize events in OpenLayers
		// https://gis.stackexchange.com/questions/31409/openlayers-redrawing-map-after-container-resize

		const timeoutId = window.setTimeout(
			(map: OpenLayersMap | undefined | null) => {
				if (map !== undefined && map !== null) {
					map.updateSize();
				}
			},
			200,
			this.map,
		);

		this.timeoutIds.push(timeoutId);
	}

	private onVectorSourceChanged(event: BaseEvent) {
		const { /*geojson, */ onMapDataLoaded, onMapLoaded } = this.props;
		const vectorSource = event.target as VectorSource<Geometry>;

		if (vectorSource.getState() === 'ready') {
			// Cache GeoJSON features in the local Redux store for recycling if the user navigates back
			// if (geojson === undefined) {
			//   const writer = new GeoJSON()
			//   onMapDataLoaded(writer.writeFeaturesObject(vectorSource.getFeatures()))
			// }
			const writer = new GeoJSON();
			const features = vectorSource.getFeatures();
			// @TODO Fix when we upgrade
			const geojson = writer.writeFeaturesObject(features) as IMapPollingPlaceGeoJSONFeatureCollection;
			onMapDataLoaded(geojson);

			// OpenLayers can take some time to actually render larger vector sources (i.e. Federal elections).
			// Wait for a bit before doing map onLoad things like zooming to search results.
			// If we don't wait then OpenLayers seems to stop rendering when the zoom starts, so the user sees nothing.
			const timeoutId = window.setTimeout(
				function (this: DemSausageOpenLayersMap) {
					onMapLoaded();
				}.bind(this),
				750,
			);

			this.timeoutIds.push(timeoutId);
		}
	}

	private onMoveEnd(event: MapBrowserEvent<UIEvent>) {
		if (this.props.onMoveEnd !== undefined) {
			this.props.onMoveEnd(event);
		}
	}

	private onWheel() {
		if (this.props.onWheelStart !== undefined && this.wheelEventEndTimeout === undefined) {
			this.props.onWheelStart();
		}

		clearTimeout(this.wheelEventEndTimeout);
		this.wheelEventEndTimeout = setTimeout(() => {
			if (this.props.onWheelEnd !== undefined) {
				this.props.onWheelEnd();
				this.wheelEventEndTimeout = undefined;
			}
		}, 250);
	}

	private onDoubleClick(event: MapBrowserEvent<UIEvent>) {
		if (this.props.onDoubleClick !== undefined) {
			this.props.onDoubleClick(event);
		}
	}

	private onPointerDown(event: MapBrowserEvent<UIEvent>) {
		if (this.props.onPointerDown !== undefined) {
			this.props.onPointerDown(event);
		}
	}

	private onPointerUp(event: MapBrowserEvent<UIEvent>) {
		if (this.props.onPointerUp !== undefined) {
			this.props.onPointerUp(event);
		}
	}

	private onClickMap(event: MapBrowserEvent<UIEvent>) {
		const { onQueryMap } = this.props;

		if (this.map !== null) {
			// gaTrack.event({
			//   category: 'OpenLayersMap',
			//   action: 'Query Features',
			// })

			const features: Feature[] = [];
			this.map.forEachFeatureAtPixel(
				event.pixel,
				(feature) => {
					features.push(feature as Feature);
				},
				{
					hitTolerance: 5,
					layerFilter: (layer: BaseLayer) => {
						const props = layer.getProperties();
						if ('isSausageLayer' in props && props.isSausageLayer === true) {
							return true;
						}
						return false;
					},
				},
			);

			// gaTrack.event({
			//   category: 'OpenLayersMap',
			//   action: 'Query Features',
			//   label: 'Number of Features',
			//   value: features.length,
			// })

			if (features.length > 0) {
				onQueryMap(features.slice(0, 20));
			}
		}
	}

	private getMapDataVectorLayer(/*map: Map*/) {
		const { election, /*geojson, */ mapFilterSettings, onMapBeginLoading } = this.props;
		const geojson = undefined;

		const vectorSource = new VectorSource({
			format: new GeoJSON(),
			loader(this, extent, resolution, projection) {
				if (geojson === undefined) {
					// Fetch GeoJSON from remote
					onMapBeginLoading();
					const url = `${getAPIBaseURL()}/0.1/map/?election_id=${election.id}&s=${Date.now()}`;
					// https://openlayers.org/en/latest/apidoc/module-ol_featureloader.html#~FeatureLoader
					xhr(url, this.getFormat() as GeoJSON).call(
						this,
						extent,
						resolution,
						projection,
						() => {},
						() => {},
					);
				} else {
					// Load GeoJSON from local Redux store
					if ('addFeatures' in this) {
						this.addFeatures((this.getFormat() as GeoJSON).readFeatures(geojson));
					}
				}
			},
		});

		this.vectorSourceChangedEventKey = vectorSource.once('change', this.onVectorSourceChanged.bind(this));

		const styleFunction = (feature: IMapPollingPlaceFeature, resolution: number) =>
			olStyleFunction(feature, resolution, mapFilterSettings, this.props.election.id);

		const vectorLayer = new VectorLayer({
			// renderMode: 'image',
			source: vectorSource,
			style: styleFunction as StyleFunction,
		});

		vectorLayer.setProperties({ isSausageLayer: true });

		return vectorLayer;
	}

	private clearMapDataVectorLayer(map: OpenLayersMap) {
		const vectorLayer = this.getLayerByProperties(map, 'isSausageLayer', true);
		if (vectorLayer !== null) {
			map.removeLayer(vectorLayer);
		}
	}

	private getLayerByProperties(
		map: OpenLayersMap,
		propName: string,
		propValue: boolean,
	): VectorLayer<VectorSource<Geometry>> | null {
		let layer = null;

		// biome-ignore lint/complexity/noForEach: <explanation>
		map.getLayers().forEach((l: BaseLayer) => {
			const props = l.getProperties();
			if (propName in props && props[propName] === propValue) {
				layer = l;
			}
		});
		return layer;
	}

	private getBasemap() {
		// gaTrack.event({
		//   category: 'OpenLayersMap',
		//   action: 'Basemap Shown',
		//   label: 'Carto',
		// })

		return [
			new TileLayer({
				source: new OSM({
					// https://carto.com/location-data-services/basemaps/
					url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
					attributions: [
						'© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
					],
				}),
			}),
		];
	}

	render() {
		return <div id="openlayers-map" className="openlayers-map" />;
	}
}

export default DemSausageOpenLayersMap;
