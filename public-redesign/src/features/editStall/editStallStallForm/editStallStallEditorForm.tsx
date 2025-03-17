import { Alert, AlertTitle } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { useAppSelector } from '../../../app/hooks';
import { navigateToEditStallSubmitted } from '../../../app/routing/navigationHelpers/navigationHelpersEditStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import type { Election } from '../../../app/services/elections';
import {
	type Stall,
	StallSubmitterType,
	useGetStallQuery,
	useUpdateStallWithCredentialsMutation,
} from '../../../app/services/stalls';
import { WholeScreenLoadingIndicator } from '../../../app/ui/wholeScreenLoadingIndicator';
import { selectActiveElections } from '../../elections/electionsSlice';
import StallOwnerForm from '../../stalls/stallOwnerForm';
import StallTipOffForm from '../../stalls/stallTipOffForm';

function EntrypointLayer1() {
	const parsed = new URL(window.location.href);
	const stallId = Number.parseInt(parsed.searchParams.get('stall_id') || '');
	const token = parsed.searchParams.get('token');
	const signature = parsed.searchParams.get('signature');

	const {
		data: stall,
		isLoading: isGetStallLoading,
		isSuccess: isGetStallSuccessful,
		isError: isGetStallErrored,
		error,
	} = useGetStallQuery(
		Number.isNaN(stallId) === false && token !== null && signature !== null ? { stallId, token, signature } : skipToken,
	);

	if (isGetStallLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	// 418 (I'm A Teapot) is the "This election is no longer active" error code - handle this with something that's a little more friendly than <ErrorElement />
	if (isGetStallErrored === true && error !== undefined && 'data' in error && error.status === 418) {
		return (
			<Alert severity="error">
				<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
				This election is already over, so it&apos;s no longer posssible to edit this stall.
			</Alert>
		);
	}

	if (isGetStallErrored === true || (isGetStallSuccessful === true && stall === undefined)) {
		return <ErrorElement />;
	}

	if (stall !== undefined && token !== null && signature !== null) {
		return <EntrypointLayer2 stall={stall} token={token} signature={signature} />;
	}
}

interface EntrypointLayer2Props {
	stall: Stall;
	token: string;
	signature: string;
}

function EntrypointLayer2(props: EntrypointLayer2Props) {
	const { stall, token, signature } = props;

	const params = useParams();

	const urlElectionName = getStringParamOrEmptyString(params, 'election_name');
	const activeElections = useAppSelector((state) => selectActiveElections(state));
	const election = activeElections.find((e) => e.name_url_safe === urlElectionName);

	if (election === undefined) {
		return null;
	}

	return <EditStallStallEditorForm election={election} stall={stall} token={token} signature={signature} />;
}

interface Props {
	election: Election;
	stall: Stall;
	token: string;
	signature: string;
}

function EditStallStallEditorForm(props: Props) {
	const { election, stall, token, signature } = props;

	const params = useParams();
	const navigate = useNavigate();

	const [
		editStall,
		{ isLoading: isEditingStallLoading, isSuccess: isEditingStallSuccessful, isError: isEditingStallErrored },
	] = useUpdateStallWithCredentialsMutation();

	useEffect(() => {
		if (isEditingStallSuccessful === true) {
			navigateToEditStallSubmitted(params, navigate);
		}
	}, [isEditingStallSuccessful, navigate, params]);

	const onDoneEditing = useCallback(
		(stall: Stall) => {
			editStall({ ...stall, token, signature });
		},
		[editStall, signature, token],
	);

	return (
		<React.Fragment>
			{isEditingStallErrored === true && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to submit your stall changes.
				</Alert>
			)}

			{stall.submitter_type === StallSubmitterType.Owner && (
				<StallOwnerForm stall={stall} isStallSaving={isEditingStallLoading} onDoneEditing={onDoneEditing} />
			)}

			{stall.submitter_type === StallSubmitterType.TipOff && (
				<StallTipOffForm
					election={election}
					stall={stall}
					isStallSaving={isEditingStallLoading}
					onDoneEditing={onDoneEditing}
				/>
			)}

			{(stall.submitter_type === StallSubmitterType.TipOffRunOut ||
				stall.submitter_type === StallSubmitterType.TipOffRedCrossOfShame) && (
				<Alert severity="warning">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Tip offs for a stall that&apos;ve run out of food, or polling places without stalls, can&apos;t be edited.
				</Alert>
			)}
		</React.Fragment>
	);
}

export default EntrypointLayer1;
