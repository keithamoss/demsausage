import { FiberNewOutlined } from '@mui/icons-material';
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Typography,
} from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { sortBy } from 'lodash-es';
import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { navigateToPendingStallsPollingPlaceById } from '../../app/routing/navigationHelpers/navigationHelpersPendingStalls';
import type { Election } from '../../app/services/elections';
import {
	type PollingPlaceWithPendingStall,
	type UnofficialPollingPlaceWithPendingStall,
	useGetPendingStallsQuery,
} from '../../app/services/stalls';
import { theme } from '../../app/ui/theme';
import { isDevelopment } from '../../app/utils';
import { selectAllElections } from '../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReactAvatar } from '../icons/jurisdictionHelpers';
import { PendingStallsAllCaughtUp, getCountOfExistingStallsIcon } from './pendingStallsHelpers';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
	paddingLeft: theme.spacing(2),
}));

function EntrypointLayer1() {
	const elections = useAppSelector((state) => selectAllElections(state));

	return <PendingStalls elections={elections} />;
}

interface Props {
	elections: Election[];
}

function PendingStalls(props: Props) {
	const { elections } = props;

	const navigate = useNavigate();

	const {
		data: pollingPlaceWithPendingStalls,
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery(undefined, {
		pollingInterval: isDevelopment() === true ? 30000 : 5000,
		skipPollingIfUnfocused: true,
	});

	const electionsWithPendingStalls = sortBy(
		elections.filter((e) => [...new Set(pollingPlaceWithPendingStalls?.map((p) => p.election_id))].includes(e.id)),
		['election_day'],
	);

	const onClickPollingPlace = useCallback(
		(pollingPlace: PollingPlaceWithPendingStall | UnofficialPollingPlaceWithPendingStall) => () => {
			// @TODO Support unofficial polling places...somehow
			// 'id' in pollingPlace ? pollingPlace.id : pollingPlace.id_unofficial
			if ('id' in pollingPlace) {
				navigateToPendingStallsPollingPlaceById(navigate, pollingPlace.id);
			}
		},
		[navigate],
	);

	return (
		<React.Fragment>
			<Helmet>
				<title>Pending Submissions | Democracy Sausage</title>
			</Helmet>

			{isGetPendingStallsLoading === true && isGetPendingStallsSuccessful === false && (
				<LinearProgress color="secondary" />
			)}

			<PageWrapper>
				{isGetPendingStallsErrored === true && (
					<Alert severity="error">
						<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
						Something went awry when we tried to fetch the list of pending submissions.
					</Alert>
				)}

				{isGetPendingStallsSuccessful === true && (
					<React.Fragment>
						{pollingPlaceWithPendingStalls.length === 0 && <PendingStallsAllCaughtUp />}

						<List
							sx={{
								pt: 0,
								'& > li:first-of-type': {
									pt: 0,
								},
								'& > li:not(:first-of-type)': {
									pt: 2,
								},
							}}
						>
							{electionsWithPendingStalls.map((e) => (
								<React.Fragment key={e.id}>
									<ListItem>
										<ListItemAvatar>{getJurisdictionCrestStandaloneReactAvatar(e.jurisdiction)}</ListItemAvatar>

										<ListItemText
											sx={{
												'& .MuiListItemText-primary': {
													fontSize: 15,
													fontWeight: theme.typography.fontWeightMedium,
													color: theme.palette.text.primary,
												},
												pl: 2,
												pr: 2,
												pt: 1,
												pb: 1,
											}}
											primary={e.name}
											secondary={new Date(e.election_day).toLocaleDateString('en-AU', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
											})}
										/>
									</ListItem>

									<Stack spacing={1}>
										{pollingPlaceWithPendingStalls
											.filter((p) => p.election_id === e.id)
											.map((pollingPlace) => {
												const countOfNewPendingStalls = pollingPlace.pending_stalls.filter(
													(s) => s.triaged_on === null,
												).length;
												const countOfEditedPendingStalls = pollingPlace.pending_stalls.filter(
													(s) => s.triaged_on !== null,
												).length;

												return (
													<Card
														variant="outlined"
														key={'id' in pollingPlace ? pollingPlace.id : pollingPlace.id_unofficial}
													>
														<StyledCardContent>
															<Box onClick={onClickPollingPlace(pollingPlace)} sx={{ cursor: 'pointer' }}>
																<Typography
																	variant="h5"
																	component="div"
																	sx={{
																		fontSize: 16,
																		fontWeight: 500,
																	}}
																>
																	{pollingPlace.premises || pollingPlace.name}
																</Typography>

																<Typography color="text.secondary" sx={{ fontSize: 15 }}>
																	{pollingPlace.address}
																</Typography>
															</Box>
														</StyledCardContent>

														<StyledCardActions>
															{countOfNewPendingStalls > 0 && (
																<Button
																	size="small"
																	variant="contained"
																	disabled={true}
																	sx={{
																		color: 'white !important',
																		backgroundColor: '#0389d1 !important',
																	}}
																>
																	{countOfNewPendingStalls} New {countOfNewPendingStalls > 1 ? 'Subs' : 'Sub'}
																</Button>
															)}

															{countOfEditedPendingStalls > 0 && (
																<Button
																	size="small"
																	variant="contained"
																	disabled={true}
																	sx={{
																		color: 'white !important',
																		backgroundColor: '#0389d1 !important',
																	}}
																>
																	{countOfEditedPendingStalls} New {countOfEditedPendingStalls > 1 ? 'Edits' : 'Edit'}
																</Button>
															)}

															<Box
																sx={{
																	flex: 1,
																	justifyContent: 'flex-start',
																}}
															/>

															{pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied === 0 && (
																<Button
																	size="small"
																	disabled={true}
																	startIcon={<FiberNewOutlined />}
																	sx={{
																		color: `${blueGrey.A700} !important`,
																		ml: '0px !important',
																	}}
																>
																	First {pollingPlace.pending_stalls.length > 1 ? 'Subs' : 'Sub'}
																</Button>
															)}

															{pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied > 0 && (
																<Button
																	size="small"
																	disabled={true}
																	startIcon={getCountOfExistingStallsIcon(
																		pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied,
																	)}
																	sx={{
																		color: `${blueGrey.A700} !important`,
																		ml: '0px !important',
																	}}
																>
																	Previous{' '}
																	{pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied > 1
																		? 'Subs'
																		: 'Sub'}
																</Button>
															)}
														</StyledCardActions>
													</Card>
												);
											})}
									</Stack>
								</React.Fragment>
							))}
						</List>
					</React.Fragment>
				)}
			</PageWrapper>
		</React.Fragment>
	);
}

export default EntrypointLayer1;
