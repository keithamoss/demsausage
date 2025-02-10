import EmailIcon from '@mui/icons-material/Email';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import {
	Alert,
	AlertTitle,
	Box,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
	styled,
} from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToPollingPlaceEditorForm,
	navigateToPollingPlaceHistory,
	navigateToPollingPlaceSearch,
	navigateToPollingPlaceSearchResultsFromURLSearchTerm,
} from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import { getIntegerParamOrUndefined, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { Election } from '../../app/services/elections';
import {
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceStallsByIdQuery,
} from '../../app/services/pollingPlaces';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { selectElectionById, selectVisibleElections } from '../elections/electionsSlice';
import { IconsFlexboxHorizontalSummaryRow } from '../icons/iconHelpers';
import { getPollingPlaceNavTabs, getPollingPlaceSummaryCardForHeading } from './pollingPlaceHelpers';
import { getNomsIconsBar, wrapIconWithTooltip } from './pollingPlaceSearchHelpers';
import { getStallStatusElement, getStallSubmitterTypeElement } from './pollingPlaceStallsHelpers';
import type { IPollingPlace } from './pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

const ContentWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
	paddingLeft: theme.spacing(1.5),
	// A bit more than the usual 1 because the 'contained' variant Approved/Denied/Pending buttons make the padding look visually smaller than the equivalents on the search cards
	paddingBottom: theme.spacing(1.5),
}));

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	minWidth: 36,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	marginBottom: 0,
	'& .MuiListItemText-primary': {
		color: blueGrey.A700,
	},
}));

function EntrypointLayer1() {
	const params = useParams();

	const urlElectionName = getStringParamOrUndefined(params, 'election_name');
	const urlPollingPlaceId = getIntegerParamOrUndefined(params, 'polling_place_id');

	let electionId: number | undefined;
	const elections = useAppSelector(selectVisibleElections);

	if (urlElectionName !== undefined && urlElectionName !== '') {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	if (electionId === undefined || urlPollingPlaceId === undefined) {
		return <ErrorElement />;
	}

	return <EntrypointLayer2 electionId={electionId} pollingPlaceId={urlPollingPlaceId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
	pollingPlaceId: number;
}

function EntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId, pollingPlaceId } = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));

	const {
		data: pollingPlaces,
		isLoading: isGetPollingPlaceLoading,
		isSuccess: isGetPollingPlaceSuccessful,
		isError: isGetPollingPlaceErrored,
		error,
	} = useGetPollingPlaceByIdsLookupQuery({ electionId, pollingPlaceIds: [pollingPlaceId] });

	if (isGetPollingPlaceLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetPollingPlaceErrored === true || (isGetPollingPlaceSuccessful === true && pollingPlaces === undefined)) {
		return <ErrorElement />;
	}

	if (pollingPlaces === undefined || pollingPlaces.length !== 1 || election === undefined) {
		return <ErrorElement />;
	}

	return <PollingPlaceStalls pollingPlace={pollingPlaces[0]} election={election} />;
}

interface Props {
	pollingPlace: IPollingPlace;
	election: Election;
}

function PollingPlaceStalls(props: Props) {
	const { pollingPlace, election } = props;

	const params = useParams();
	const navigate = useNavigate();

	const urlSearchTerm = getStringParamOrUndefined(params, 'search_term');

	const {
		data: pollingPlaceStalls,
		isFetching: isFetchingPollingPlaceStalls,
		isSuccess: isSuccessFetchingPollingPlaceStalls,
	} = useGetPollingPlaceStallsByIdQuery(pollingPlace.id);

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		// If the user came directly here from the "Search for a polling place", then we can safely
		// just send them back to land them on their search results screen.
		if (urlSearchTerm !== undefined) {
			navigateToPollingPlaceSearchResultsFromURLSearchTerm(params, navigate);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to the start of selecting a polling place.
			navigateToPollingPlaceSearch(params, navigate);
		}
	}, [urlSearchTerm, params, navigate]);

	const onClickGoToForm = useCallback(
		() => navigateToPollingPlaceEditorForm(params, navigate, pollingPlace),
		[params, navigate, pollingPlace],
	);

	const onClickGoToHistory = useCallback(() => {
		navigateToPollingPlaceHistory(params, navigate, pollingPlace);
	}, [params, navigate, pollingPlace]);

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		if (newValue === 0) {
			onClickGoToForm();
		} else if (newValue === 1) {
			onClickGoToHistory();
		}
	};
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			{getPollingPlaceSummaryCardForHeading(pollingPlace)}

			{getPollingPlaceNavTabs('Stalls', onClickBack, onTabChange)}

			<ContentWrapper>
				{isFetchingPollingPlaceStalls === true && <LinearProgress color="secondary" />}

				{isFetchingPollingPlaceStalls === false &&
					isSuccessFetchingPollingPlaceStalls === true &&
					pollingPlaceStalls.length === 0 && (
						<Alert severity="info">
							<AlertTitle>No stalls found</AlertTitle>
							There haven&apos;t been any stalls have been submitted yet for this polling place during this election.
						</Alert>
					)}

				{isFetchingPollingPlaceStalls === false &&
					isSuccessFetchingPollingPlaceStalls === true &&
					pollingPlaceStalls.length > 0 && (
						<Stack spacing={1}>
							{pollingPlaceStalls.map((stall) => (
								<Card key={stall.id} variant="outlined">
									<StyledCardContent>
										<Box>
											<IconsFlexboxHorizontalSummaryRow>
												{getNomsIconsBar(stall.noms, true, true)}
											</IconsFlexboxHorizontalSummaryRow>

											<Typography
												variant="h5"
												component="div"
												sx={{
													fontSize: 16,
													fontWeight: 500,
												}}
											>
												{stall.name || <em>No stall name supplied</em>}
											</Typography>

											<Typography color="text.secondary" sx={{ fontSize: 15 }}>
												{stall.description || <em>No stall description supplied</em>}
											</Typography>
										</Box>

										<List dense sx={{ paddingBottom: 1, paddingTop: 1 }}>
											<StyledListItem disableGutters>
												{wrapIconWithTooltip(
													<StyledListItemIcon>
														<EmailIcon
															sx={{
																color: blueGrey.A700,
															}}
														/>
													</StyledListItemIcon>,
													'Reported by',
												)}

												<StyledListItemText primary={stall.email} />
											</StyledListItem>

											<StyledListItem disableGutters>
												{wrapIconWithTooltip(
													<StyledListItemIcon>
														<WatchLaterIcon
															sx={{
																color: blueGrey.A700,
															}}
														/>
													</StyledListItemIcon>,
													'Reported on',
												)}

												<StyledListItemText
													primary={`${dayjs(stall.reported_timestamp).format('D MMMM YYYY')} at
											${dayjs(stall.reported_timestamp).format('HH:mm')}`}
												/>
											</StyledListItem>
										</List>
									</StyledCardContent>

									<StyledCardActions>
										{getStallStatusElement(stall.status, stall.previous_status)}

										{getStallSubmitterTypeElement(stall)}
									</StyledCardActions>
								</Card>
							))}
						</Stack>
					)}
			</ContentWrapper>
		</PageWrapper>
	);
}

export default EntrypointLayer1;
