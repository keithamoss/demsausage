import { Alert, AlertTitle, Drawer, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
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

interface LocationState {
	cameFromSearchDrawer?: boolean;
}

// The entrypoint handles determining the election that should be displayed based on route changes.
function PollingPlaceCardDrawerEntrypoint() {
	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	const params = useParams();
	const location = useLocation();

	const cameFromSearchDrawer = (location.state as LocationState)?.cameFromSearchDrawer === true;

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
			cameFromSearchDrawer={cameFromSearchDrawer}
		/>
	);
}

interface Props {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
	cameFromSearchDrawer: boolean;
}

function PollingPlaceCardDrawer(props: Props) {
	const { election, name, premises, state, cameFromSearchDrawer } = props;

	const navigate = useNavigate();

	const {
		data: pollingPlace,
		error,
		isFetching,
		isSuccess,
	} = useGetPollingPlaceByUniqueDetailsLookupQuery({ electionId: election.id, name, premises, state });

	const toggleDrawer = () => {
		// If we've arrived here by searching in the UI, we know we can just
		// go back and we'll remain within the search drawer interface.
		// In most cases, this should send them back to the list of
		// polling place search results for them to choose a different place from,
		if (cameFromSearchDrawer === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to start a brand new search.
			navigate(`/${election.name_url_safe}/search/`);
		}
	};

	return (
		<Drawer
			anchor="bottom"
			open={true}
			onClose={toggleDrawer}
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
					<PollingPlaceCard pollingPlace={pollingPlace} election={election} onClose={toggleDrawer} />
				)}
			</StyledInteractableBoxFullHeight>
		</Drawer>
	);
}

export default PollingPlaceCardDrawerEntrypoint;
