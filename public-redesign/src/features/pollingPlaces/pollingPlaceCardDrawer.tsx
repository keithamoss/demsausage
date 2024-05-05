import { Alert, AlertTitle, Drawer, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { navigateToMapUsingURLParams } from '../../app/routing/navigationHelpers';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import { useGetPollingPlaceByUniqueDetailsLookupQuery } from '../../app/services/pollingPlaces';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections } from '../elections/electionsSlice';
import PollingPlaceCard from './pollingPlaceCard';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	// backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	overflowY: 'auto',
	height: '90dvh',
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
function PollingPlaceCardDrawerEntrypoint() {
	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	const params = useParams();

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(params, 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	const election = elections.find((e) => e.id === electionId);

	if (electionId === undefined || election === undefined) {
		return null;
	}

	if (params.polling_place_name === undefined || params.polling_place_state === undefined) {
		return null;
	}

	return (
		<PollingPlaceCardDrawer
			election={election}
			name={params.polling_place_name}
			premises={params.polling_place_premises}
			state={params.polling_place_state}
		/>
	);
}

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

interface Props {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
}

function PollingPlaceCardDrawer(props: Props) {
	const { election, name, premises, state } = props;

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const cameFromInternalNavigation = (location.state as LocationState)?.cameFromInternalNavigation === true;

	const {
		data: pollingPlace,
		error,
		isFetching,
		isSuccess,
	} = useGetPollingPlaceByUniqueDetailsLookupQuery({ electionId: election.id, name, premises, state });

	const onToggleDrawer = useCallback(() => {
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to start a brand new search.
			navigateToMapUsingURLParams(params, navigate);
		}
	}, [cameFromInternalNavigation, navigate, params]);

	return (
		<Drawer
			anchor="bottom"
			open={true}
			onClose={onToggleDrawer}
			ModalProps={{
				keepMounted: true,
			}}
		>
			<StyledInteractableBoxFullHeight>
				{isFetching === true && <LinearProgress color="secondary" />}

				{/* Handles not found and all other types of error */}
				{error !== undefined && (
					<Alert severity="error">
						<AlertTitle>Sorry, we&lsquo;ve hit a snag.</AlertTitle>
						Something went awry when we tried to load this polling place.
					</Alert>
				)}

				{isSuccess === true && pollingPlace !== undefined && (
					<PollingPlaceCard pollingPlace={pollingPlace} election={election} />
				)}
			</StyledInteractableBoxFullHeight>
		</Drawer>
	);
}

export default PollingPlaceCardDrawerEntrypoint;
