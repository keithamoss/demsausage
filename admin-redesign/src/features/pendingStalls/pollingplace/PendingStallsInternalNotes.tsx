import { Save, SpeakerNotes } from '@mui/icons-material';
import { Avatar, Card, CardContent, CardHeader, Divider, IconButton, Paper, styled } from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { useCallback, useEffect, useRef } from 'react';
import { useUpdateInternalNotesMutation } from '../../../app/services/pollingPlaces';
import type { PollingPlaceWithPendingStall } from '../../../app/services/stalls';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	padding: theme.spacing(1),
	paddingBottom: `${theme.spacing(1)} !important`,
}));

interface Props {
	pollingPlace: PollingPlaceWithPendingStall;
}

export default function PendingStallsInternalNotes(props: Props) {
	const { pollingPlace } = props;

	const notifications = useNotifications();

	const inputFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	// ######################
	// Update Internal Notes
	// ######################
	const [
		updateInternalNotes,
		{
			isLoading: isUpdatingInternalNotesLoading,
			isSuccess: isUpdatingInternalNotesSuccessful,
			isError: isUpdatingInternalNotesErrored,
		},
	] = useUpdateInternalNotesMutation();

	useEffect(() => {
		if (isUpdatingInternalNotesSuccessful === true) {
			notifications.show('Internal notes updated', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isUpdatingInternalNotesSuccessful, notifications.show]);

	useEffect(() => {
		if (isUpdatingInternalNotesErrored === true) {
			notifications.show('Error whilst updating internal notes', {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [isUpdatingInternalNotesErrored, notifications.show]);

	const onSave = useCallback(() => {
		if (inputFieldRef.current !== null) {
			updateInternalNotes({
				pollingPlaceId: pollingPlace.id,
				internal_notes: inputFieldRef.current.value,
			});
		}
	}, [updateInternalNotes, pollingPlace.id]);
	// ######################
	// Update Internal Notes (End)
	// ######################

	return (
		<Card variant="outlined" sx={{ mt: 2 }}>
			<CardHeader
				sx={{
					p: 1,
					pb: 0,
					'& .MuiCardHeader-title': {
						fontSize: 18,
						fontWeight: 700,
					},
				}}
				avatar={
					<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} variant="rounded">
						<SpeakerNotes />
					</Avatar>
				}
				title="Internal Notes"
			/>

			<StyledCardContent>
				<Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'start' }} elevation={0}>
					<TextFieldWithout1Password
						inputRef={inputFieldRef}
						defaultValue={pollingPlace.stall?.internal_notes}
						variant="standard"
						multiline
						sx={{ mt: 1, ml: 1, flex: 1 }}
						placeholder="Write any important notes here"
						helperText={`e.g. "Don't approve this yet, we're waiting until we get a second report."`}
					/>

					<Divider sx={{ height: 28, m: 0.5, display: 'none' }} orientation="vertical" />

					<IconButton color="primary" sx={{ p: '10px' }} onClick={onSave} loading={isUpdatingInternalNotesLoading}>
						<Save />
					</IconButton>
				</Paper>
			</StyledCardContent>
		</Card>
	);
}
