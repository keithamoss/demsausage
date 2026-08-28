import { Box, useTheme } from '@mui/material';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control/defaults';
import Point from 'ol/geom/Point';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import 'ol/ol.css';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { useEffect, useMemo, useRef } from 'react';
import type {
	IGeoJSONPoint,
	IMetaPollingPlaceNearbyToTask,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlaceLocationLegend from './MetaPollingPlaceLocationLegend';

interface Props {
	mppLocation: IGeoJSONPoint;
	attachedPollingPlaces: IPollingPlaceAttachedToMetaPollingPlace[];
	nearbyMetaPollingPlaces: IMetaPollingPlaceNearbyToTask[];
	height?: number;
}

const createPointFeature = (coordinates: [number, number], kind: 'task-mpp' | 'attached-pp' | 'nearby-mpp') => {
	const feature = new Feature({ geometry: new Point(fromLonLat(coordinates)) });
	feature.set('kind', kind);
	return feature;
};

const ensureResizeObserverSupport = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	if (typeof window.ResizeObserver === 'function') {
		return true;
	}

	class ResizeObserverFallback {
		observe() {}
		unobserve() {}
		disconnect() {}
	}

	(window as unknown as { ResizeObserver: typeof ResizeObserverFallback }).ResizeObserver = ResizeObserverFallback;
	return true;
};

export default function MetaPollingPlaceLocationStaticMap(props: Props) {
	const { mppLocation, attachedPollingPlaces, nearbyMetaPollingPlaces, height = 260 } = props;

	const theme = useTheme();
	const mapTargetRef = useRef<HTMLDivElement | null>(null);

	const canRenderOpenLayers = typeof window !== 'undefined' && typeof document !== 'undefined';

	const features = useMemo(() => {
		const nextFeatures: Feature[] = [];

		nextFeatures.push(createPointFeature(mppLocation.coordinates, 'task-mpp'));

		for (const pollingPlace of attachedPollingPlaces) {
			nextFeatures.push(createPointFeature(pollingPlace.geom.coordinates, 'attached-pp'));
		}

		for (const nearbyMetaPollingPlace of nearbyMetaPollingPlaces) {
			nextFeatures.push(createPointFeature(nearbyMetaPollingPlace.geom_location.coordinates, 'nearby-mpp'));
		}

		return nextFeatures;
	}, [mppLocation.coordinates, attachedPollingPlaces, nearbyMetaPollingPlaces]);

	useEffect(() => {
		if (canRenderOpenLayers === false || mapTargetRef.current === null) {
			return;
		}

		if (ensureResizeObserverSupport() === false) {
			return;
		}

		const vectorSource = new VectorSource({ features });

		const styleByKind = {
			taskMpp: new Style({
				image: new CircleStyle({
					radius: 9,
					fill: new Fill({ color: theme.palette.primary.main }),
					stroke: new Stroke({ color: theme.palette.primary.dark, width: 2 }),
				}),
			}),
			attachedPp: new Style({
				image: new CircleStyle({
					radius: 5,
					fill: new Fill({ color: theme.palette.primary.light }),
					stroke: new Stroke({ color: theme.palette.primary.main, width: 1.5 }),
				}),
			}),
			nearbyMpp: new Style({
				image: new CircleStyle({
					radius: 6,
					fill: new Fill({ color: theme.palette.warning.main }),
					stroke: new Stroke({ color: theme.palette.warning.dark, width: 1.5 }),
				}),
			}),
		};

		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: (feature) => {
				const kind = feature.get('kind');
				if (kind === 'task-mpp') {
					return styleByKind.taskMpp;
				}
				if (kind === 'attached-pp') {
					return styleByKind.attachedPp;
				}
				return styleByKind.nearbyMpp;
			},
		});

		const map = new OlMap({
			target: mapTargetRef.current,
			layers: [new TileLayer({ source: new OSM() }), vectorLayer],
			controls: defaultControls({
				zoom: false,
				rotate: false,
				attribution: false,
			}),
			interactions: defaultInteractions({
				altShiftDragRotate: false,
				doubleClickZoom: false,
				dragPan: false,
				keyboard: false,
				mouseWheelZoom: false,
				pinchRotate: false,
				pinchZoom: false,
				shiftDragZoom: false,
			}),
			view: new View({
				center: fromLonLat(mppLocation.coordinates),
				zoom: 16,
			}),
		});

		const extent = vectorSource.getExtent();
		if (extent[0] !== Number.POSITIVE_INFINITY) {
			map.getView().fit(extent, {
				padding: [24, 24, 24, 24],
				maxZoom: 17,
				duration: 0,
			});
		}

		return () => {
			map.setTarget(undefined);
		};
	}, [canRenderOpenLayers, features, mppLocation.coordinates, theme.palette]);

	if (canRenderOpenLayers === false) {
		return (
			<Box>
				<Box sx={{ height, borderRadius: 1, border: 1, borderColor: 'divider' }} />
				<MetaPollingPlaceLocationLegend
					taskMppColor={theme.palette.primary.main}
					attachedPpColor={theme.palette.primary.light}
					nearbyMppColor={theme.palette.warning.main}
				/>
			</Box>
		);
	}

	return (
		<Box>
			<Box ref={mapTargetRef} sx={{ height, borderRadius: 1, border: 1, borderColor: 'divider' }} />
			<MetaPollingPlaceLocationLegend
				taskMppColor={theme.palette.primary.main}
				attachedPpColor={theme.palette.primary.light}
				nearbyMppColor={theme.palette.warning.main}
			/>
		</Box>
	);
}
