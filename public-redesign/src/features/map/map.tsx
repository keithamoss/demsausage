import { Box } from '@mui/material';
import { debounce } from 'lodash-es';
import { Feature, MapEvent, Map as olMap } from 'ol';
import 'ol/ol.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useTitle } from '../../app/hooks/useTitle';
import {
	navigateToElection,
	navigateToMapWithoutUpdatingTheView,
	navigateToPollingPlaceFromFeature,
	navigateToSearchPollingPlacesByIds,
} from '../../app/routing/navigationHelpers';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import AddStallButton from '../app/addStallButton';
import { selectMapFilterSettings, setPollingPlaces } from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { getPollingPlaceIdsFromFeatures } from '../pollingPlaces/pollingPlaceHelpers';
import LayersSelector from './layers_selector';
import { createMapViewFromURL, createMapViewURLPathComponent } from './mapHelpers';
import { IMapPollingPlaceGeoJSONFeatureCollection } from './map_stuff';
import OpenLayersMap from './olMap/OpenLayersMap';
import SearchBarCosmeticNonFunctional from './searchBar/searchBarCosmeticNonFunctional';

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

	const navigate = useNavigate();

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	// Force users coming into the root of the domain over to the unique URL for the current default election
	useEffect(() => {
		if (election !== undefined && window.location.pathname.startsWith(`/${election.name_url_safe}`) === false) {
			navigateToElection(navigate, election);
		}
	}, [election, navigate]);

	if (election === undefined) {
		return null;
	}

	if (window.location.pathname.startsWith(`/${election.name_url_safe}`) === true) {
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

	useTitle(`Democracy Sausage - ${election.name}`);

	const dispatch = useAppDispatch();
	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const navigationType = useNavigationType();
	// Tell OpenLayers to update the map's view if we've arrived
	// here via a NavigationType.Pop(the browser's back or
	// forward buttons) or if we've arrived here from a navigate()
	// call that asked us to update the map view.
	const updateMapView =
		navigationType === NavigationType.Pop || (location.state as LocationState)?.updateMapView === true;

	const mapViewFromURL = createMapViewFromURL(params);
	const [initialMapView] = useState(mapViewFromURL);

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state));

	const onMapBeginLoading = useMemo(() => () => {}, []);

	const onMapDataLoaded = useMemo(
		() => (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) => dispatch(setPollingPlaces(pollingPlaces)),
		[dispatch],
	);

	const onMapLoaded = useMemo(() => () => {}, []);

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

	const olMapRef = useRef<olMap | undefined>(undefined);

	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking
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
	// Drag Detection, Map View Updating, and Feature Clicking (End)
	// ######################

	return (
		<React.Fragment>
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

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypointLayer1;
