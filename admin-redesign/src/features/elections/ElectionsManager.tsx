import { Add, ExpandMore, HistoryEdu, LiveTv, VisibilityOff } from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Button,
	Snackbar,
	Stack,
	Typography,
	styled,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToAddElection,
	navigateToElection,
} from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { type Election, useSetPrimaryElectionMutation } from '../../app/services/elections';
import { SelectElection } from '../../app/ui/selectElection';
import { selectAllElections } from '../elections/electionsSlice';
import ElectionsManagerCard from './ElectionsManagerCard';
import { isElectionLive } from './electionHelpers';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(4),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const createElectionsAccordion = (
	sectionName: string,
	elections: Election[],
	onChooseElection: (election: Election) => void,
) => (
	<Accordion elevation={0} defaultExpanded={sectionName === 'Live'}>
		<AccordionSummary expandIcon={<ExpandMore />}>
			{sectionName === 'Live' ? <LiveTv /> : sectionName === 'Hidden' ? <VisibilityOff /> : <HistoryEdu />}

			<Typography component="span" sx={{ pl: 1, width: '33%', flexShrink: 0 }}>
				{sectionName}
			</Typography>

			<Typography component="span" sx={{ color: 'text.secondary' }}>
				{elections.length} election{elections.length > 1 ? 's' : undefined}
			</Typography>
		</AccordionSummary>

		<AccordionDetails sx={{ p: 0 }}>
			{elections.length === 0 && (
				<Alert severity="info">There are no {sectionName.toLowerCase()} elections at the moment</Alert>
			)}

			{elections.length > 0 && (
				<Stack spacing={2}>
					{elections.map((election) => (
						<ElectionsManagerCard key={election.id} election={election} onChooseElection={onChooseElection} />
					))}
				</Stack>
			)}
		</AccordionDetails>
	</Accordion>
);

function EntrypointLayer1() {
	const elections = useAppSelector((state) => selectAllElections(state));

	return <ElectionsManager elections={elections} />;
}

interface Props {
	elections: Election[];
}

function ElectionsManager(props: Props) {
	const { elections } = props;

	const navigate = useNavigate();

	const onClickAddElection = () => navigateToAddElection(navigate);

	const liveElections = elections.filter((e) => isElectionLive(e) === true && e.is_hidden === false);
	const hiddenElections = elections.filter((e) => e.is_hidden === true);
	const historicalElections = elections.filter((e) => isElectionLive(e) === false);

	const onChooseElection = useCallback((election: Election) => navigateToElection(navigate, election), [navigate]);

	// ######################
	// Set Primary Election
	// ######################
	const visibleElections = elections.filter((e) => e.is_hidden === false);
	const primaryElection = elections.find((e) => e.is_primary === true);

	const onChoosePrimaryElection = (election: Election) => setPrimaryElection(election.id);

	const [setPrimaryElection, { isLoading: isSetPrimaryElectionLoading, isSuccess: isSetPrimaryElectionSuccessful }] =
		useSetPrimaryElectionMutation();

	useEffect(() => {
		if (isSetPrimaryElectionSuccessful === true) {
			setIsSetPrimaryElectionSnackbarShown(true);
		}
	}, [isSetPrimaryElectionSuccessful]);

	const [isSetPrimaryElectionSnackbarShown, setIsSetPrimaryElectionSnackbarShown] = useState(false);
	const onSnackbarClose = useCallback(() => setIsSetPrimaryElectionSnackbarShown(false), []);
	// ######################
	// Set Primary Election (End)
	// ######################

	return (
		<PageWrapper>
			<SelectElection
				election={primaryElection}
				label="Choose primary election"
				formControlSx={{ mb: 3 }}
				elections={visibleElections}
				onChooseElection={onChoosePrimaryElection}
				isLoading={isSetPrimaryElectionLoading}
			/>

			<Button variant="contained" endIcon={<Add />} onClick={onClickAddElection}>
				Add Election
			</Button>

			{createElectionsAccordion('Live', liveElections, onChooseElection)}

			{createElectionsAccordion('Hidden', hiddenElections, onChooseElection)}

			{createElectionsAccordion('Historical', historicalElections, onChooseElection)}

			<Snackbar open={isSetPrimaryElectionSnackbarShown} autoHideDuration={6000} onClose={onSnackbarClose}>
				<Alert severity="success" variant="standard" sx={{ width: '100%' }}>
					Primary election updated
				</Alert>
			</Snackbar>
		</PageWrapper>
	);
}

export default EntrypointLayer1;
