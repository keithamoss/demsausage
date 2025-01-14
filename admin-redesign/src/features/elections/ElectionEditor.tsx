import { Save } from '@mui/icons-material';
import { styled } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToElectionControls,
	navigateToElectionStats,
	navigateToElections,
} from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { type Election, type ElectionModifiableProps, useUpdateElectionMutation } from '../../app/services/elections';
import ElectionForm from './ElectionForm';
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

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		navigateToElections(navigate);
	}, [navigate]);

	const onClickGoToControls = useCallback(() => {
		navigateToElectionControls(navigate, election);
	}, [navigate, election]);

	const onClickGoToStats = useCallback(() => {
		navigateToElectionStats(navigate, election);
	}, [navigate, election]);

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		if (newValue === 1) {
			onClickGoToControls();
		} else if (newValue === 2) {
			onClickGoToStats();
		}
	};
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			{getElectionEditorNavTabs('Form', onClickBack, onTabChange)}

			<ContentWrapper>
				<ElectionForm
					election={election}
					isElectionSaving={isUpdatingElectionLoading}
					onDoneEditing={onDoneEditing}
					primaryFormButtonLabel="Save"
					primaryFormButtonIcon={<Save />}
				/>
			</ContentWrapper>
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
