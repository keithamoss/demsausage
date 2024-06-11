import { Backdrop, Box, CircularProgress } from '@mui/material';
import { debounce } from 'lodash-es';
import { Feature, MapEvent, Map as olMap } from 'ol';
import 'ol/ol.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useCurrentPath } from '../../app/hooks/useCurrentPath';
import {
	addURLMapLatLonZoomToCurrentPathAndNavigateAndReplace,
	navigateToElectionAndReplace,
	navigateToMapWithoutUpdatingTheView,
	navigateToPollingPlaceFromFeature,
	navigateToSearchPollingPlacesByIds,
} from '../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import { getAPIBaseURL, getBaseURL } from '../../app/utils';
import { selectMapFilterSettings, setPollingPlaces } from '../app/appSlice';
import { getDefaultElection, getViewForElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { getPollingPlaceIdsFromFeatures } from '../pollingPlaces/pollingPlaceHelpers';
import SearchBarCosmeticNonFunctional from '../search/searchByAddressOrGPS/searchBar/searchBarCosmeticNonFunctional';
import AddStallButton from './addStallButton/addStallButton';
import LayersSelector from './layersSelector/layersSelector';
import {
	IMapPollingPlaceGeoJSONFeatureCollection,
	createMapViewFromURL,
	createMapViewURLPathComponent,
	isMapViewParamValid,
} from './mapHelpers';
import OpenLayersMap from './openLayersMap/OpenLayersMap';

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
		// Guard to prevent showing the NotFound element while we're still loading
		return elections.length > 0 ? <NotFound /> : null;
	}

	return <MapEntrypointLayer2 electionId={electionId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
}

function MapEntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId } = props;

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	const mapViewFromURL = getStringParamOrEmptyString(params, 'map_lat_lon_zoom');
	const lastMatchedRoutePath = useCurrentPath();

	// Force users coming into:
	// (a) the root of the domain (/) over to the unique URL (with its default extents) for the current default election
	// (b) the root of an election (/election_name/) over to the unique URL (with its default extents) for their chosen election
	// (c) a Polling Place Permalink over to the permalink + the default extents for their chose election
	useEffect(() => {
		if (election !== undefined) {
			if (mapViewFromURL === '') {
				// Case C
				if (location.pathname.includes('/polling_places/') === true) {
					addURLMapLatLonZoomToCurrentPathAndNavigateAndReplace(
						params,
						navigate,
						lastMatchedRoutePath,
						getViewForElection(election),
					);
				} else {
					// Cases A and B
					navigateToElectionAndReplace(navigate, election, getViewForElection(election));
				}
			} else {
				if (isMapViewParamValid(mapViewFromURL) === false) {
					// Let our overall ErrorElement handle this
					throw new Error(`MapView URL parameter of '${mapViewFromURL}' is invalid`);
				}
			}
		}
	}, [election, lastMatchedRoutePath, location.pathname, mapViewFromURL, navigate, params]);

	if (election === undefined) {
		return <NotFound />;
	}

	if (location.pathname.startsWith(`/${election.name_url_safe}`) === true) {
		return <Map election={election} />;
	}
}

interface LocationState {
	updateMapView?: boolean;
}

interface Props {
	election: Election;
}

function Map(props: Props) {
	const { election } = props;

	const dispatch = useAppDispatch();
	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const olMapRef = useRef<olMap | undefined>(undefined);

	// Tell OpenLayers to update the map's view if we've arrived
	// here via a NavigationType.Pop(the browser's back or
	// forward buttons) or if we've arrived here from a navigate()
	// call that asked us to update the map view.
	const navigationType = useNavigationType();
	const updateMapView =
		navigationType === NavigationType.Pop || (location.state as LocationState)?.updateMapView === true;

	const mapViewFromURL = createMapViewFromURL(params);
	const [initialMapView] = useState(mapViewFromURL);

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state));

	// ######################
	// Map Loading
	// ######################
	const [isMapDataLoading, setIsMapDataLoading] = useState(false);

	const onMapBeginLoading = useMemo(() => () => setIsMapDataLoading(true), []);

	const onMapDataLoaded = useMemo(
		() => (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) => {
			setIsMapDataLoading(false);
			dispatch(setPollingPlaces(pollingPlaces));
		},
		[dispatch],
	);

	const onMapLoaded = useMemo(() => () => {}, []);
	// ######################
	// Map Loading (End)
	// ######################

	// ######################
	// Feature Querying
	// ######################
	const onQueryMap = useMemo(
		() => (features: Feature[]) => {
			if (features.length === 1) {
				navigateToPollingPlaceFromFeature(params, navigate, features[0]);
			} else {
				const ids = getPollingPlaceIdsFromFeatures(features);
				if (ids.length >= 1) {
					navigateToSearchPollingPlacesByIds(params, navigate, ids);
				}
			}
		},
		[navigate, params],
	);
	// ######################
	// Feature Querying (End)
	// ######################

	// ######################
	// Drag Detection and Map View Updating
	// ######################
	// We use the 'pointerdown' / 'pointerup' combo here because our use case is different to Mapa. i.e. We want to update the URL every time the view changes, regardless of how the change happens. Hence, our guard for "Is the user still interacting with the map?" can be much more blunt and looking at if the user has their pointer activated.
	// Where as Mapa uses looking to see if 'pointerdrag' fires between 'movestart' and 'moveend' because it wants to turn off GPS tracking as soon as we know the user has taken an action to change the view.
	const isDraggingOrMouseWheelScrollingRef = useRef<boolean>(false);

	const onMoveEnd = useMemo(
		() =>
			debounce((evt: MapEvent) => {
				// Wait until the user has finished interacting with the map until we update the URL
				if (isDraggingOrMouseWheelScrollingRef.current === true) {
					return undefined;
				}

				const mapViewString = createMapViewURLPathComponent(evt.map.getView());
				if (mapViewString !== undefined && location.pathname.includes(mapViewString) === false) {
					navigateToMapWithoutUpdatingTheView(params, navigate, mapViewString);
				}
			}, 500),
		[location.pathname, navigate, params],
	);

	const onPointerDown = useCallback(() => {
		isDraggingOrMouseWheelScrollingRef.current = true;
	}, []);

	const onPointerUp = useCallback(() => {
		isDraggingOrMouseWheelScrollingRef.current = false;
	}, []);

	const onWheelStart = useCallback(() => {
		isDraggingOrMouseWheelScrollingRef.current = true;
	}, []);

	const onWheelEnd = useCallback(() => {
		isDraggingOrMouseWheelScrollingRef.current = false;
	}, []);
	// ######################
	// Drag Detection and Map View Updating (End)
	// ######################

	return (
		<React.Fragment>
			<Helmet>
				<title>{election.name} | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/${election.name_url_safe}/`} />
				<meta property="og:title" content={`${election.name} | Democracy Sausage`} />
				<meta property="og:image" content={`${getAPIBaseURL()}/0.1/map_image/${election.id}/`} />
			</Helmet>

			<OpenLayersMap
				election={election}
				olMapRef={olMapRef}
				initialMapView={initialMapView}
				mapView={updateMapView === true ? mapViewFromURL : undefined}
				mapFilterSettings={mapFilterSettings}
				onMapBeginLoading={onMapBeginLoading}
				onMapDataLoaded={onMapDataLoaded}
				onMapLoaded={onMapLoaded}
				onQueryMap={onQueryMap}
				onMoveEnd={onMoveEnd}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onWheelStart={onWheelStart}
				onWheelEnd={onWheelEnd}
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
				<SearchBarCosmeticNonFunctional />
			</Box>

			<Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isMapDataLoading}>
				<CircularProgress color="inherit" />
			</Backdrop>

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypointLayer1;
