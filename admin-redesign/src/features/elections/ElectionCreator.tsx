import { Add } from '@mui/icons-material';
import { styled } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToElections } from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { type NewElection, useAddElectionMutation } from '../../app/services/elections';
import ElectionForm from './ElectionForm';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

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
		<PageWrapper>
			<ElectionForm
				isElectionSaving={isAddingElectionLoading}
				onDoneAdding={onDoneAdding}
				primaryFormButtonLabel="Create"
				primaryFormButtonIcon={<Add />}
			/>
		</PageWrapper>
	);
}

export default ElectionCreator;
