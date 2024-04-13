import 'ol/ol.css';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import AddStallButton from '../app/addStallButton';
import BottomDrawerTemporary from '../app/bottom_drawer_temporary';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { IMapFilterOptions } from '../icons/noms';
import LayersSelector from './layers_selector';
import { IMapSearchResults } from './map_stuff';
import OpenLayersMap from './olMap/OpenLayersMap';
import SearchBar from './searchBar/searchBar';

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

	if (electionId === undefined) {
		return null;
	}

	return <Map electionId={electionId} />;
}

interface Props {
	electionId: number;
}

function Map(props: Props) {
	const { electionId } = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));

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
	const stashMapData = () => {};
	const onMapLoaded = () => {};
	const onQueryMap = () => {};

	const [mapSearchResults, setMapSearchResults] = useState<number | null>(null);
	const toggleMapSearchResults = (resultSet: number) => {
		setMapSearchResults(resultSet);
	};

	const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
	const onToggleBottomDrawerOpen = () => {
		setBottomDrawerOpen(!bottomDrawerOpen);
	};
	const onClickMapFilterButton = () => {
		setFilterOpen(true);
		setBottomDrawerOpen(true);
		toggleFilter();
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

	const [mapFilterOptions, setMapFilterOptions] = useState<IMapFilterOptions>({});
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const isMapFiltered = Object.values(mapFilterOptions).find((option) => option === true) || false;

	const [userSearchText, setUserSearchText] = useState('');
	const onSearchTextChange = (value: string) => setUserSearchText(value);

	if (election === undefined) {
		return null;
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

			<SearchBar
				onSearch={toggleUserHasSearched}
				filterOpen={filterOpen}
				onToggleFilter={onClickMapFilterButton}
				onClick={onToggleBottomDrawerOpen}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				isMapFiltered={isMapFiltered}
				showFilter={true}
				styleProps={{
					position: 'absolute',
					bottom: '24px',
					width: '96%',
					zIndex: 1050,
					margin: '8px',
				}}
				id="search-bar"
				valueToShow={userSearchText}
			/>

			<BottomDrawerTemporary
				toggleMapSearchResults={toggleMapSearchResults}
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				isMapFiltered={isMapFiltered}
				onChangeFilter={setMapFilterOptions}
				open={bottomDrawerOpen}
				onSetOpen={setBottomDrawerOpen}
				onSearchTextChange={onSearchTextChange}
			/>
		</React.Fragment>
	);
}

export default MapEntrypoint;
