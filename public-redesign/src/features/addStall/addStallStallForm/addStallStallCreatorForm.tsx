import { Alert, AlertTitle } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { useAppSelector } from '../../../app/hooks';
import {
	navigateToAddStallSubmitted,
	navigateToAddStallSubmitterTypeFromURLParams,
} from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import type { Election } from '../../../app/services/elections';
import { useGetPollingPlaceByUniqueDetailsLookupQuery } from '../../../app/services/pollingPlaces';
import {
	type IStallLocationInfo,
	type StallOwnerModifiableProps,
	StallSubmitterType,
	type StallTipOffModifiableProps,
	type StallTipOffRedCrossOfShameModifiableProps,
	type StallTipOffRunOutModifiableProps,
	useAddStallMutation,
} from '../../../app/services/stalls';
import { WholeScreenLoadingIndicator } from '../../../app/ui/wholeScreenLoadingIndicator';
import { enumFromStringValue } from '../../../app/utils';
import { selectActiveElections } from '../../elections/electionsSlice';
import type { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import StallOwnerForm from '../../stalls/stallOwnerForm';
import StallTipOffForm from '../../stalls/stallTipOffForm';
import StallTipOffFormRunOut from '../../stalls/stallTipOffFormRunOut';
import StallTipOffFormRedCrossOfShame from '../../stalls/stallTipOffRedCrossOfShameForm';
import { createStallLocationInfoObjectFromLocationLookup } from './addStallFormHelpers';

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

	// Let our overall ErrorElement handle this
	if (urlSubmitterType === undefined) {
		throw new Error(
			`SubmitterType URL parameter of '${getStringParamOrEmptyString(params, 'submitter_type')}' is invalid`,
		);
	}

	if (params.polling_place_name !== undefined && params.polling_place_state !== undefined) {
		return (
			<EntrypointLayer2FromPollingPlace
				election={election}
				name={params.polling_place_name}
				premises={params.polling_place_premises}
				state={params.polling_place_state}
				submitterType={urlSubmitterType}
			/>
		);
	} else if (
		params.location_name !== undefined &&
		params.location_address !== undefined &&
		params.location_state !== undefined &&
		params.location_lon_lat !== undefined
	) {
		return (
			<AddStallStallCreatorForm
				election={election}
				stallLocationInfo={createStallLocationInfoObjectFromLocationLookup(
					params.location_name,
					params.location_address,
					params.location_state,
					params.location_lon_lat,
				)}
				submitterType={urlSubmitterType}
			/>
		);
	}
}

interface PropsEntrypointLayer2FromPollingPlace {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
	submitterType: StallSubmitterType;
}

function EntrypointLayer2FromPollingPlace(props: PropsEntrypointLayer2FromPollingPlace) {
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

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

interface Props {
	election: Election;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	stallLocationInfo?: IStallLocationInfo; // Only defined if election.polling_places_loaded === false
	submitterType: StallSubmitterType;
}

function AddStallStallCreatorForm(props: Props) {
	const { election, pollingPlace, stallLocationInfo, submitterType } = props;

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const cameFromInternalNavigation = (location.state as LocationState)?.cameFromInternalNavigation === true;

	const onClickBack = useCallback(() => {
		// If we've arrived here from elsewhere in the add stall interface,
		// we know we can just go back and we'll remain within it.
		// In most cases, this should send them back to the submission
		// type choice screen.
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back manually.
			navigateToAddStallSubmitterTypeFromURLParams(params, navigate);
		}
	}, [cameFromInternalNavigation, navigate, params]);

	const [
		addStall,
		{ isLoading: isAddingStallLoading, isSuccess: isAddingStallSuccessful, isError: isAddingStallErrored },
	] = useAddStallMutation();

	useEffect(() => {
		if (isAddingStallSuccessful === true) {
			navigateToAddStallSubmitted(params, navigate);
		}
	}, [isAddingStallSuccessful, navigate, params]);

	const onDoneAdding = useCallback(
		(
			stall:
				| StallTipOffModifiableProps
				| StallOwnerModifiableProps
				| StallTipOffRunOutModifiableProps
				| StallTipOffRedCrossOfShameModifiableProps,
		) => {
			addStall({
				...stall,
				election: election.id,
				polling_place:
					election.polling_places_loaded === true && pollingPlace !== undefined ? pollingPlace.id : undefined,
				location_info: election.polling_places_loaded === true ? undefined : stallLocationInfo,
				submitter_type: submitterType,
			});
		},
		[addStall, election.id, election.polling_places_loaded, pollingPlace, stallLocationInfo, submitterType],
	);

	return (
		<React.Fragment>
			{isAddingStallErrored === true && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to submit your stall.
				</Alert>
			)}

			{submitterType === StallSubmitterType.Owner && (
				<StallOwnerForm
					pollingPlace={pollingPlace}
					stallLocationInfo={stallLocationInfo}
					isStallSaving={isAddingStallLoading}
					onDoneAdding={onDoneAdding}
					onClickBack={onClickBack}
				/>
			)}

			{submitterType === StallSubmitterType.TipOff && (
				<StallTipOffForm
					pollingPlace={pollingPlace}
					stallLocationInfo={stallLocationInfo}
					isStallSaving={isAddingStallLoading}
					onDoneAdding={onDoneAdding}
					onClickBack={onClickBack}
				/>
			)}

			{submitterType === StallSubmitterType.TipOffRunOut && (
				<StallTipOffFormRunOut
					pollingPlace={pollingPlace}
					stallLocationInfo={stallLocationInfo}
					isStallSaving={isAddingStallLoading}
					onDoneAdding={onDoneAdding}
					onClickBack={onClickBack}
				/>
			)}

			{submitterType === StallSubmitterType.TipOffRedCrossOfShame && (
				<StallTipOffFormRedCrossOfShame
					pollingPlace={pollingPlace}
					stallLocationInfo={stallLocationInfo}
					isStallSaving={isAddingStallLoading}
					onDoneAdding={onDoneAdding}
					onClickBack={onClickBack}
				/>
			)}
		</React.Fragment>
	);
}

export default EntrypointLayer1;
