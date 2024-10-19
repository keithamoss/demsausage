import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import { VictoryBar, VictoryChart, VictoryGroup, VictoryLabel, VictoryPie } from 'victory';
import type { Election } from '../../app/services/elections';
import type { IElectionStats, ISausagelyticsFederalStats } from '../../app/services/electionsStats';
import { theme } from './sausagelyticsFederalHelpers';

const SausagelyticsContainer = styled('div')`
	padding-top: 10px;
	padding-left: 10px;
	padding-right: 10px;
`;

const FlexboxWrapContainer = styled('div')`
	display: flex;
	align-items: flex-start;
	flex-wrap: wrap;
	height: 100%;
	min-width: 30%;
	max-width: 600px;
	justify-content: center;
`;

const BoothsWithSausageSizzlesContainer = styled(FlexboxWrapContainer)`
	margin-bottom: 20px;
	align-items: stretch;
`;

const BoothsWithSausageSizzlesLabel = styled('div')`
	width: 30%;
	vertical-align: middle;
	text-align: right;
	padding-right: 10px;
	font-size: 22px;
`;

const BoothsWithSausageSizzlesBigNumberContainer = styled('div')`
	background-color: #e8bb3c;
	text-align: center;
	align-items: center;
	justify-content: center;
	display: flex;
`;

const BoothsWithSausageSizzlesBigNumber = styled('h2')`
	font-size: 50px;
	margin-top: 10px;
	margin-bottom: 10px;
	padding-left: 10px;
	padding-right: 10px;
`;

const FlexboxItemVictoryPieOverlay = styled('div')`
	/* text-align: center; */
	/* align-items: start; */
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	font-size: 18px;
	margin-top: -3px;
	text-align: center;

	background-color: #e8bb3c;
	color: #292336;
	padding: 10px 10%;
	border-top-left-radius: 50%;
	border-top-right-radius: 50%;
`;

const FlexboxContainerCols = styled('div')`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	/* Or do it all in one line with flex flow */
	/* flex-flow: row wrap; */
	/* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
	/* align-content: flex-end; */
	/* margin-bottom: 20px; */
`;

const NavLinksContainer = styled(FlexboxWrapContainer)`
	margin-bottom: 20px;
	align-items: stretch;
	background-color: #e8bb3c;
	color: #292336;
	max-width: 100%;
	margin-bottom: 20px;
`;

const NavLink = styled('h3')`
	margin-top: 0px;
	margin-bottom: 0px;
	padding: 20px;
	display: inline-block;
	color: white;

	& a,
	a:visited {
		color: black;
	}
`;

const FlexboxItemTitle = styled('h2')`
	margin-top: 0px;
	margin-bottom: 20px;
	background-color: #e8bb3c;
	color: #292336;
	padding: 20px 10%;
`;

const FlexboxItemSubtitle = styled(FlexboxItemTitle)`
	padding: 5px 5%;
`;

const FlexboxItemCircle = styled('div')`
	position: relative;
`;

const FlexboxWrapContainerChild = styled('div')`
	position: relative;
	min-width: 280px;
	max-width: 300px;
	max-height: 200px;
	margin: 10px;
`;

const SausagelyticsTable = styled(Table)`
	max-width: 600px;
	margin-bottom: 40px;

	& td {
		text-overflow: clip !important;
	}
`;

const Metadata = styled('div')`
	font-size: 12px;
	margin: 10px;
`;

const getPie = (stats: IElectionStats, style: React.CSSProperties | undefined = undefined) => {
	const percentage = stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters;
	const data = [
		{ x: 'without_sausage_access', y: 1 - percentage },
		{ x: 'with_sausage_access', y: percentage },
	];

	return (
		<React.Fragment>
			<VictoryPie
				data={data}
				padding={20}
				innerRadius={150}
				startAngle={90}
				endAngle={-90}
				// style={{
				//     data: {
				//         fill: d => d.fill,
				//     },
				// }}
				style={{ parent: { maxHeight: '300px' } }}
				theme={theme}
				// labelPosition="endAngle"
				labels={['']}
			/>
			<FlexboxItemVictoryPieOverlay style={style}>
				<strong>{stats.domain}</strong>
				<br />
				{new Intl.NumberFormat('en-AU').format(stats.data.all_booths_by_noms.bbq.expected_voters)} (
				{new Intl.NumberFormat('en-AU', { style: 'percent', minimumFractionDigits: 1 }).format(percentage)})
			</FlexboxItemVictoryPieOverlay>
		</React.Fragment>
	);
};

interface Props {
	election: Election;
	stats: ISausagelyticsFederalStats;
}

export default function SausagelyticsFederal(props: Props) {
	const { stats } = props;

	const groupStateStatsByNoms = () => {
		const { stats } = props;
		const statsGrouped: {
			[key: string]: {
				x: string;
				y: number;
			}[];
		} = {};

		stats.states.forEach((stateStats: IElectionStats) => {
			for (const [nomsName, nomsStats] of Object.entries(stateStats.data.all_booths_by_noms)) {
				if (!(nomsName in statsGrouped)) {
					statsGrouped[nomsName] = [];
				}

				statsGrouped[nomsName].push({
					x: stateStats.domain,
					y: nomsStats.booth_count,
				});
			}
		});

		return statsGrouped;
	};

	const nomsByState = groupStateStatsByNoms();

	return (
		<React.Fragment>
			<SausagelyticsContainer>
				<FlexboxContainerCols>
					<NavLinksContainer>
						<NavLink>
							<a href="#expected_sausage_access">Voters with access to #democracysausage</a> |{' '}
							<a href="#the_best_and_wurst">Best & Wurst electorates with #democracysausage on offer</a> |{' '}
							<a href="#whos_got_what_by_state">Who&apos;s got what by state</a>
						</NavLink>
					</NavLinksContainer>
				</FlexboxContainerCols>

				<FlexboxContainerCols>
					<BoothsWithSausageSizzlesContainer>
						<BoothsWithSausageSizzlesLabel>Polling booths with sausage sizzles</BoothsWithSausageSizzlesLabel>
						<BoothsWithSausageSizzlesBigNumberContainer>
							<BoothsWithSausageSizzlesBigNumber>
								{stats.australia.data.all_booths_by_noms.bbq.booth_count}
							</BoothsWithSausageSizzlesBigNumber>
						</BoothsWithSausageSizzlesBigNumberContainer>
					</BoothsWithSausageSizzlesContainer>
				</FlexboxContainerCols>

				<FlexboxContainerCols>
					<FlexboxItemTitle id="expected_sausage_access">
						Expected % of voters with access to #democracysausage
					</FlexboxItemTitle>
					<FlexboxItemCircle style={{ minWidth: '30%', maxWidth: '500px' }}>
						{getPie(stats.australia, { borderTopLeftRadius: 'unset', borderTopRightRadius: 'unset', top: '70%' })}
					</FlexboxItemCircle>

					<FlexboxWrapContainer>
						{/* eslint-disable-next-line @typescript-eslint/no-shadow */}
						{stats.states.map((stats: IElectionStats) => (
							<FlexboxWrapContainerChild key={stats.domain}>{getPie(stats)}</FlexboxWrapContainerChild>
						))}
					</FlexboxWrapContainer>
				</FlexboxContainerCols>

				<FlexboxContainerCols>
					<FlexboxItemTitle id="the_best_and_wurst">
						By electorate - Expected % of voters with access to #democracysausage
					</FlexboxItemTitle>

					<FlexboxItemSubtitle>Leaders of the Sizzling Award for commitment to #democracysausage</FlexboxItemSubtitle>
					<FlexboxWrapContainer>
						<TableContainer>
							<SausagelyticsTable>
								<TableBody>
									{/* eslint-disable-next-line @typescript-eslint/no-shadow */}
									{stats.divisions.top.map((stats: IElectionStats) => (
										<TableRow key={stats.domain}>
											<TableCell style={{ width: '40px' }}>{stats.metadata?.rank!}.</TableCell>
											<TableCell>{stats.domain}</TableCell>
											<TableCell>{stats.metadata?.state!}</TableCell>
											<TableCell>
												{new Intl.NumberFormat('en-AU', {
													style: 'percent',
													minimumFractionDigits: 1,
												}).format(
													stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters,
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</SausagelyticsTable>
						</TableContainer>
					</FlexboxWrapContainer>

					<FlexboxItemSubtitle>The Wurst</FlexboxItemSubtitle>
					<FlexboxWrapContainer>
						<TableContainer>
							<SausagelyticsTable>
								<TableBody>
									{/* eslint-disable-next-line @typescript-eslint/no-shadow */}
									{stats.divisions.bottom.map((stats: IElectionStats) => (
										<TableRow key={stats.domain}>
											<TableCell style={{ width: '40px' }}>{stats.metadata?.rank!}.</TableCell>
											<TableCell>{stats.domain}</TableCell>
											<TableCell>{stats.metadata?.state!}</TableCell>
											<TableCell>
												{new Intl.NumberFormat('en-AU', {
													style: 'percent',
													minimumFractionDigits: 1,
												}).format(
													stats.data.all_booths_by_noms.bbq.expected_voters / stats.data.all_booths.expected_voters,
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</SausagelyticsTable>
						</TableContainer>
					</FlexboxWrapContainer>
				</FlexboxContainerCols>

				<FlexboxContainerCols>
					<FlexboxItemTitle id="whos_got_what_by_state">By state - Who&apos;s got what stalls</FlexboxItemTitle>

					<FlexboxWrapContainer>
						<VictoryChart height={1400} domainPadding={{ x: 60, y: 50 }}>
							<VictoryGroup offset={20} padding={50} horizontal={true} colorScale="qualitative">
								{Object.keys(nomsByState).map((nomsName: string) => (
									<VictoryBar
										key={`byNomsByState-${nomsName}`}
										data={nomsByState[nomsName]}
										categories={{
											x: ['ACT', 'NT', 'TAS', 'WA', 'SA', 'QLD', 'VIC', 'NSW'],
										}}
										barWidth={20}
										// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
										labels={({ datum }) => `${datum.y} ${nomsName.replace(/_/g, ' ')}`}
										style={{ labels: { fill: 'black' } }}
										labelComponent={<VictoryLabel />}
									/>
								))}
							</VictoryGroup>
						</VictoryChart>
					</FlexboxWrapContainer>
				</FlexboxContainerCols>

				<Metadata>
					<strong>Note on expected percentage of voters:</strong>
					<br />
					The expected percentage of voters with access to sausage is calculated by comparing the number of expected
					voters at polling places which have sausage with the overall expected voters for that state/territory.
					<br />
					Expected voters comes from AEC Expected election day polling places data, available{' '}
					<a href="https://www.aec.gov.au/About_AEC/cea-notices/election-pp.htm">here</a>.<br />
					As the expected voters relate to election day polling places, pre-poll and postal voters are excluded from the
					expected voters total calculation.
					<br />
					For polling places with multiple divisions, the expected voters count towards the &apos;home&apos; division.
				</Metadata>
			</SausagelyticsContainer>
		</React.Fragment>
	);
}
