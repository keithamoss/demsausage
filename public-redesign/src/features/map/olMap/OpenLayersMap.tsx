/* eslint-disable import/extensions */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { MapBrowserEvent } from 'ol.js';
import Attribution from 'ol/control/Attribution';
import Control from 'ol/control/Control';
import BaseEvent from 'ol/events/Event';
import { DblClickDragZoom, MouseWheelZoom, defaults as defaultInteractions } from 'ol/interaction';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Map from 'ol/Map';
import * as Observable from 'ol/Observable';
import { xhr } from 'ol/featureloader.js';
import GeoJSON from 'ol/format/GeoJSON';
import Geometry from 'ol/geom/Geometry';
import Polygon from 'ol/geom/Polygon';
import Interaction from 'ol/interaction/Interaction';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
// c.f. Re proj import https://github.com/openlayers/openlayers/issues/8037
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import VectorTile from 'ol/VectorTile';
import View from 'ol/View';
import { EventsKey } from 'ol/events';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import * as React from 'react';
import { Election } from '../../../app/services/elections';
import { OLMapView } from '../../app/appSlice';
import { IMapFilterSettings } from '../../icons/noms';
import { doesTheMapViewMatchThisView, getStandardViewPadding } from '../mapHelpers';
import { IMapPollingPlaceFeature, getAPIBaseURL, olStyleFunction } from '../map_stuff';
import './OpenLayersMap.css';
// import { getAPIBaseURL } from '../../redux/modules/app'
// import { IElection } from '../../redux/modules/elections'
// import { IGeoJSONFeatureCollection } from '../../redux/modules/interfaces'
// import { IMapPollingPlaceFeature } from '../../redux/modules/polling_places'
// import { gaTrack } from '../../shared/analytics/GoogleAnalytics'

interface IProps {
	election: Election;
	olMapRef: React.MutableRefObject<Map | undefined>;
	mapView: Partial<OLMapView> | undefined;
	isDraggingRef: React.MutableRefObject<boolean>;
	isScrollZoomingRef: React.MutableRefObject<boolean>;
	// geojson: IGeoJSONFeatureCollection | undefined

	mapFilterSettings: IMapFilterSettings;
	onMapBeginLoading: Function;
	onMapDataLoaded: Function;
	onMapLoaded: Function;
	onQueryMap: Function;
	onMoveEnd?: (event: MapBrowserEvent) => void;
	onDoubleClick?: (event: MapBrowserEvent) => void;
	onPointerDown?: (event: MapBrowserEvent) => void;
	onPointerUp?: (event: MapBrowserEvent) => void;
}

class OpenLayersMap extends React.PureComponent<IProps, {}> {
	private map: Map | null;

	private vectorSourceChangedEventKey: EventsKey | undefined;

	private eventsKeys: EventsKey[];

	private onPointerDownBound: undefined | ((event: MapBrowserEvent) => void);

	private onPointerUpBound: undefined | ((event: MapBrowserEvent) => void);

	private timeoutIds: number[];

	constructor(props: IProps) {
		super(props);

		this.map = null;
		this.timeoutIds = [];
		this.eventsKeys = [];
		this.onPointerDownBound = undefined;
		this.onPointerUpBound = undefined;

		this.onMapContainerResize = this.onMapContainerResize.bind(this);
	}

	private fitMapViewToElection(election: Election) {
		if (this.map !== null) {
			const view = this.map.getView();
			const polygon = new Polygon(election.geom.coordinates).transform('EPSG:4326', 'EPSG:3857');

			view.fit(polygon.getExtent(), {
				// @TODO Make this work for embedded mode
				padding: getStandardViewPadding(),
				callback: (completed: boolean) => {
					if (completed === true) {
						const centre = view.getCenter();
						if (centre !== undefined) {
							// Prevents error "Cannot assign to read only property '0' of object '[object Array]"
							const centreCopy = [...centre];
							centreCopy[0] -= 1;
							view.setCenter(centreCopy);
						}
					}
				},
			});
		}
	}

	componentDidMount() {
		const { election, olMapRef, mapView, isScrollZoomingRef } = this.props;

		this.map = new Map({
			layers: this.getBasemap(),
			target: 'openlayers-map',
			controls: [new Attribution()],
			interactions: defaultInteractions({ mouseWheelZoom: false }).extend([
				new DblClickDragZoom(),
				new MouseWheelZoom({
					condition: (mapBrowserEvent) => {
						if (mapBrowserEvent.type === 'wheel' && isScrollZoomingRef.current === false) {
							isScrollZoomingRef.current = true;
						}

						return true;
					},
				}),
			]),
			view: mapView !== undefined ? new View(mapView) : undefined,
		});
		olMapRef.current = this.map;

		// If we don't have a view already cached in localStorage, fit to the election
		if (mapView === undefined) {
			this.fitMapViewToElection(election);
		}

		// Accommodate the window resizing
		window.addEventListener('resize', this.onMapContainerResize);

		// Account for the ElectionAppBar potentially being added/removed and changing the size of our map div
		this.onMapContainerResize();

		this.map.addLayer(this.getMapDataVectorLayer(this.map));

		this.eventsKeys.push(this.map.on('singleclick', this.onClickMap.bind(this)));

		this.eventsKeys.push(this.map.on('dblclick', this.onDoubleClick.bind(this)));

		this.eventsKeys.push(this.map.on('moveend', this.onMoveEnd.bind(this)));

		// The pointer down/up events on OL's PointerInteractions don't do what we expect, so we use the regular 'ol pointerdown/pointerup events
		this.onPointerDownBound = this.onPointerDown.bind(this);
		this.map.addEventListener('pointerdown', this.onPointerDownBound);

		this.onPointerUpBound = this.onPointerUp.bind(this);
		this.map.addEventListener('pointerup', this.onPointerUpBound);
	}

	componentDidUpdate(prevProps: IProps) {
		// console.log('componentDidUpdate', this.props.isDraggingRef.current, prevProps, this.props);

		// Object.keys(this.props).forEach((key) => {
		// 	if (prevProps[key] !== this.props[key]) {
		// 		console.log('mismatch on', key, JSON.stringify(prevProps[key]), JSON.stringify(this.props[key]));
		// 	}
		// });

		if (this.map !== null) {
			// Allow for elections changing
			if (prevProps.election !== this.props.election) {
				this.clearMapDataVectorLayer(this.map);
				this.map.addLayer(this.getMapDataVectorLayer(this.map));
				// console.log('fitMapViewToElection');
				this.fitMapViewToElection(this.props.election);
			} else {
				// Keeping this commented out for now. I thought we needed it when we were seeing the weird issue with 'moveend' firing when the map was still being dragged when using a trackpad. However, since moving onMoveEnd into this component (from map.tsx), and probably some other changes (there was a lot of hacking around), we're not seeing this issue.
				// if (this.props.isDraggingRef.current === false) {
				// If the Map's view doesn't match what's in the URL, use the URL.
				// This is primarily used when we want to navigate() to a view internallyand have it change the map e.g. the "View On Map" button
				// This is also needed when we're navigating via back/forward to make sure the view that's in the URL gets applied to the existing map object
				const matchy = doesTheMapViewMatchThisView(this.map.getView(), this.props.mapView);

				if (this.props.mapView !== undefined && matchy === false) {
					// console.log('cdu.Set map to this.props.mapView');
					this.map.setView(new View(this.props.mapView));
				} else {
					// }
					if (JSON.stringify(prevProps.mapFilterSettings) !== JSON.stringify(this.props.mapFilterSettings)) {
						// The user has changed the noms filter options
						const sausageLayer = this.getLayerByProperties(this.map, 'isSausageLayer', true);
						if (sausageLayer !== null) {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							sausageLayer.setStyle((feature: IMapPollingPlaceFeature, resolution: number) =>
								olStyleFunction(feature, resolution, this.props.mapFilterSettings),
							);
						}
					}
				}
			}
		}
	}

	componentWillUnmount() {
		// console.log('> componentWillUnmount');

		// 1. Remove the "on data loaded" change event
		// This doesn't work - presumably because of .bind(this)
		// l.getSource().un("changed", this.onVectorSourceChanged.bind(this))

		// ... So we use Observable.unByKey
		// https://gis.stackexchange.com/a/241531
		if (this.vectorSourceChangedEventKey !== undefined) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			Observable.unByKey(this.vectorSourceChangedEventKey);
			this.vectorSourceChangedEventKey = undefined;
		}

		// 1.1 And the other event listeners can go too
		if (this.eventsKeys !== undefined) {
			Observable.unByKey(this.eventsKeys);
		}

		// 2. Cancel any window.setTimeout() calls that may be running
		this.timeoutIds.forEach((timeoutId: number) => window.clearTimeout(timeoutId));

		// 3. Remove the window.onresize event that lets the map know to update its size when the viewport changes
		window.removeEventListener('resize', this.onMapContainerResize);

		// 3.1 Remove other map event listeners
		if (this.map !== null) {
			if (this.onPointerDownBound !== undefined) {
				this.map.removeEventListener('pointerdown', this.onPointerDownBound);
				this.onPointerDownBound = undefined;
			}
			if (this.onPointerUpBound !== undefined) {
				this.map.removeEventListener('pointerup', this.onPointerUpBound);
				this.onPointerUpBound = undefined;
			}
		}

		// 4. Remove all layers, controls, and interactions on the map
		if (this.map !== null) {
			const layers = [...this.map.getLayers().getArray()];
			layers.forEach((l: BaseLayer) => {
				if (this.map !== null) {
					this.map.removeLayer(l);
				}
			});

			const controls = [...this.map.getControls().getArray()];
			controls.forEach((c: Control) => {
				if (this.map !== null) {
					this.map.removeControl(c);
				}
			});

			const interactions = [...this.map.getInteractions().getArray()];
			interactions.forEach((i: Interaction) => {
				if (this.map !== null) {
					this.map.removeInteraction(i);
				}
			});
		}

		// 5. And finally clean up the map object itself
		// https://stackoverflow.com/a/25997026
		if (this.map !== null) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.map.setTarget(null);
			this.map = null;
		}
	}

	private onMapContainerResize() {
		// Potted history of responding to window/container resize events in OpenLayers
		// https://gis.stackexchange.com/questions/31409/openlayers-redrawing-map-after-container-resize

		const timeoutId = window.setTimeout(
			(map: Map | undefined | null) => {
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
			onMapDataLoaded(writer.writeFeaturesObject(vectorSource.getFeatures()));

			// OpenLayers can take some time to actually render larger vector sources (i.e. Federal elections).
			// Wait for a bit before doing map onLoad things like zooming to search results.
			// If we don't wait then OpenLayers seems to stop rendering when the zoom starts, so the user sees nothing.
			const timeoutId = window.setTimeout(
				// eslint-disable-next-line func-names
				function (this: OpenLayersMap) {
					onMapLoaded();
				}.bind(this),
				750,
			);

			this.timeoutIds.push(timeoutId);
		}
	}

	private onMoveEnd(event: MapBrowserEvent) {
		if (this.props.onMoveEnd !== undefined) {
			this.props.onMoveEnd(event);
		}
	}

	private onDoubleClick(event: MapBrowserEvent) {
		if (this.props.onDoubleClick !== undefined) {
			this.props.onDoubleClick(event);
		}
	}

	private onPointerDown(event: MapBrowserEvent) {
		if (this.props.onPointerDown !== undefined) {
			this.props.onPointerDown(event);
		}
	}

	private onPointerUp(event: MapBrowserEvent) {
		if (this.props.onPointerUp !== undefined) {
			this.props.onPointerUp(event);
		}
	}

	private onClickMap(event: MapBrowserEvent) {
		const { onQueryMap } = this.props;

		if (this.map !== null) {
			// gaTrack.event({
			//   category: 'OpenLayersMap',
			//   action: 'Query Features',
			// })

			const features: any[] = [];
			this.map.forEachFeatureAtPixel(
				event.pixel,
				(feature: any, _layer: any) => {
					features.push(feature);
				},
				{
					hitTolerance: 3,
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
				// SausageMap.queriedPollingPlaces displays a "Too many polling places - try to zoom/find" if we have more than 20
				onQueryMap(features.slice(0, 21));
			}
		}
	}

	private getMapDataVectorLayer(_map: Map) {
		const { election, /*geojson, */ mapFilterSettings, onMapBeginLoading } = this.props;
		const geojson = undefined;

		const vectorSource = new VectorSource({
			format: new GeoJSON(),
			async loader(this: VectorSource<Geometry> | VectorTile, extent: any, resolution: number, projection: any) {
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
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore-next-line
					this.addFeatures((this.getFormat() as GeoJSON).readFeatures(geojson));
				}
			},
		});

		this.vectorSourceChangedEventKey = vectorSource.once('change', this.onVectorSourceChanged.bind(this));

		const styleFunction = (feature: IMapPollingPlaceFeature, resolution: number) =>
			olStyleFunction(feature, resolution, mapFilterSettings);

		const vectorLayer = new VectorLayer({
			renderMode: 'image',
			source: vectorSource,
			style: styleFunction,
		} as any);

		vectorLayer.setProperties({ isSausageLayer: true });

		return vectorLayer;
	}

	private clearMapDataVectorLayer(map: Map) {
		const vectorLayer = this.getLayerByProperties(map, 'isSausageLayer', true);
		if (vectorLayer !== null) {
			map.removeLayer(vectorLayer);
		}
	}

	// eslint-disable-next-line class-methods-use-this
	private getLayerByProperties(map: Map, propName: string, propValue: any): VectorLayer<VectorSource<Geometry>> | null {
		let layer = null;
		map.getLayers().forEach((l: BaseLayer) => {
			const props = l.getProperties();
			if (propName in props && props[propName] === propValue) {
				layer = l;
			}
		});
		return layer;
	}

	// eslint-disable-next-line class-methods-use-this
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
					attributions: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors.`,
				}),
			}),
		];
	}

	render() {
		return <div id="openlayers-map" className="openlayers-map" />;
	}
}

export default OpenLayersMap;
