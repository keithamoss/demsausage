import {
	Alert,
	AlertTitle,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
	styled,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToPollingPlaceEditorForm,
	navigateToPollingPlaceSearch,
	navigateToPollingPlaceSearchResultsFromURLSearchTerm,
	navigateToPollingPlaceStalls,
} from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import { getIntegerParamOrUndefined, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { Election } from '../../app/services/elections';
import {
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceNomsHistoryByIdQuery,
} from '../../app/services/pollingPlaces';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { getPollingPlaceNavTabs, getPollingPlaceSummaryCardForHeading } from './pollingPlaceHelpers';
import { getNomsHistoryChangeFieldsString, getNomsHistoryIcon } from './pollingPlaceNomsHistoryHelpers';
import { type IPollingPlace, eNomsHistoryChangeType } from './pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

const ContentWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
}));

function EntrypointLayer1() {
	const params = useParams();

	const urlElectionName = getStringParamOrUndefined(params, 'election_name');
	const urlPollingPlaceId = getIntegerParamOrUndefined(params, 'polling_place_id');

	let electionId: number | undefined;
	const elections = useAppSelector(selectAllElections);

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

	return <PollingPlaceNomsHistory pollingPlace={pollingPlaces[0]} election={election} />;
}

interface Props {
	pollingPlace: IPollingPlace;
	election: Election;
}

function PollingPlaceNomsHistory(props: Props) {
	const { pollingPlace, election } = props;

	const params = useParams();
	const navigate = useNavigate();

	const urlSearchTerm = getStringParamOrUndefined(params, 'search_term');

	// We didn't introduce polling place noms history tracking until the 2025 elections
	const isElectionWithoutHistory = dayjs(election.election_day).isBefore('2025-01-01', 'year') === true;

	const {
		data: nomsHistory,
		isFetching: isFetchingNomsHistory,
		isSuccess: isSuccessFetchingNomsHistory,
	} = useGetPollingPlaceNomsHistoryByIdQuery(isElectionWithoutHistory === false ? pollingPlace.id : skipToken);

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

	const onClickGoToStalls = useCallback(() => {
		navigateToPollingPlaceStalls(params, navigate, pollingPlace);
	}, [params, navigate, pollingPlace]);

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		if (newValue === 0) {
			onClickGoToForm();
		} else if (newValue === 2) {
			onClickGoToStalls();
		}
	};
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			{getPollingPlaceSummaryCardForHeading(pollingPlace)}

			{getPollingPlaceNavTabs('History', onClickBack, onTabChange)}

			<ContentWrapper>
				{isFetchingNomsHistory === true && <LinearProgress color="secondary" />}

				{isElectionWithoutHistory === true && (
					<Alert severity="warning">
						<AlertTitle>No history available</AlertTitle>
						We didn&apos;t begin tracking history for polling places until 2025, so there&apos;s nowt to see here,
						sorry.
					</Alert>
				)}

				{isFetchingNomsHistory === false && isSuccessFetchingNomsHistory === true && nomsHistory.length === 0 && (
					<Alert severity="info">
						<AlertTitle>No history found</AlertTitle>
						Nothing has been recorded yet for this polling place during this election.
					</Alert>
				)}

				{isFetchingNomsHistory === false && isSuccessFetchingNomsHistory === true && nomsHistory.length > 0 && (
					<List
						sx={{
							pt: 0,
							'& li:first-of-type': {
								pt: 0,
							},
						}}
					>
						{nomsHistory.map((historyItem) => {
							const HistoryChangeTypeIcon = getNomsHistoryIcon(historyItem);

							return (
								<ListItem key={historyItem.history_id}>
									<ListItemIcon>{<HistoryChangeTypeIcon />}</ListItemIcon>

									<ListItemText
										primary={
											<React.Fragment>
												<Typography
													variant="h5"
													component="div"
													sx={{
														fontSize: 16,
														fontWeight: 500,
													}}
												>
													{historyItem.history_change_reason || 'Unknown'}
												</Typography>
											</React.Fragment>
										}
										secondary={
											<React.Fragment>
												{historyItem.history_type === eNomsHistoryChangeType.EDITED &&
													historyItem.changed_fields !== undefined &&
													historyItem.changed_fields.includes('deleted') === false && (
														// The font colour here matches the colour of the 'primary' text on ListItemText, just so it stands out a bit more
														<span style={{ color: 'rgba(0, 0, 0, 0.87)', display: 'block' }}>
															Changed fields: {getNomsHistoryChangeFieldsString(historyItem)}
														</span>
													)}

												<span style={{ display: 'block' }}>
													{historyItem.history_user_name} on {dayjs(historyItem.history_date).format('D MMMM YYYY')} at{' '}
													{dayjs(historyItem.history_date).format('HH:mm')}
												</span>
											</React.Fragment>
										}
									/>
								</ListItem>
							);
						})}
					</List>
				)}
			</ContentWrapper>
		</PageWrapper>
	);
}

export default EntrypointLayer1;
