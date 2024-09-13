import { Alert, AlertTitle } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { navigateToEditStallSubmitted } from '../../../app/routing/navigationHelpers/navigationHelpersEditStall';
import {
	Stall,
	StallSubmitterType,
	useGetStallQuery,
	useUpdateStallWithCredentialsMutation,
} from '../../../app/services/stalls';
import { WholeScreenLoadingIndicator } from '../../../app/ui/wholeScreenLoadingIndicator';
import StallOwnerForm from '../../stalls/stallOwnerForm';
import StallTipOffForm from '../../stalls/stallTipOffForm';

function EntrypointLayer1() {
	const parsed = new URL(window.location.href);
	const stallId = parseInt(parsed.searchParams.get('stall_id') || '');
	const token = parsed.searchParams.get('token');
	const signature = parsed.searchParams.get('signature');

	const {
		data: stall,
		isLoading: isGetStallLoading,
		isSuccess: isGetStallSuccessful,
		isError: isGetStallErrored,
		error,
	} = useGetStallQuery(
		Number.isNaN(stallId) == false && token !== null && signature !== null ? { stallId, token, signature } : skipToken,
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
		return <EditStallStallEditorForm stall={stall} token={token} signature={signature} />;
	}
}

interface Props {
	stall: Stall;
	token: string;
	signature: string;
	// election: Election;
}

function EditStallStallEditorForm(props: Props) {
	const { stall, token, signature } = props;

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
				<StallTipOffForm stall={stall} isStallSaving={isEditingStallLoading} onDoneEditing={onDoneEditing} />
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
