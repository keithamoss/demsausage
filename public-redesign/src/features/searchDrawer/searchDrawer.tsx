import { Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { ESearchDrawerSubComponent, selectSearchBarInitialMode } from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import SearchComponent from '../map/searchBar/searchComponent';
import { getPollingPlacePermalink } from '../pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';

const StyledBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
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

	const searchBarInitialMode = useAppSelector((state) => selectSearchBarInitialMode(state));
	const urlLonLatFromGPS = getStringParamOrEmptyString(useParams(), 'gps_lon_lat');

	const toggleDrawer = () => {
		navigate(params.election_name !== undefined ? `/${params.election_name}` : '/');
	};

	if (election === undefined) {
		return null;
	}

	const onChoosePollingPlace = (pollingPlace: IPollingPlace) => {
		navigate(getPollingPlacePermalink(election, pollingPlace), { state: { cameFromSearchDrawerOrMap: true } });
	};

	return (
		<React.Fragment>
			<Drawer
				anchor="bottom"
				open={true}
				onClose={toggleDrawer}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox>
					<StyledInteractableBoxFullHeight>
						<SearchComponent
							election={election}
							autoFocusSearchField={
								searchBarInitialMode === ESearchDrawerSubComponent.SEARCH_FIELD && urlLonLatFromGPS === ''
							}
							onChoosePollingPlace={onChoosePollingPlace}
						/>
					</StyledInteractableBoxFullHeight>
				</StyledBox>
			</Drawer>
		</React.Fragment>
	);
}

export default SearchDrawerEntrypoint;
