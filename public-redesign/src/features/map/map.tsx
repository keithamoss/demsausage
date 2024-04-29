import { Box } from '@mui/material';
import { debounce } from 'lodash-es';
import { Feature, MapBrowserEvent, MapEvent, Map as olMap } from 'ol';
import { unByKey } from 'ol/Observable';
import 'ol/ol.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import AddStallButton from '../app/addStallButton';
import {
	ESearchDrawerSubComponent,
	selectMapFilterOptions,
	selectMapView,
	setPollingPlaces,
	setSearchBarInitialMode,
} from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import {
	getPollingPlaceIdsFromFeatures,
	getPollingPlacePermalinkFromFeature,
} from '../pollingPlaces/pollingPlaceHelpers';
import LayersSelector from './layers_selector';
import { createURLHashFromView, getViewFromURLHash } from './mapHelpers';
import { IMapPollingPlaceGeoJSONFeatureCollection } from './map_stuff';
import OpenLayersMap from './olMap/OpenLayersMap';
import SearchBarCosmeticNonFunctional from './searchBar/searchBarCosmeticNonFunctional';
import { getBBoxExtentFromString } from './searchBar/searchBarHelpers';

// The entrypoint handles determining the election that should be displayed based on route changes.
function MapEntrypointLayer1() {
	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	if (electionId === undefined) {
		return null;
	}

	return <MapEntrypointLayer2 electionId={electionId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
}

function MapEntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId } = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	if (election === undefined) {
		return null;
	}

	return <Map election={election} />;
}

interface Props {
	election: Election;
}

function Map(props: Props) {
	const { election } = props;

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();

	const urlViewFromHash = getViewFromURLHash(location.hash);
	const mapViewFromRedux = useAppSelector((state) => selectMapView(state));
	// const mapView = urlViewFromHash !== undefined ? urlViewFromHash : mapViewFromRedux;

	const [mapView] = useState(urlViewFromHash !== undefined ? urlViewFromHash : mapViewFromRedux);

	// useEffect(() => {
	// 	if (
	// 		mapViewFromRedux !== undefined &&
	// 		urlViewFromHash !== undefined &&
	// 		doTwoViewsMatch(mapViewFromRedux, urlViewFromHash) === true
	// 	) {
	// 		console.log('Set Redux mapView from URL', urlViewFromHash);
	// 		dispatch(setMapView(urlViewFromHash));
	// 	}
	// }, [dispatch, mapViewFromRedux, urlViewFromHash]);

	const urlBBox = getBBoxExtentFromString(getStringParamOrUndefined(useParams(), 'bbox'));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	const onMapBeginLoading = useMemo(() => () => {}, []);

	const onMapDataLoaded = useMemo(
		() => (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) => dispatch(setPollingPlaces(pollingPlaces)),
		[dispatch],
	);

	const onMapLoaded = useMemo(() => () => {}, []);

	const onQueryMap = useMemo(
		() => (features: Feature[]) => {
			dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.SEARCH_FIELD));

			if (features.length === 1) {
				const url = getPollingPlacePermalinkFromFeature(features[0], election);
				if (url !== undefined) {
					navigate(url, {
						state: { cameFromSearchDrawerOrMapOrMap: true },
					});
				}
			} else {
				const ids = getPollingPlaceIdsFromFeatures(features);
				if (ids.length >= 1) {
					navigate(`/${election.name_url_safe}/search/by_ids/${ids.join(',')}/`);
				}
			}
		},
		[dispatch, election, navigate],
	);

	const olMapRef = useRef<olMap | undefined>(undefined);

	const [isUserMovingTheMap, setIsUserMovingTheMap] = useState(false);
	const isUserMovingTheMapRef = useRef<boolean>(isUserMovingTheMap);
	isUserMovingTheMapRef.current = isUserMovingTheMap;

	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking
	// ######################
	const isScrollZooming = false;
	const isScrollZoomingRef = useRef<boolean>(isScrollZooming);
	isScrollZoomingRef.current = isScrollZooming;

	const isDraggingRef = useRef<boolean>(false);

	const isMapEventsSetup = useRef<boolean>(false);

	const olEventKeys = [];
	const windowEventKeys = [];

	useEffect(() => {
		console.log('Init evt handlers?', olMapRef.current !== undefined, isMapEventsSetup.current);

		if (olMapRef.current !== undefined && isMapEventsSetup.current === true) {
			// windowEventKeys.forEach((v) => window.removeEventListener(v));
			unByKey(olEventKeys);
		}

		if (olMapRef.current !== undefined && isMapEventsSetup.current === false) {
			isMapEventsSetup.current = true;

			// If a 'pointerdrag' fires between 'movestart' and 'moveend' the move has been the result of a drag
			// Ref: https://gis.stackexchange.com/a/378877
			// let isDragging = false;
			let isDoubleClicking = false;

			// olMapRef.current.on('movestart', () => {
			// 	isDraggingRef.current = false;
			// 	setIsUserMovingTheMap(true);
			// });

			// olMapRef.current.on('pointerdrag', () => {
			// 	isDraggingRef.current = true;
			// });

			console.log('Attach event handleres');
			const pointerDownKey = window.addEventListener('pointerdown', (e) => {
				console.log('pointerdown', e);
				isDraggingRef.current = true;
				setIsUserMovingTheMap(true);
			});

			const pointerUpKey = window.addEventListener('pointerup', () => {
				console.log('pointerup');
				isDraggingRef.current = false;
			});

			windowEventKeys.push(pointerDownKey, pointerUpKey);

			// olMapRef.current.on(
			// 	'change:view',
			// 	debounce(() => {
			// 		console.log('change:view');
			// 	}, 1000),
			// );

			const navigateDebounced = debounce((url: string) => {
				console.log('navigate');
				navigate(`#${url}`);
			}, 500);

			const moveEndKey = olMapRef.current.on('moveend', (evt: MapEvent) => {
				// setIsUserMovingTheMap(false);

				console.log('moveend', isDraggingRef.current);

				if (isDraggingRef.current === true) {
					return undefined;
				}

				// isDraggingRef.current = false;
				isDoubleClicking = false;
				isScrollZoomingRef.current = false;

				// Update the Redux store version of the view for when
				// we add new features.
				const view = evt.map.getView();

				// const reduxView = {
				// 	center: view.getCenter(),
				// 	zoom: view.getZoom(),
				// 	resolution: view.getResolution(),
				// };

				// dispatch(setMapView(reduxView));

				// @TOOD Remove /bounds
				// https://public-redesign.test.democracysausage.org/referendum_2023/bounds/-20.7084446260404,-20.7456961356561,139.489826649035,139.511991886502/

				const url = createURLHashFromView(view);

				// if (reduxView.center !== undefined) {
				// 	console.log(
				// 		'reduxView vs urlHashView',
				// 		reduxView.center,
				// 		transform(reduxView.center, 'EPSG:3857', 'EPSG:4326'),
				// 		reduxView.zoom,
				// 		url,
				// 	);
				// }

				// console.log('vs', url, location.hash);

				if (url !== undefined && url !== location.hash.substring(1)) {
					// console.log('navigate?');
					navigate(`#${url}`);
					// navigateDebounced(url);
				}
			});

			// olMapRef.current.on(
			// 	'click',
			// 	onMapClick((features: Feature[]) => {
			// 		dispatch(setFeaturesAvailableForEditing(features.map((f) => f.id)));

			// 		if (features.length === 1) {
			// 			navigate(`/FeatureManager/Edit/${features[0].id}`);
			// 		} else if (features.length > 1) {
			// 			navigate('/FeatureManager');
			// 		}
			// 	}),
			// );

			const dblClickKey = olMapRef.current.on('dblclick', (evt: MapBrowserEvent<UIEvent>) => {
				evt.preventDefault();

				isDoubleClicking = true;

				if (olMapRef.current !== undefined) {
					const view = olMapRef.current.getView();
					view.setCenter(evt.coordinate);
					olMapRef.current.setView(view);
				}

				return false;
			});

			olEventKeys.push(moveEndKey, dblClickKey);
		}
	}, [location.hash, navigate]);
	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking (End)
	// ######################

	// @TODO Move this up into an Entrypoint layer
	if (election === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<OpenLayersMap
				election={election}
				olMapRef={olMapRef}
				mapView={mapView}
				isDraggingRef={isDraggingRef}
				isScrollZoomingRef={isScrollZoomingRef}
				mapSearchResults={null}
				bbox={urlBBox}
				mapFilterOptions={mapFilterOptions}
				onMapBeginLoading={onMapBeginLoading}
				onMapDataLoaded={onMapDataLoaded}
				onMapLoaded={onMapLoaded}
				onQueryMap={onQueryMap}
			/>

			<LayersSelector electionId={election.id} />

			<AddStallButton />

			<Box
				sx={{
					position: 'absolute',
					bottom: '24px',
					width: '96%',
					zIndex: 1050,
					margin: '8px',
				}}
			>
				<SearchBarCosmeticNonFunctional election={election} />
			</Box>

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypointLayer1;
