import { Box, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks';
import { navigateToPendingStallsPollingPlaceById } from '../../app/routing/navigationHelpers/navigationHelpersPendingStalls';
import { type Election, useGetElectionsQuery } from '../../app/services/elections';
import {
	type ElectionPendingStalls,
	type PollingPlaceWithPendingStall,
	useGetPendingStallsQuery,
} from '../../app/services/stalls';
import { theme } from '../../app/ui/theme';
import { isDevelopment } from '../../app/utils';
import { selectAllElections } from '../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReactAvatar } from '../icons/jurisdictionHelpers';
import PendingStallsBoothCard from './PendingStallsBoothCard';
import PendingStallsGamifiedUserStatsBar from './PendingStallsGamifiedUserStatsBar';
import { PendingStallsAllCaughtUp } from './pendingStallsHelpers';

const PageWrapper = styled('div')(({ theme }) => ({
	backgroundColor: grey[100],
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

function EntrypointLayer1() {
	const elections = useAppSelector((state) => selectAllElections(state));

	const {
		isLoading: isGetElectionsLoading,
		isSuccess: isGetElectionsSuccessful,
		isError: isGetElectionsErrored,
	} = useGetElectionsQuery();

	if (isGetElectionsLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isGetElectionsErrored === true || isGetElectionsSuccessful === false) {
		return <ErrorElement />;
	}

	return <EntrypointLayer2 elections={elections} />;
}

interface EntrypointLayer2Props {
	elections: Election[];
}

function EntrypointLayer2(props: EntrypointLayer2Props) {
	const { elections } = props;

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

	if (electionsWithPendingStalls.length === 0) {
		return <PendingStallsAllCaughtUp />;
	}

	return <PendingStalls elections={elections} electionsWithPendingStalls={electionsWithPendingStalls} />;
}

interface Props {
	elections: Election[];
	electionsWithPendingStalls: ElectionPendingStalls[];
}

function PendingStalls(props: Props) {
	const { elections, electionsWithPendingStalls } = props;

	const navigate = useNavigate();

	const onClickPollingPlace = useCallback(
		(pollingPlace: PollingPlaceWithPendingStall) => () =>
			navigateToPendingStallsPollingPlaceById(navigate, pollingPlace.id),
		[navigate],
	);

	return (
		<React.Fragment>
			<Helmet>
				<title>Pending Submissions | Democracy Sausage</title>
			</Helmet>

			<PageWrapper>
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
								<Box sx={{ mb: 2, p: 2, pr: 1, pt: 0, pb: 1 }}>
									<ListItem sx={{ p: 0 }}>
										<ListItemAvatar>{getJurisdictionCrestStandaloneReactAvatar(election.jurisdiction)}</ListItemAvatar>

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
								</Box>

								<Stack spacing={1}>
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
		</React.Fragment>
	);
}

export default EntrypointLayer1;
