import { Save } from '@mui/icons-material';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import { navigateToElections } from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { type Election, type ElectionModifiableProps, useUpdateElectionMutation } from '../../app/services/elections';
import ElectionForm from './ElectionForm';
import { selectAllElections } from './electionsSlice';

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

	return (
		<ElectionForm
			election={election}
			isElectionSaving={isUpdatingElectionLoading}
			onDoneEditing={onDoneEditing}
			primaryFormButtonLabel="Save"
			primaryFormButtonIcon={<Save />}
		/>
	);
}

export default ElectionEditorEntrypoint;
