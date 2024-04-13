import { Box } from '@mui/material';
import 'ol/ol.css';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import AddStallButton from '../app/addStallButton';
import {
	ESearchDrawerSubComponent,
	selectMapFilterOptions,
	setPollingPlaces,
	setSearchDrawerInitialMode,
} from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import LayersSelector from './layers_selector';
import { IMapPollingPlaceGeoJSONFeatureCollection, IMapSearchResults } from './map_stuff';
import OpenLayersMap from './olMap/OpenLayersMap';
import SearchBar from './searchBar/searchBar';

export const isSearchRoute = (pathname: string) => pathname.startsWith('/search/') === true;

// The entrypoint handles determining the election that should be displayed based on route changes.
function MapEntrypoint() {
	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	const { pathname } = useLocation();
	const isSearchRouteShown = isSearchRoute(pathname);

	if (electionId === undefined) {
		return null;
	}

	return <Map electionId={electionId} isSearchRouteShown={isSearchRouteShown} />;
}

interface Props {
	electionId: number;
	isSearchRouteShown: boolean;
}

function Map(props: Props) {
	const { electionId, isSearchRouteShown } = props;

	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	// ######################
	// Geolocation
	// ######################

	// ######################
	// Geolocation (End)
	// ######################

	const mapSearchResultsArray = [
		{
			lon: 144.92225294477464,
			lat: -37.77228703019065,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			extent: [144.90931227679806, -37.79525859266615, 144.9531919227886, -37.75317190681365] as any,
			formattedAddress: 'Foobar foobar',
		},
		{
			lon: 145.4739089,
			lat: -37.9169381,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			extent: [145.3531296040862, -38.010189690473965, 145.54602434367877, -37.81607099611173] as any,
			formattedAddress: 'Foobar foobar',
		},
	];

	const onMapBeginLoading = () => {};
	const stashMapData = (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) =>
		dispatch(setPollingPlaces(pollingPlaces));
	const onMapLoaded = () => {};
	const onQueryMap = () => {};

	const [mapSearchResults, setMapSearchResults] = useState<number | null>(null);
	const toggleMapSearchResults = (resultSet: number) => {
		setMapSearchResults(resultSet);
	};

	const [bottomDrawerOpen, setBottomDrawerOpen] = useState(isSearchRouteShown);
	const onToggleBottomDrawerOpen = () => {
		setBottomDrawerOpen(!bottomDrawerOpen);
	};

	const onClickMapFilterButton = () => {
		setFilterOpen(true);
		// toggleFilter();
		setBottomDrawerOpen(true);
	};

	const [filterOpen, setFilterOpen] = useState(false);
	const toggleFilter = () => {
		setFilterOpen(!filterOpen);
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [userHasSearched, setUserHasSearched] = useState(false);
	const toggleUserHasSearched = (state: boolean) => {
		setUserHasSearched(state);
	};

	// const [mapFilterOptions, setMapFilterOptions] = useState<IMapFilterOptions>({});
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	// const isMapFiltered = Object.values(mapFilterOptions).find((option) => option === true) || false;

	// const reduxSearchText = useAppSelector(select)

	const [userSearchText, setUserSearchText] = useState('');
	const onSearchTextChange = (value: string) => {
		setUserSearchText(value);
	};

	const [interactionMode, setInteractionMode] = useState<ESearchDrawerSubComponent | undefined>(undefined);

	if (election === undefined) {
		return null;
	}

	const onClickSearchBar = (subcomponentClicked: ESearchDrawerSubComponent) => {
		// navigate(`/search/${election.name_url_safe}`);
		navigate(`/${election.name_url_safe}/search/`);
		// setInteractionMode(mode);
		dispatch(setSearchDrawerInitialMode(subcomponentClicked));
	};

	if (isSearchRouteShown === true && bottomDrawerOpen === false) {
		setBottomDrawerOpen(true);
	}
	return (
		<React.Fragment>
			<OpenLayersMap
				election={election}
				mapSearchResults={
					mapSearchResults != null ? (mapSearchResultsArray[mapSearchResults] as IMapSearchResults) : null
				}
				mapFilterOptions={mapFilterOptions}
				onMapBeginLoading={onMapBeginLoading}
				onMapDataLoaded={stashMapData}
				onMapLoaded={onMapLoaded}
				onQueryMap={onQueryMap}
			/>

			<LayersSelector electionId={electionId} />

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
				<SearchBar
					election={election}
					enableSearchField={false}
					onClick={onClickSearchBar}
					onToggleFilter={onClickMapFilterButton}
				/>
			</Box>

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypoint;
