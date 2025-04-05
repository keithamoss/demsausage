import { Close, QueryStats, Save, Schedule, Tune } from '@mui/icons-material';
import { Button, Paper, styled } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import { navigateToElections } from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { type Election, type ElectionModifiableProps, useUpdateElectionMutation } from '../../app/services/elections';
import ElectionControls from './ElectionControls';
import ElectionForm from './ElectionForm';
import ElectionPendingStallsLatestChangesList from './ElectionPendingStallsLatestChangesList';
import ElectionStats from './ElectionStats';
import { selectAllElections } from './electionsSlice';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

const ContentWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
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

	return <ElectionEditor election={election} />;
}

interface Props {
	election: Election;
}

function ElectionEditor(props: Props) {
	const { election } = props;

	const navigate = useNavigate();

	const [updateElection, { isLoading: isUpdatingElectionLoading, isSuccess: isUpdatingElectionSuccessful }] =
		useUpdateElectionMutation();

	// We need to use the useEffect approach, rather than the
	// naked if approach (below) because otherwise this will
	// call onDone(), which causes ElectionsManager to start to re-render
	// at the same time, which causes React to complain about
	// updating a component while another is being rendered.
	useEffect(() => {
		if (isUpdatingElectionSuccessful === true) {
			navigateToElections(navigate);
		}
	}, [isUpdatingElectionSuccessful, navigate]);

	const onDoneEditing = useCallback(
		(id: number, election: ElectionModifiableProps) => {
			updateElection({ id, election });
		},
		[updateElection],
	);

	const onClickClose = () => navigateToElections(navigate);

	// ######################
	// Dialog Management
	// ######################
	const [isControlsDialogOpen, setIsControlsDialogOpen] = useState(false);
	const onOpenControlsDialog = useCallback(() => setIsControlsDialogOpen(true), []);
	const onCloseControlsDialog = useCallback(() => setIsControlsDialogOpen(false), []);

	const [isLatestChangesDialogOpen, setIsLatestChangesDialogOpen] = useState(false);
	const onOpenLatestChangesDialog = useCallback(() => setIsLatestChangesDialogOpen(true), []);
	const onCloseLatestChangesDialog = useCallback(() => setIsLatestChangesDialogOpen(false), []);

	const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
	const onOpenStatsDialog = useCallback(() => setIsStatsDialogOpen(true), []);
	const onCloseStatsDialog = useCallback(() => setIsStatsDialogOpen(false), []);
	// ######################
	// Dialog Management (End)
	// ######################

	return (
		<PageWrapper>
			<Button startIcon={<Close />} onClick={onClickClose}>
				Close
			</Button>

			<Button startIcon={<Tune />} onClick={onOpenControlsDialog}>
				Controls
			</Button>

			<Button startIcon={<Schedule />} onClick={onOpenLatestChangesDialog}>
				Latest Changes
			</Button>

			<Button startIcon={<QueryStats />} onClick={onOpenStatsDialog}>
				Stats
			</Button>

			<Paper variant="outlined" sx={{ mt: 1, p: 2 }}>
				<ElectionForm
					election={election}
					isElectionSaving={isUpdatingElectionLoading}
					onDoneEditing={onDoneEditing}
					primaryFormButtonLabel="Save"
					primaryFormButtonIcon={<Save />}
				/>
			</Paper>

			{isControlsDialogOpen === true && <ElectionControls election={election} onClose={onCloseControlsDialog} />}

			{isLatestChangesDialogOpen === true && (
				<ElectionPendingStallsLatestChangesList election={election} onClose={onCloseLatestChangesDialog} />
			)}

			{isStatsDialogOpen === true && <ElectionStats election={election} onClose={onCloseStatsDialog} />}
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
