import { Box } from '@mui/material';
import 'ol/ol.css';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import AddStallButton from '../app/addStallButton';
import { selectMapFilterOptions, setPollingPlaces } from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import LayersSelector from './layers_selector';
import { IMapPollingPlaceGeoJSONFeatureCollection } from './map_stuff';
import OpenLayersMap from './olMap/OpenLayersMap';
import SearchBarCosmeticNonFunctional from './searchBar/searchBarCosmeticNonFunctional';
import { getBBoxExtentFromString } from './searchBar/searchBarHelpers';

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

	const dispatch = useAppDispatch();

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	const urlBBox = getBBoxExtentFromString(getStringParamOrUndefined(useParams(), 'bbox'));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	const onMapBeginLoading = () => {};
	const stashMapData = (pollingPlaces: IMapPollingPlaceGeoJSONFeatureCollection) =>
		dispatch(setPollingPlaces(pollingPlaces));
	const onMapLoaded = () => {};
	const onQueryMap = () => {};

	// const [mapSearchResults, setMapSearchResults] = useState<number | null>(null);
	// const toggleMapSearchResults = (resultSet: number) => {
	// 	setMapSearchResults(resultSet);
	// };

	if (election === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<OpenLayersMap
				election={election}
				// mapSearchResults={
				// 	mapSearchResults != null ? (mapSearchResultsArray[mapSearchResults] as IMapSearchResults) : null
				// }
				mapSearchResults={null}
				bbox={urlBBox}
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
				<SearchBarCosmeticNonFunctional election={election} />
			</Box>

			<Outlet />
		</React.Fragment>
	);
}

export default MapEntrypoint;
