import EmailIcon from '@mui/icons-material/Email';
import { Alert, AlertTitle, Avatar, Box, List, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { skipToken } from '@reduxjs/toolkit/query';
import { Helmet } from 'react-helmet-async';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks/store';
import { useGetStallQuery } from '../../app/services/stalls';
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

const PageWrapper = styled('div')(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'.MuiMobileStepper-positionStatic': {
		backgroundColor: grey[200],
	},
}));

export default function EditStall() {
	// const params = useParams();
	// const navigate = useNavigate();
	// const location = useLocation();

	const parsed = new URL(window.location.href);
	const stallId = parseInt(parsed.searchParams.get('stall_id') || '');
	const token = parsed.searchParams.get('token');
	const signature = parsed.searchParams.get('signature');

	const {
		data: stall,
		isLoading: isGetStallLoading,
		isSuccess: isGetStallSuccessful,
		isError: isGetStallErrored,
	} = useGetStallQuery(
		Number.isNaN(stallId) == false && token !== null && signature !== null ? { stallId, token, signature } : skipToken,
	);

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	if (isGetStallLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetStallErrored === true || (isGetStallSuccessful === true && stall === undefined)) {
		return <ErrorElement />;
	}

	// Stop folks using the Edit Stall interface for elections that aren't active
	if (
		isGetStallSuccessful === true &&
		stall !== undefined &&
		activeElections.find((e) => e.id !== stall.election) === undefined
	) {
		return <EditStallNoLiveElection />;
	}

	// If we've loaded elections successfully, and have more than one active election, let everything continue as normal so the user lands on the 'Choose an election' screen.
	return (
		<Root>
			<Helmet>
				<title>Edit a sausage sizzle or cake stall | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="Edit a sausage sizzle or cake stall | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Box sx={{ flexGrow: 1, mt: 2 }}>
					{/* <Outlet /> */}

					{/* See the @TODO in stalls.ts re the Stall interface */}

					<Alert severity="info">
						<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
						We haven&lsquo;t yet rebuilt the stall editing page of the new Democracy Sausage website. Not to worry
						though, just shoot us an email with the changes you&lsquo;d like to make and we&lsquo;ll get them done for
						you!
					</Alert>

					<List>
						<ListItemButton component="a" href="mailto:ausdemocracysausage@gmail.com">
							<ListItemAvatar>
								<Avatar>
									<EmailIcon />
								</Avatar>
							</ListItemAvatar>

							<ListItemText primary="Email us" secondary="ausdemocracysausage@gmail.com" />
						</ListItemButton>
					</List>
				</Box>
			</PageWrapper>
		</Root>
	);
}
