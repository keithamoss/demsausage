import { QueryStats, Schedule } from '@mui/icons-material';
import {
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { useAppSelector } from '../../../app/hooks';
import { navigateToPendingStallsPollingPlaceById } from '../../../app/routing/navigationHelpers/navigationHelpersPendingStalls';
import type { Election } from '../../../app/services/elections';
import {
	type ElectionPendingStalls,
	type PollingPlaceWithPendingStall,
	useGetPendingStallsQuery,
} from '../../../app/services/stalls';
import { theme } from '../../../app/ui/theme';
import { isDevelopment } from '../../../app/utils';
import ElectionPendingStallsLatestChangesList from '../../elections/ElectionPendingStallsLatestChangesList';
import ElectionStats from '../../elections/ElectionStats';
import { selectAllElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReactAvatar } from '../../icons/jurisdictionHelpers';
import { PendingStallsAllCaughtUp } from '../pendingStallsHelpers';
import PendingStallsBoothCard from './PendingStallsBoothCard';
import PendingStallsGamifiedUserStatsBar from './PendingStallsGamifiedUserStatsBar';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

function Entrypoint() {
	// Note: There's no need to check the loading status or errored state here, we already do that in App.tsx
	const elections = useAppSelector((state) => selectAllElections(state));

	const {
		data: electionsWithPendingStalls,
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery(undefined, {
		pollingInterval: isDevelopment() === true ? 30000 : 5000,
		skipPollingIfUnfocused: true,
	});

	if (isGetPendingStallsLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isGetPendingStallsErrored === true || isGetPendingStallsSuccessful === false) {
		return <ErrorElement />;
	}

	return <PendingStalls elections={elections} electionsWithPendingStalls={electionsWithPendingStalls} />;
}

const areThereAnyPendingStalls = (electionsWithPendingStalls: ElectionPendingStalls[]) => {
	for (const data of electionsWithPendingStalls) {
		if (data.booths.length > 0) {
			return true;
		}
	}

	return false;
};

interface Props {
	elections: Election[];
	electionsWithPendingStalls: ElectionPendingStalls[];
}

function PendingStalls(props: Props) {
	const { elections, electionsWithPendingStalls } = props;

	const navigate = useNavigate();

	const pendingStalls = areThereAnyPendingStalls(electionsWithPendingStalls);
	const pageTitle = `${pendingStalls === true ? '🚨 ' : ''}Pending Submissions | Democracy Sausage`;

	const onClickPollingPlace = useCallback(
		(pollingPlace: PollingPlaceWithPendingStall) => () =>
			navigateToPendingStallsPollingPlaceById(navigate, pollingPlace.id),
		[navigate],
	);

	const [selectedElection, setSelectedElection] = useState<Election | undefined>(undefined);

	// ######################
	// Latest Changes Dialog
	// ######################
	const [isLatestChangesDialogOpen, setIsLatestChangesDialogOpen] = useState(false);

	const onOpenLatestChangesDialog = useCallback(
		(election: Election) => () => {
			setIsLatestChangesDialogOpen(true);
			setSelectedElection(election);
		},
		[],
	);

	const onCloseLatestChangesDialog = useCallback(() => {
		setIsLatestChangesDialogOpen(true);
		setSelectedElection(undefined);
	}, []);
	// ######################
	// Latest Changes Dialog (End)
	// ######################

	// ######################
	// Stats Dialog
	// ######################
	const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);

	const onOpenStatsDialog = useCallback(
		(election: Election) => () => {
			setIsStatsDialogOpen(true);
			setSelectedElection(election);
		},
		[],
	);

	const onCloseStatsDialog = useCallback(() => {
		setIsStatsDialogOpen(false);
		setSelectedElection(undefined);
	}, []);
	// ######################
	// Stats Dialog (End)
	// ######################

	return (
		<React.Fragment>
			<Helmet>
				<title>{pageTitle}</title>
			</Helmet>

			<PageWrapper>
				{pendingStalls === false && <PendingStallsAllCaughtUp />}

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
					{electionsWithPendingStalls.map((data) => {
						const election = elections.find((elec) => elec.id === data.election_id);

						if (election === undefined) {
							return;
						}

						return (
							<React.Fragment key={election.id}>
								<Card variant="outlined" sx={{ mb: 1 }}>
									<CardContent sx={{ p: 1 }}>
										<ListItem sx={{ p: 0 }}>
											<ListItemAvatar>
												{getJurisdictionCrestStandaloneReactAvatar(election.jurisdiction)}
											</ListItemAvatar>

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
												primary={election.name}
												secondary={new Date(election.election_day).toLocaleDateString('en-AU', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												})}
											/>
										</ListItem>

										<PendingStallsGamifiedUserStatsBar stats={data.stats} />
									</CardContent>

									<CardActions>
										<Button startIcon={<Schedule />} onClick={onOpenLatestChangesDialog(election)}>
											Latest Changes
										</Button>

										<Button startIcon={<QueryStats />} onClick={onOpenStatsDialog(election)}>
											Stats
										</Button>
									</CardActions>
								</Card>

								<Stack spacing={1} sx={{ mb: 3 }}>
									{data.booths.map((pollingPlace) => (
										<PendingStallsBoothCard
											key={pollingPlace.id}
											// key={'id_unofficial' in pollingPlace ? pollingPlace.id_unofficial : pollingPlace.id}
											pollingPlace={pollingPlace}
											onClickPollingPlace={onClickPollingPlace}
										/>
									))}
								</Stack>
							</React.Fragment>
						);
					})}
				</List>
			</PageWrapper>

			{isLatestChangesDialogOpen === true && selectedElection !== undefined && (
				<ElectionPendingStallsLatestChangesList election={selectedElection} onClose={onCloseLatestChangesDialog} />
			)}

			{isStatsDialogOpen === true && selectedElection !== undefined && (
				<ElectionStats election={selectedElection} onClose={onCloseStatsDialog} />
			)}
		</React.Fragment>
	);
}

export default Entrypoint;
