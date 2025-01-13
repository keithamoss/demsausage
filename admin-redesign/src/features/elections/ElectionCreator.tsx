import { Add } from '@mui/icons-material';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToElections } from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { type NewElection, useAddElectionMutation } from '../../app/services/elections';
import ElectionForm from './ElectionForm';

function ElectionCreator() {
	const navigate = useNavigate();

	const [addElection, { isLoading: isAddingElectionLoading, isSuccess: isAddingElectionSuccessful }] =
		useAddElectionMutation();

	// See note in ElectionEditor about usage of useEffect
	useEffect(() => {
		if (isAddingElectionSuccessful === true) {
			navigateToElections(navigate);
		}
	}, [isAddingElectionSuccessful, navigate]);

	const onDoneAdding = useCallback(
		async (election: NewElection) => {
			addElection(election);
		},
		[addElection],
	);

	return (
		<ElectionForm
			isElectionSaving={isAddingElectionLoading}
			onDoneAdding={onDoneAdding}
			primaryFormButtonLabel="Create"
			primaryFormButtonIcon={<Add />}
		/>
	);
}

export default ElectionCreator;
