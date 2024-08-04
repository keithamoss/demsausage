import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';
import { Election } from '../../app/services/elections';
import { ISausagelyticsStateStats } from '../../app/services/electionsStats';

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
	min-width: 40%;
	max-width: 600px;
	justify-content: center;
`;

const BoothsWithSausageSizzlesContainer = styled(FlexboxWrapContainer)`
	margin-bottom: 20px;
	align-items: stretch;
`;

const BoothsWithSausageSizzlesLabel = styled('div')`
	width: 40%;
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

interface Props {
	election: Election;
	stats: ISausagelyticsStateStats;
}

export default function SausagelyticsState(props: Props) {
	const { stats } = props;

	return (
		<React.Fragment>
			<SausagelyticsContainer>
				<FlexboxContainerCols>
					<BoothsWithSausageSizzlesContainer>
						<BoothsWithSausageSizzlesLabel>Polling booths with sausage sizzles</BoothsWithSausageSizzlesLabel>
						<BoothsWithSausageSizzlesBigNumberContainer>
							<BoothsWithSausageSizzlesBigNumber>
								{stats.state.data.all_booths_by_noms.bbq.booth_count}
							</BoothsWithSausageSizzlesBigNumber>
						</BoothsWithSausageSizzlesBigNumberContainer>
					</BoothsWithSausageSizzlesContainer>
				</FlexboxContainerCols>

				<FlexboxContainerCols>
					<FlexboxItemSubtitle style={{ marginBottom: 10, marginTop: 20 }}>
						What&apos;s available at stalls
					</FlexboxItemSubtitle>

					<FlexboxWrapContainer>
						<TableContainer>
							<Table sx={{ maxWidth: '600px' }}>
								<TableHead>
									<TableRow>
										<TableCell>Noms</TableCell>
										<TableCell># of booths</TableCell>
										<TableCell>% of all booths</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{Object.keys(stats.state.data.all_booths_by_noms).map((nomsName: string) => (
										<TableRow key={nomsName}>
											<TableCell>{nomsName.replace(/_/g, ' ')}</TableCell>
											<TableCell>{stats.state.data.all_booths_by_noms[nomsName].booth_count}</TableCell>
											<TableCell>
												{stats.state.data.all_booths.booth_count > 0 &&
													new Intl.NumberFormat('en-AU', {
														style: 'percent',
														minimumFractionDigits: 1,
													}).format(
														stats.state.data.all_booths_by_noms[nomsName].booth_count /
															stats.state.data.all_booths.booth_count,
													)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</FlexboxWrapContainer>
				</FlexboxContainerCols>
			</SausagelyticsContainer>
		</React.Fragment>
	);
}
