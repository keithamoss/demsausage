import { Box } from '@mui/material';
import { debounce } from 'lodash-es';
import { Feature, MapEvent, Map as olMap } from 'ol';
import 'ol/ol.css';
import React, { useCallback, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import AddStallButton from '../app/addStallButton';
import {
	ESearchDrawerSubComponent,
	selectMapFilterOptions,
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

	const mapViewFromURLHash = getViewFromURLHash(location.hash);

	const bboxFromURLPath = getBBoxExtentFromString(getStringParamOrUndefined(useParams(), 'bbox'));

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
			debounce((url: string) => {
				navigate(url);
			}, 500),
		[navigate],
	);

	const onMoveEnd = useCallback(
		(evt: MapEvent) => {
			// console.log('moveend', isDraggingRef.current);

			// This doesn't seem to happen much any more, mostly just when we're doing a specific combo of a two fingered click and drag to move the map.
			if (isDraggingRef.current === true) {
				return undefined;
			}

			isDoubleClickingRef.current = false;
			isScrollZoomingRef.current = false;

			const url = createURLHashFromView(evt.map.getView());
			if (url !== undefined && url !== location.hash.substring(1)) {
				navigateDebounced(`#${url}`);
			}
		},
		[location.hash, navigateDebounced],
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
				mapView={mapViewFromURLHash}
				isDraggingRef={isDraggingRef}
				isScrollZoomingRef={isScrollZoomingRef}
				mapSearchResults={null}
				bbox={bboxFromURLPath}
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
				<SearchBarCosmeticNonFunctional election={election} />
			</Box>

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypointLayer1;
