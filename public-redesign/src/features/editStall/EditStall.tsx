import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks/store';
import { useGetElectionsQuery } from '../../app/services/elections';
import { getDefaultOGMetaTags } from '../../app/ui/socialSharingTagsHelpers';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { getBaseURL } from '../../app/utils';
import { selectActiveElections } from '../elections/electionsSlice';
import EditStallNoLiveElection from './editStallNoLiveElection/editStallNoLiveElection';

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

export default function EditStall() {
	const {
		isLoading: isGetElectionsLoading,
		isSuccess: isGetElectionsSuccessful,
		isError: isGetElectionsErrored,
	} = useGetElectionsQuery();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	// Stop folks using the Edit Stall interface for elections that aren't active
	if (isGetElectionsLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetElectionsErrored === true) {
		return <ErrorElement />;
	}

	if (isGetElectionsSuccessful === true && activeElections.length === 0) {
		return <EditStallNoLiveElection />;
	}

	// If we've loaded elections successfully, and have more than one active election, let everything continue as normal so the user lands on the 'Edit Stall' screen and we do the checking to see if their `token` and `signature` are valid
	return (
		<Root>
			<Helmet>
				<title>Edit a sausage sizzle or cake stall | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				{getDefaultOGMetaTags()}
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="Edit a sausage sizzle or cake stall | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Box sx={{ flexGrow: 1 }}>
					<Outlet />
				</Box>
			</PageWrapper>
		</Root>
	);
}
