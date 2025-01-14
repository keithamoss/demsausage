import {
	LinearProgress,
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

	return <ElectionEditorControls election={election} />;
}

interface Props {
	election: Election;
}

function ElectionEditorControls(props: Props) {
	const { election } = props;

	const navigate = useNavigate();

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

	const pctOfPollingPlaceWithData = (election.stats.with_data / election.stats.total) * 100;

	return (
		<PageWrapper>
			{getElectionEditorNavTabs('Stats', onClickBack, onTabChange)}

			<ContentWrapper>
				<div>
					{election.stats.with_data} of {election.stats.total} polling places have data (
					{Math.round(pctOfPollingPlaceWithData)}%)
				</div>

				<LinearProgress variant="determinate" value={pctOfPollingPlaceWithData} sx={{ height: 12, mt: 1, mb: 3 }} />

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
			</ContentWrapper>
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
