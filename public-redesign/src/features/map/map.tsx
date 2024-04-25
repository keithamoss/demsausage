import { Box } from '@mui/material';
import { Feature, MapBrowserEvent, MapEvent, Map as olMap } from 'ol';
import 'ol/ol.css';
import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import AddStallButton from '../app/addStallButton';
import {
	ESearchDrawerSubComponent,
	selectMapFilterOptions,
	selectMapView,
	setMapView,
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

	const urlBBox = getBBoxExtentFromString(getStringParamOrUndefined(useParams(), 'bbox'));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	const onMapBeginLoading = () => {};

	const onMapDataLoaded = (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) =>
		dispatch(setPollingPlaces(pollingPlaces));

	const onMapLoaded = () => {};

	const onQueryMap = (features: Feature[]) => {
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
	};

	const olMapRef = useRef<olMap | undefined>(undefined);

	const [isUserMovingTheMap, setIsUserMovingTheMap] = useState(false);
	const isUserMovingTheMapRef = useRef<boolean>(isUserMovingTheMap);
	isUserMovingTheMapRef.current = isUserMovingTheMap;

	const mapView = useAppSelector((state) => selectMapView(state));

	// ######################
	// Drag Detection, Map View Updating, and Feature Clicking
	// ######################
	const isScrollZooming = false;
	const isScrollZoomingRef = useRef<boolean>(isScrollZooming);
	isScrollZoomingRef.current = isScrollZooming;

	useEffect(() => {
		if (olMapRef.current !== undefined) {
			// If a 'pointerdrag' fires between 'movestart' and 'moveend' the move has been the result of a drag
			// Ref: https://gis.stackexchange.com/a/378877
			let isDragging = false;
			let isDoubleClicking = false;

			olMapRef.current.on('movestart', () => {
				isDragging = false;
				setIsUserMovingTheMap(true);
			});

			olMapRef.current.on('pointerdrag', () => {
				isDragging = true;
			});

			olMapRef.current.on('moveend', (evt: MapEvent) => {
				setIsUserMovingTheMap(false);

				isDragging = false;
				isDoubleClicking = false;
				isScrollZoomingRef.current = false;

				// Update the Redux store version of the view for when
				// we add new features.
				const view = evt.map.getView();

				dispatch(
					setMapView({
						center: view.getCenter(),
						zoom: view.getZoom(),
						resolution: view.getResolution(),
					}),
				);
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

			olMapRef.current.on('dblclick', (evt: MapBrowserEvent<UIEvent>) => {
				evt.preventDefault();

				isDoubleClicking = true;

				if (olMapRef.current !== undefined) {
					const view = olMapRef.current.getView();
					view.setCenter(evt.coordinate);
					olMapRef.current.setView(view);
				}

				return false;
			});
		}
	}, []);
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
