import { Box } from '@mui/material';
import { debounce } from 'lodash-es';
import { Feature, MapEvent, Map as olMap } from 'ol';
import 'ol/ol.css';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	navigateToElection,
	navigateToMap,
	navigateToPollingPlaceFromFeature,
	navigateToPollingPlacesByIds,
} from '../../app/routing/navigationHelpers';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import AddStallButton from '../app/addStallButton';
import { selectMapFilterOptions, setPollingPlaces } from '../app/appSlice';
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

interface Props {
	election: Election;
}

function Map(props: Props) {
	const { election } = props;

	const dispatch = useAppDispatch();
	const params = useParams();
	const navigate = useNavigate();

	const mapViewFromURL = createMapViewFromURL(useParams());

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

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
					navigateToPollingPlacesByIds(params, navigate, ids);
				}
			}
		},
		[navigate, params],
	);

	const olMapRef = useRef<olMap | undefined>(undefined);

	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking
	// ######################
	const isScrollZoomingRef = useRef<boolean>(false);
	const isDraggingRef = useRef<boolean>(false);

	// If a 'pointerdrag' fires between 'movestart' and 'moveend' the move has been the result of a drag
	// Ref: https://gis.stackexchange.com/a/378877
	// Note: We're using this in Mapa, but we hit issues in this legacy code where using a trackpad was seeing moveend fire during a drag event. We've since moved to using pointerup/down on the map itself, rather than the movestart/pointerdrag/moveend events as we are in Mapa.
	// It may not actually be a thing and could've been caused by OL bugs (we're using an older version here) or just representative of the hacked together mass of code that makes the map work here - a combo of the legacy DemSausage map code with parts of Mapa's map code.
	// Except, it still sort of happens. Mostly just when we're doing a specific combo of a two fingered click and drag to move the map.
	// The (isDraggingRef.current === true) guard in moveend serves to deal with it.
	const isDoubleClickingRef = useRef<boolean>(false);

	const navigateDebounced = useMemo(
		() =>
			debounce((mapViewString: string) => {
				navigateToMap(params, navigate, mapViewString);
			}, 500),
		[navigate, params],
	);

	const onMoveEnd = useCallback(
		(evt: MapEvent) => {
			// This doesn't seem to happen much any more, mostly just when we're doing a specific combo of a two fingered click and drag to move the map.
			if (isDraggingRef.current === true) {
				return undefined;
			}

			isDoubleClickingRef.current = false;
			isScrollZoomingRef.current = false;

			const mapViewString = createMapViewURLPathComponent(evt.map.getView());
			if (mapViewString !== undefined && location.pathname.includes(mapViewString) === false) {
				navigateDebounced(mapViewString);
			}
		},
		[navigateDebounced],
	);

	const onPointerDown = useCallback(() => {
		isDraggingRef.current = true;
	}, []);

	const onPointerUp = useCallback(() => {
		isDraggingRef.current = false;
	}, []);
	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking (End)
	// ######################

	return (
		<React.Fragment>
			<OpenLayersMap
				election={election}
				olMapRef={olMapRef}
				mapView={mapViewFromURL}
				isDraggingRef={isDraggingRef}
				isScrollZoomingRef={isScrollZoomingRef}
				mapSearchResults={null}
				mapFilterOptions={mapFilterOptions}
				onMapBeginLoading={onMapBeginLoading}
				onMapDataLoaded={onMapDataLoaded}
				onMapLoaded={onMapLoaded}
				onQueryMap={onQueryMap}
				onMoveEnd={onMoveEnd}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
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
