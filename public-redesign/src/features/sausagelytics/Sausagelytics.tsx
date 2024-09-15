import {
	Alert,
	AlertTitle,
	FormControl,
	InputLabel,
	LinearProgress,
	ListItem,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Select,
	SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/system';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election, useGetElectionStatsQuery } from '../../app/services/elections';
import { getDefaultOGMetaTags } from '../../app/ui/socialSharingTagsHelpers';
import { StyledInteractableBoxFullHeight } from '../../app/ui/styledInteractableBoxFullHeight';
import { getBaseURL } from '../../app/utils';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { getJurisdictionCrestCircleReact } from '../icons/jurisdictionHelpers';
import SausagelyticsFederal from './SausagelyticsFederal';
import SausagelyticsState from './SausagelyticsState';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
function SausagelyticsEntrypointLayer1() {
	const navigate = useNavigate();

	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	// Force users coming into the root of the Sausagelytics (/sausagelytics/) over to the unique URL for the current default election
	useEffect(() => {
		if (urlElectionName === undefined && defaultElection !== undefined) {
			navigate(`/sausagelytics/${defaultElection.name_url_safe}/`);
		}
	}, [defaultElection, navigate, urlElectionName]);

	if (electionId === undefined) {
		return null;
	}

	return <SausagelyticEntrypointLayer2 electionId={electionId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
}

function SausagelyticEntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId } = props;

	const location = useLocation();

	const elections = useAppSelector((state) => selectAllElections(state));
	const election = useAppSelector((state) => selectElectionById(state, electionId));

	if (election === undefined) {
		return <NotFound />;
	}

	if (location.pathname.startsWith(`/sausagelytics/${election.name_url_safe}`) === true) {
		return <Sausagelytics elections={elections} election={election} />;
	}
}

interface Props {
	elections: Election[];
	election: Election;
}

function Sausagelytics(props: Props) {
	const { elections, election } = props;

	const theme = useTheme();

	const navigate = useNavigate();

	const onChooseElection = (e: SelectChangeEvent<number | string>) => {
		const electionId = parseInt(`${e.target.value}`);
		if (Number.isNaN(electionId) === false) {
			const election = elections.find((e) => e.id === electionId);
			if (election !== undefined) {
				navigate(`/sausagelytics/${election.name_url_safe}/`);
			}
		}
	};

	const {
		data: electionStats,
		error: errorFetchingElectionStats,
		isFetching: isFetchingElectionStats,
		isSuccess: isSuccessFetchingElectionStats,
	} = useGetElectionStatsQuery(election.id);

	return (
		<StyledInteractableBoxFullHeight>
			<Helmet>
				<title>Sausagelytics | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				{getDefaultOGMetaTags()}
				<meta property="og:url" content={`${getBaseURL()}/sausagelytics/`} />
				<meta property="og:title" content="Sausagelytics | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id="choose-an-election">Choose an election</InputLabel>

					<Select
						labelId="choose-an-election"
						value={election.id}
						label="Choose an election"
						onChange={onChooseElection}
					>
						{elections.map((e) => (
							<MenuItem key={e.id} value={e.id}>
								<ListItem disablePadding disableGutters>
									<ListItemIcon sx={{ minWidth: 36 }}>
										{getJurisdictionCrestCircleReact(e.jurisdiction, {
											width: 36,
											height: 36,
											paddingRight: theme.spacing(1),
										})}
									</ListItemIcon>
									<ListItemText primary={e.name} />
								</ListItem>
							</MenuItem>
						))}
					</Select>

					{isFetchingElectionStats === true && <LinearProgress />}
				</FormControl>

				{isFetchingElectionStats === false &&
					isSuccessFetchingElectionStats === true &&
					electionStats !== undefined && (
						<React.Fragment>
							{election.is_federal === true && 'australia' in electionStats && (
								<SausagelyticsFederal election={election} stats={electionStats} />
							)}

							{election.is_federal === false && 'state' in electionStats && (
								<SausagelyticsState election={election} stats={electionStats} />
							)}
						</React.Fragment>
					)}

				{errorFetchingElectionStats !== undefined &&
					('status' in errorFetchingElectionStats && errorFetchingElectionStats.status === 404 ? (
						// Handles not found
						<Alert severity="error" icon={'😢'}>
							<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
							No stats are available for this election
						</Alert>
					) : (
						// Handles all other types of error
						<Alert severity="error">
							<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
							Something went awry when we tried to search for that place.
						</Alert>
					))}
			</PageWrapper>
		</StyledInteractableBoxFullHeight>
	);
}

export default SausagelyticsEntrypointLayer1;
