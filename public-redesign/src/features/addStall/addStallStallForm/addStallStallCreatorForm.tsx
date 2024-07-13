import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { useAppSelector } from '../../../app/hooks';
import { navigateToAddStallSubmitted } from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { useGetPollingPlaceByUniqueDetailsLookupQuery } from '../../../app/services/pollingPlaces';
import {
	StallOwnerModifiableProps,
	StallSubmitterType,
	StallTipOffModifiableProps,
	useAddStallMutation,
} from '../../../app/services/stalls';
import { WholeScreenLoadingIndicator } from '../../../app/ui/wholeScreenLoadingIndicator';
import { enumFromStringValue } from '../../../app/utils';
import { selectActiveElections } from '../../elections/electionsSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import AddStallFormForOwner from './addStallFormForOwner';
import AddStallFormForTipOff from './addStallFormForTipOff';

// The entrypoint handles determining the election that should be displayed based on route changes.
function EntrypointLayer1() {
	const params = useParams();

	const urlElectionName = getStringParamOrEmptyString(params, 'election_name');
	const activeElections = useAppSelector((state) => selectActiveElections(state));
	const election = activeElections.find((e) => e.name_url_safe === urlElectionName);

	const urlSubmitterType = enumFromStringValue(
		StallSubmitterType,
		getStringParamOrEmptyString(params, 'submitter_type'),
	);

	if (election === undefined) {
		return null;
	}

	if (params.polling_place_name === undefined || params.polling_place_state === undefined) {
		return null;
	}

	// Let our overall ErrorElement handle this
	if (urlSubmitterType === undefined) {
		throw new Error(
			`SubmitterType URL parameter of '${getStringParamOrEmptyString(params, 'submitter_type')}' is invalid`,
		);
	}

	return (
		<EntrypointLayer2
			election={election}
			name={params.polling_place_name}
			premises={params.polling_place_premises}
			state={params.polling_place_state}
			submitterType={urlSubmitterType}
		/>
	);
}

interface PropsEntrypointLayer2 {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
	submitterType: StallSubmitterType;
}

function EntrypointLayer2(props: PropsEntrypointLayer2) {
	const { election, name, premises, state, submitterType } = props;

	const {
		data: pollingPlace,
		error,
		isLoading,
		isSuccess,
	} = useGetPollingPlaceByUniqueDetailsLookupQuery({ electionId: election.id, name, premises, state });

	if (isLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (error !== undefined || isSuccess === false) {
		return <ErrorElement />;
	}

	return <AddStallStallCreatorForm election={election} pollingPlace={pollingPlace} submitterType={submitterType} />;
}

interface Props {
	election: Election;
	pollingPlace: IPollingPlace;
	submitterType: StallSubmitterType;
}

function AddStallStallCreatorForm(props: Props) {
	const { election, pollingPlace, submitterType } = props;

	const navigate = useNavigate();

	const [addStall, { isLoading: isAddingStallLoading, isSuccess: isAddingStallSuccessful }] = useAddStallMutation();

	useEffect(() => {
		if (isAddingStallSuccessful === true) {
			navigateToAddStallSubmitted(navigate);
		}
	}, [isAddingStallSuccessful, navigate]);

	const onDoneAdding = useCallback(
		(stall: StallTipOffModifiableProps | StallOwnerModifiableProps) => {
			addStall({
				...stall,
				election: election.id,
				polling_place: pollingPlace.id,
				submitter_type: submitterType,
			});
		},
		[addStall, election.id, pollingPlace.id, submitterType],
	);

	if (submitterType === StallSubmitterType.Owner) {
		return <AddStallFormForOwner isStallSaving={isAddingStallLoading} onDoneAdding={onDoneAdding} />;
	} else if (submitterType === StallSubmitterType.TipOff) {
		return <AddStallFormForTipOff isStallSaving={isAddingStallLoading} onDoneAdding={onDoneAdding} />;
	}

	return null;
}

export default EntrypointLayer1;
