import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks/store';
import { navigateToAddStallSelectPollingPlaceFromElectionAndReplace } from '../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../app/routing/routingHelpers';
import { useGetElectionsQuery } from '../../app/services/elections';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { getBaseURL } from '../../app/utils';
import { selectActiveElections } from '../elections/electionsSlice';
import AddStallNoLiveElection from './addStallNoLiveElection/addStallNoLiveElection';

const bottomNav = 56;

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	// Bg for light was grey[100]
	backgroundColor: theme.palette.mode === 'light' ? 'white' : theme.palette.background.default,
	paddingBottom: `${bottomNav}px`,
}));

const PageWrapper = styled('div')((/*{ theme }*/) => ({
	//   paddingLeft: theme.spacing(1),
	//   paddingRight: theme.spacing(1),
	'.MuiMobileStepper-positionStatic': {
		backgroundColor: grey[200],
	},
}));

export const isBaseAddStallURL = (pathname: string) => pathname === '/add-stall' || pathname === '/add-stall/';

export default function AddStall() {
	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const urlElectionName = getStringParamOrEmptyString(params, 'election_name');

	const {
		isLoading: isGetElectionsLoading,
		isSuccess: isGetElectionsSuccessful,
		isError: isGetElectionsErrored,
	} = useGetElectionsQuery();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const isEligbleToSkipToSelectPollingPlace =
		isBaseAddStallURL(location.pathname) && isGetElectionsSuccessful === true && activeElections.length === 1;

	// If there's only one active election, we can skip the 'Choose an election' step and send the user straight to choosing a polling place.
	useEffect(() => {
		if (isEligbleToSkipToSelectPollingPlace === true) {
			navigateToAddStallSelectPollingPlaceFromElectionAndReplace(navigate, activeElections[0]);
		}
	}, [activeElections, isEligbleToSkipToSelectPollingPlace, navigate]);

	if (isGetElectionsLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetElectionsErrored === true) {
		return <ErrorElement />;
	}

	if (isGetElectionsSuccessful === true && activeElections.length === 0) {
		return <AddStallNoLiveElection />;
	}

	// Stop folks using the Add Stall interface for elections that aren't active
	if (
		isGetElectionsSuccessful === true &&
		urlElectionName !== '' &&
		activeElections.find((e) => e.name_url_safe === urlElectionName) === undefined
	) {
		return <AddStallNoLiveElection />;
	}

	// Don't render anything because our navigate() in the useEffect() above will be sending us off to choose a polling place.
	if (isEligbleToSkipToSelectPollingPlace === true) {
		return null;
	}

	// If we've loaded elections successfully, and have more than one active election, let everything continue as normal so the user lands on the 'Choose an election' screen.
	return (
		<Root>
			<Helmet>
				<title>Add a sausage sizzle or cake stall | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="Add a sausage sizzle or cake stall | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Box sx={{ flexGrow: 1 }}>
					<Outlet />
				</Box>
			</PageWrapper>
		</Root>
	);
}
