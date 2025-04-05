import { AutoGraph, Close } from '@mui/icons-material';
import {
	AlertTitle,
	AppBar,
	Avatar,
	Box,
	Card,
	CardContent,
	CardHeader,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Toolbar,
	Typography,
	styled,
	tableCellClasses,
} from '@mui/material';
import { BarChart } from '@mui/x-charts';
import type {} from '@mui/x-charts/themeAugmentation';
import { useNotifications } from '@toolpad/core';
import dayjs from 'dayjs';
import { round, sortBy } from 'lodash-es';
import React from 'react';
import { useAppSelector } from '../../app/hooks';
import type { Election } from '../../app/services/elections';
import { StallStatus, StallSubmitterType, getStallSubmitterTypeName } from '../../app/services/stalls';
import { DialogWithTransition } from '../../app/ui/dialog';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import PendingStallsGamifiedUserStatsBar from '../pendingStalls/list/PendingStallsGamifiedUserStatsBar';
import { selectAllElections } from './electionsSlice';

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

interface EntrypointProps {
	election: Election;
	onClose: () => void;
}

function ElectionStatsEntrypoint(props: EntrypointProps) {
	const { election, onClose } = props;

	const elections = useAppSelector(selectAllElections);

	return <ElectionStats election={election} elections={elections} onClose={onClose} />;
}

interface Props {
	election: Election;
	elections: Election[];
	onClose: () => void;
}

const calcPercentageOfPollingPlaceWithData = (e: Election) => round((e.stats.with_data / e.stats.total) * 100, 1) || 0;

function ElectionStats(props: Props) {
	const { election, elections, onClose } = props;

	const notifications = useNotifications();

	const datasetPollingPlaceWithData = elections
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
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<Close />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Election Stats
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ p: 2 }}>
				{election.stats.subs_by_type_and_day.length > 0 && (
					<Box
						sx={{
							mt: 1,
							mb: 2,
						}}
					>
						<BarChart
							dataset={election.stats.subs_by_type_and_day}
							series={Object.values(StallSubmitterType).map((i) => ({
								dataKey: i,
								stack: 'total',
								label: getStallSubmitterTypeName(i),
							}))}
							onItemClick={(event, d) => {
								const data = election.stats.subs_by_type_and_day[d.dataIndex];

								notifications.show(
									<React.Fragment>
										<AlertTitle>{dayjs(data.day).format('D MMMM YYYY')}</AlertTitle>

										<TableContainer component={Paper}>
											<Table size="small">
												<TableBody>
													{Object.entries(data).map(([key, value]) =>
														key !== 'day' ? (
															<StyledTableRow key={key}>
																<StyledTableCell component="th" scope="row">
																	{getStallSubmitterTypeName(key as StallSubmitterType)}
																</StyledTableCell>
																<StyledTableCell align="right">{value !== null ? value : 0}</StyledTableCell>
															</StyledTableRow>
														) : undefined,
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</React.Fragment>,
									{
										severity: 'info',
										autoHideDuration: 6000,
									},
								);
							}}
							margin={{ top: document.documentElement.clientWidth <= 600 ? 90 : 50 }}
							grid={{ vertical: document.documentElement.clientWidth >= 600 }}
							axisHighlight={{
								x: 'line',
							}}
							xAxis={[
								{
									dataKey: 'day',
									scaleType: 'band',
									valueFormatter: (value, context) => dayjs(value).format('D MMM'),
								},
							]}
							height={300}
						/>
					</Box>
				)}

				{election.stats.triage_actions_by_day.length > 0 && (
					<Box
						sx={{
							mt: 1,
							mb: 2,
						}}
					>
						<BarChart
							dataset={election.stats.triage_actions_by_day}
							series={Object.values(StallStatus)
								.filter((i) => i !== StallStatus.Pending)
								.map((i) => ({
									dataKey: i,
									stack: 'total',
									label: i,
								}))}
							onItemClick={(event, d) => {
								const data = election.stats.triage_actions_by_day[d.dataIndex];

								notifications.show(
									<React.Fragment>
										<AlertTitle>{dayjs(data.day).format('D MMMM YYYY')}</AlertTitle>

										<TableContainer component={Paper}>
											<Table size="small">
												<TableBody>
													{Object.entries(data).map(([key, value]) =>
														key !== 'day' ? (
															<StyledTableRow key={key}>
																<StyledTableCell component="th" scope="row">
																	{key}
																</StyledTableCell>
																<StyledTableCell align="right">{value !== null ? value : 0}</StyledTableCell>
															</StyledTableRow>
														) : undefined,
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</React.Fragment>,
									{
										severity: 'info',
										autoHideDuration: 6000,
									},
								);
							}}
							margin={{ top: 50 }}
							grid={{ vertical: document.documentElement.clientWidth >= 600 }}
							axisHighlight={{
								x: 'line',
							}}
							xAxis={[
								{
									dataKey: 'day',
									scaleType: 'band',
									valueFormatter: (value, context) => dayjs(value).format('D MMM'),
								},
							]}
							height={300}
						/>
					</Box>
				)}

				<Box
					sx={{
						mt: 1,
						mb: 2,
					}}
				>
					<BarChart
						dataset={datasetPollingPlaceWithData}
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
									const data = datasetPollingPlaceWithData[dataIndex];
									return `${value}% (${data.with_data} of ${data.total} polling places)`;
								},
							},
						]}
						onItemClick={(event, d) => {
							const data = datasetPollingPlaceWithData[d.dataIndex];

							notifications.show(
								<React.Fragment>
									<AlertTitle>{data.election}</AlertTitle>
									{`${data.data}% (${data.with_data} of ${data.total} polling places)`}
								</React.Fragment>,
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
						barLabel={(item) => {
							// Hide the label until there's enough space for it to fit in the bar
							if (item.value !== null && item.value >= 15) {
								return `${item.value}%`;
							}

							return undefined;
						}}
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
						height={Math.max(150, datasetPollingPlaceWithData.length * 40)}
					/>
				</Box>

				{election.stats.top_submitters.length > 0 && (
					<TableContainer
						component={Paper}
						sx={{
							mt: 1,
							mb: 3,
						}}
					>
						<Table size="small">
							<TableHead>
								<TableRow>
									<StyledTableCell>Email</StyledTableCell>
									<StyledTableCell align="right">Count</StyledTableCell>
								</TableRow>
							</TableHead>

							<TableBody>
								{election.stats.top_submitters.map((row) => (
									<StyledTableRow key={row.email}>
										<StyledTableCell component="th" scope="row">
											{row.email}
										</StyledTableCell>
										<StyledTableCell align="right">{row.count}</StyledTableCell>
									</StyledTableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

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

				{election.stats.noms_changes_by_user.length > 0 && (
					<Card variant="outlined" sx={{ mt: 3 }}>
						<CardHeader
							sx={{
								p: 1,
								pb: 0,
								'& .MuiCardHeader-title': {
									fontSize: 18,
									fontWeight: 700,
								},
							}}
							avatar={
								<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} variant="rounded">
									<AutoGraph />
								</Avatar>
							}
							title="Stats for Nerds"
						/>

						<CardContent sx={{ p: 2, pb: '16px !important' }}>
							<Typography variant="body1" sx={{ mb: 2 }}>
								Data on who has approved the most stalls and added the most data points.
							</Typography>

							<PendingStallsGamifiedUserStatsBar stats={election.stats.noms_changes_by_user} />

							<TableContainer component={Paper} sx={{ mt: 3 }}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<StyledTableCell>Who</StyledTableCell>
											<StyledTableCell align="right">Total</StyledTableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{sortBy(election.stats.noms_changes_by_user, 'total')
											.reverse()
											.map((row) => (
												<StyledTableRow key={row.id}>
													<StyledTableCell component="th" scope="row">
														{row.name}
													</StyledTableCell>
													<StyledTableCell align="right">{row.total}</StyledTableCell>
												</StyledTableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				)}
			</Paper>
		</DialogWithTransition>
	);
}

export default ElectionStatsEntrypoint;
