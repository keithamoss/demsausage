import { Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import type { Coordinate } from 'ol/coordinate';
import * as React from 'react';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { navigateToMapUsingURLParamsWithoutUpdatingTheView } from '../../app/routing/navigationHelpers/navigationHelpersMap';
import { navigateToPollingPlace } from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import {
	navigateToSearchDrawerAndInitiateGPSSearch,
	navigateToSearchDrawerRoot,
	navigateToSearchListOfPollingPlacesFromGPSSearch,
	navigateToSearchListOfPollingPlacesFromMapboxResults,
	navigateToSearchMapboxResults,
} from '../../app/routing/navigationHelpers/navigationHelpersSearch';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import type { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import type { IMapboxGeocodingAPIResponseFeature } from './searchBarHelpers';
import SearchComponent from './searchByAddressOrGPS/searchComponent';
import SearchByIdsStackComponent from './searchByIds/searchByIdsStackComponent';

const StyledBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	overflowY: 'auto',
	height: '90dvh',
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
function SearchDrawerEntrypoint() {
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

	return <SearchDrawer electionId={electionId} />;
}

interface Props {
	electionId: number;
}

function SearchDrawer(props: Props) {
	const { electionId } = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const urlLonLatFromGPS = getStringParamOrEmptyString(params, 'gps_lon_lat');
	const urlPollingPlaceIds = getStringParamOrEmptyString(params, 'polling_place_ids');

	const onToggleDrawer = useCallback(() => {
		navigateToMapUsingURLParamsWithoutUpdatingTheView(params, navigate);
	}, [navigate, params]);

	const onMapboxSearchTermChange = useCallback(
		(searchTerm: string) => navigateToSearchMapboxResults(params, navigate, searchTerm),
		[navigate, params],
	);

	const onGPSControlClicked = useCallback(
		() => navigateToSearchDrawerAndInitiateGPSSearch(params, navigate),
		[navigate, params],
	);

	const onGPSLocationAcquired = useCallback(
		(currentPosition: Coordinate) =>
			navigateToSearchListOfPollingPlacesFromGPSSearch(params, navigate, currentPosition.join(',')),
		[navigate, params],
	);

	const onChooseMapboxSearchResult = useCallback(
		(feature: IMapboxGeocodingAPIResponseFeature) =>
			navigateToSearchListOfPollingPlacesFromMapboxResults(
				params,
				navigate,
				feature.place_name,
				feature.geometry.coordinates.join(','),
			),
		[navigate, params],
	);

	const onChoosePollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => navigateToPollingPlace(params, navigate, pollingPlace),
		[navigate, params],
	);

	const onGoBackFromSearch = useCallback(() => navigateToSearchDrawerRoot(params, navigate), [navigate, params]);

	const onDiscardSearch = useCallback(() => navigateToSearchDrawerRoot(params, navigate), [navigate, params]);

	if (election === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<Helmet>
				<title>Search | {election.name} | Democracy Sausage</title>
			</Helmet>

			<Drawer
				anchor="bottom"
				open={true}
				onClose={onToggleDrawer}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox>
					<StyledInteractableBoxFullHeight>
						{location.pathname.includes('/by_ids/') === true ? (
							<SearchByIdsStackComponent election={election} onChoosePollingPlace={onChoosePollingPlace} />
						) : (
							<SearchComponent
								election={election}
								autoFocusSearchField={urlLonLatFromGPS === '' && urlPollingPlaceIds === ''}
								onMapboxSearchTermChange={onMapboxSearchTermChange}
								onChooseMapboxSearchResult={onChooseMapboxSearchResult}
								onGPSControlClicked={onGPSControlClicked}
								onGPSLocationAcquired={onGPSLocationAcquired}
								onChoosePollingPlaceLabel="Learn More"
								onChoosePollingPlace={onChoosePollingPlace}
								onGoBackFromSearch={onGoBackFromSearch}
								onDiscardSearch={onDiscardSearch}
							/>
						)}
					</StyledInteractableBoxFullHeight>
				</StyledBox>
			</Drawer>
		</React.Fragment>
	);
}

export default SearchDrawerEntrypoint;
