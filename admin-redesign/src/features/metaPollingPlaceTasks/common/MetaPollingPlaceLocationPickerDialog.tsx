import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery, useTheme } from '@mui/material';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control/defaults';
import Point from 'ol/geom/Point';
import Translate from 'ol/interaction/Translate';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
	IGeoJSONPoint,
	IMetaPollingPlaceNearbyToTask,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlaceLocationLegend from './MetaPollingPlaceLocationLegend';

interface Props {
	open: boolean;
	initialLocation: IGeoJSONPoint;
	attachedPollingPlaces: IPollingPlaceAttachedToMetaPollingPlace[];
	nearbyMetaPollingPlaces: IMetaPollingPlaceNearbyToTask[];
	onClose: () => void;
	onConfirm: (geomLocation: IGeoJSONPoint) => void;
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

export default function MetaPollingPlaceLocationPickerDialog(props: Props) {
	const { open, initialLocation, attachedPollingPlaces, nearbyMetaPollingPlaces, onClose, onConfirm } = props;

	const theme = useTheme();
	const isSmallViewport = useMediaQuery(theme.breakpoints.down('sm'));
	const [mapTargetElement, setMapTargetElement] = useState<HTMLDivElement | null>(null);
	const [isDialogEntered, setIsDialogEntered] = useState(false);
	const mapRef = useRef<OlMap | null>(null);
	const taskMppFeatureRef = useRef<Feature<Point> | null>(null);

	const [pendingLonLat, setPendingLonLat] = useState<[number, number]>(initialLocation.coordinates);

	const canRenderOpenLayers = typeof window !== 'undefined' && typeof document !== 'undefined';

	useEffect(() => {
		if (open) {
			setPendingLonLat(initialLocation.coordinates);
		}
	}, [open, initialLocation.coordinates]);

	useEffect(() => {
		if (open === false) {
			setIsDialogEntered(false);
		}
	}, [open]);

	useEffect(() => {
		if (open === false || isDialogEntered === false || canRenderOpenLayers === false || mapTargetElement === null) {
			return;
		}

		if (ensureResizeObserverSupport() === false) {
			return;
		}

		const taskMppFeature = createPointFeature(initialLocation.coordinates, 'task-mpp') as Feature<Point>;
		taskMppFeatureRef.current = taskMppFeature;

		const nextFeatures: Feature[] = [taskMppFeature];

		for (const pollingPlace of attachedPollingPlaces) {
			nextFeatures.push(createPointFeature(pollingPlace.geom.coordinates, 'attached-pp'));
		}

		for (const nearbyMetaPollingPlace of nearbyMetaPollingPlaces) {
			nextFeatures.push(createPointFeature(nearbyMetaPollingPlace.geom_location.coordinates, 'nearby-mpp'));
		}

		const vectorSource = new VectorSource({ features: nextFeatures });

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
			target: mapTargetElement,
			layers: [new TileLayer({ source: new OSM() }), vectorLayer],
			controls: defaultControls({
				zoom: true,
				rotate: false,
			}),
			view: new View({ center: fromLonLat(initialLocation.coordinates), zoom: 16 }),
		});
		mapRef.current = map;

		const resizeViaAnimationFrame =
			typeof window.requestAnimationFrame === 'function'
				? window.requestAnimationFrame(() => {
						map.updateSize();
						map.renderSync();
					})
				: null;

		const resizeViaTimeout = window.setTimeout(() => {
			map.updateSize();
			map.renderSync();
		}, 220);

		const translate = new Translate({ features: new Collection([taskMppFeature]) });
		translate.on('translateend', () => {
			const geometry = taskMppFeature.getGeometry();
			if (geometry instanceof Point) {
				const [lon, lat] = toLonLat(geometry.getCoordinates());
				setPendingLonLat([lon, lat]);
			}
		});
		map.addInteraction(translate);

		const extent = vectorSource.getExtent();
		if (extent[0] !== Number.POSITIVE_INFINITY) {
			map.getView().fit(extent, {
				padding: [32, 32, 32, 32],
				maxZoom: 17,
				duration: 0,
			});
		}

		return () => {
			if (resizeViaAnimationFrame !== null) {
				window.cancelAnimationFrame(resizeViaAnimationFrame);
			}
			window.clearTimeout(resizeViaTimeout);
			map.setTarget(undefined);
			mapRef.current = null;
			taskMppFeatureRef.current = null;
		};
	}, [
		attachedPollingPlaces,
		canRenderOpenLayers,
		initialLocation.coordinates,
		isDialogEntered,
		mapTargetElement,
		nearbyMetaPollingPlaces,
		open,
		theme.palette,
	]);

	useEffect(() => {
		const taskMppFeature = taskMppFeatureRef.current;
		if (taskMppFeature === null) {
			return;
		}

		const geometry = taskMppFeature.getGeometry();
		if (geometry instanceof Point) {
			geometry.setCoordinates(fromLonLat(pendingLonLat));
		}
	}, [pendingLonLat]);

	const onClickConfirm = useCallback(() => {
		onConfirm({
			type: 'Point',
			coordinates: pendingLonLat,
		});
	}, [onConfirm, pendingLonLat]);

	const onDialogEntered = useCallback(() => {
		setIsDialogEntered(true);
	}, []);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="lg"
			fullScreen={isSmallViewport}
			TransitionProps={{ onEntered: onDialogEntered }}
		>
			<DialogTitle>Edit location</DialogTitle>
			<DialogContent>
				<Box
					ref={setMapTargetElement}
					sx={{
						height: 420,
						mt: 0.5,
						borderRadius: 1,
						border: 1,
						borderColor: 'divider',
					}}
				/>
				{canRenderOpenLayers === false && (
					<Box sx={{ mt: 0.5, typography: 'caption', color: 'text.secondary' }}>
						Map preview is unavailable in this browser.
					</Box>
				)}
				<MetaPollingPlaceLocationLegend
					taskMppColor={theme.palette.primary.main}
					attachedPpColor={theme.palette.primary.light}
					nearbyMppColor={theme.palette.warning.main}
				/>
			</DialogContent>
			<DialogActions>
				<Button size="small" onClick={onClose}>
					Cancel
				</Button>
				<Button size="small" variant="contained" onClick={onClickConfirm}>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
	);
}
