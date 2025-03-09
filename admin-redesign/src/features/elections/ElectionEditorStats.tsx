import {
	Box,
	Card,
	CardContent,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	styled,
	tableCellClasses,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import type {} from '@mui/x-charts/themeAugmentation';
import { useNotifications } from '@toolpad/core';
import { round } from 'lodash-es';
import type React from 'react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToElection,
	navigateToElectionControls,
	navigateToElections,
} from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { Election } from '../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import PendingStallsGamifiedUserStatsBar from '../pendingStalls/list/PendingStallsGamifiedUserStatsBar';
import { getElectionEditorNavTabs } from './electionHelpers';
import { selectAllElections } from './electionsSlice';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

const ContentWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: mapaThemePrimaryPurple,
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

function ElectionEditorEntrypoint() {
	const params = useParams();
	const urlElectionName = getStringParamOrUndefined(params, 'election_name');

	const elections = useAppSelector(selectAllElections);
	const election = elections.find((e) => e.name_url_safe === urlElectionName);

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	if (election === undefined) {
		return <NotFound />;
	}

	return <ElectionEditorStats election={election} elections={elections} />;
}

interface Props {
	election: Election;
	elections: Election[];
}

const calcPercentageOfPollingPlaceWithData = (e: Election) => round((e.stats.with_data / e.stats.total) * 100, 1);

function ElectionEditorStats(props: Props) {
	const { election, elections } = props;

	const navigate = useNavigate();
	const notifications = useNotifications();

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		navigateToElections(navigate);
	}, [navigate]);

	const onClickGoToForm = useCallback(() => {
		navigateToElection(navigate, election);
	}, [navigate, election]);

	const onClickGoToControls = useCallback(() => {
		navigateToElectionControls(navigate, election);
	}, [navigate, election]);

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		if (newValue === 0) {
			onClickGoToForm();
		} else if (newValue === 1) {
			onClickGoToControls();
		}
	};
	// ######################
	// Navigation (End)
	// ######################

	const dataset = elections
		.filter((e) => {
			if (e.id === election.id) {
				return true;
			}

			if (e.jurisdiction === election.jurisdiction && e.is_hidden === false) {
				if (election.is_federal === true && e.is_federal === true) {
					return true;
				}

				if (election.is_state === true && e.is_state === true) {
					return true;
				}
			}
			return false;
		})
		.map((e) => ({
			data: calcPercentageOfPollingPlaceWithData(e),
			with_data: e.stats.with_data,
			total: e.stats.total,
			election: e.name,
		}));

	return (
		<PageWrapper>
			{getElectionEditorNavTabs('Stats', onClickBack, onTabChange)}

			<ContentWrapper>
				<Box
					sx={{
						mt: 1,
						mb: 2,
					}}
				>
					<BarChart
						dataset={dataset}
						yAxis={[
							{
								scaleType: 'band',
								dataKey: 'election',
								tickPlacement: 'middle',
								tickLabelPlacement: 'middle',
								valueFormatter: (value, context) => {
									if (context.location === 'tick') {
										return value.split(' ').pop();
									}

									return value;
								},
							},
						]}
						series={[
							{
								dataKey: 'data',
								color: mapaThemePrimaryPurple,
								valueFormatter: (value, { dataIndex }) => {
									const data = dataset[dataIndex];
									return `${value}% (${data.with_data} of ${data.total} polling places)`;
								},
							},
						]}
						onItemClick={(event, d) => {
							const data = dataset[d.dataIndex];
							notifications.show(
								`${data.election}: ${data.data}% (${data.with_data} of ${data.total} polling places)`,
								{
									severity: 'info',
									autoHideDuration: 3000,
								},
							);
						}}
						layout="horizontal"
						margin={{ top: 0 }}
						grid={{ vertical: true }}
						slotProps={{ legend: { hidden: true } }}
						barLabel={(item) => `${item.value}%`}
						axisHighlight={{
							x: 'line',
						}}
						xAxis={[
							{
								label: '% of polling places with data',
								max: 100,
							},
						]}
						sx={{
							'& .MuiBarLabel-root': {
								fill: 'white',
							},
						}}
						height={Math.max(150, dataset.length * 40)}
					/>
				</Box>

				{election.stats.by_source.length > 0 && (
					<TableContainer component={Paper}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<StyledTableCell>Source</StyledTableCell>
									<StyledTableCell align="right">Count</StyledTableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{election.stats.by_source.map((row) => (
									<StyledTableRow key={row.source}>
										<StyledTableCell component="th" scope="row">
											{row.source}
										</StyledTableCell>
										<StyledTableCell align="right">{row.count}</StyledTableCell>
									</StyledTableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				{election.stats.pending_subs.length > 0 && (
					<Card variant="outlined" sx={{ mt: 2 }}>
						<CardContent sx={{ p: 2, pb: '16px !important' }}>
							<PendingStallsGamifiedUserStatsBar stats={election.stats.pending_subs} />
						</CardContent>
					</Card>
				)}
			</ContentWrapper>
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
