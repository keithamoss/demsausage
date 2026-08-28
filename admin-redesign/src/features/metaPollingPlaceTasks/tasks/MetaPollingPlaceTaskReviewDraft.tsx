import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useNotifications } from '@toolpad/core';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnsavedChangesBlocker } from '../../../app/hooks/useUnsavedChangesBlocker';
import { navigateToMetaPollingPlaceNextTaskJobByName } from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import type { Election } from '../../../app/services/elections';
import { useCompleteTaskMutation } from '../../../app/services/metaPollingPlaceTasks';
import { useRearrangePollingPlacesMutation } from '../../../app/services/metaPollingPlaces';
import MetaPollingPlaceCoreFieldsEditCard from '../common/MetaPollingPlaceCoreFieldsEditCard';
import MetaPollingPlaceHistorySummaryCard from '../common/MetaPollingPlaceHistorySummaryCard';
import MetaPollingPlaceLinksManager from '../common/MetaPollingPlaceLinksManager';
import MetaPollingPlacePollingPlacesReviewList from '../common/MetaPollingPlacePollingPlacesReviewList';
import MetaPollingPlaceRemarks from '../common/MetaPollingPlaceRemarks';
import MetaPollingPlaceSummaryCard from '../common/MetaPollingPlaceSummaryCard';
import MetaPollingPlaceTaskActionBar from '../common/MetaPollingPlaceTaskActionBar';
import MetaPollingPlaceTaskHistory from '../common/MetaPollingPlaceTaskHistory';
import type { IPollingPlaceAttachedToMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	activeElection?: Election;
	pollingPlaceForActiveElection?: IPollingPlaceAttachedToMetaPollingPlace;
}

export default function MetaPollingPlaceTaskReviewDraft(props: Props) {
	const { metaPollingPlaceTaskJob, activeElection, pollingPlaceForActiveElection } = props;

	const navigate = useNavigate();
	const notifications = useNotifications();

	// ######################
	// Split job name — stable across the component lifetime (FR-7 / B3)
	// All splits triggered during this review session share the same job name
	// in the task browser.
	// ######################
	const [splitJobName] = useState(() => `MPP Split - ${dayjs().format('D MMMM YYYY HH:mm:ss')}`);

	// Stable primitives for proximity-ordered next task navigation (no risk
	// of identity change inside useCallback/useEffect deps).
	const [mppLon, mppLat] = metaPollingPlaceTaskJob.meta_polling_place.geom_location.coordinates;
	// ######################
	// Split job name (End)
	// ######################

	// ######################
	// Form dirty state — gates the Complete / Quick Accept buttons
	// ######################
	const [isDirty, setIsDirty] = useState(false);

	const onIsDirtyChange = useCallback((dirty: boolean) => {
		setIsDirty(dirty);
	}, []);
	// ######################
	// Form dirty state (End)
	// ######################

	// FR-11: Guard unsaved navigation
	useUnsavedChangesBlocker(isDirty);

	// ######################
	// PP review list completion state
	// ######################
	const [isReviewListTaskCompleted, setIsReviewListTaskCompleted] = useState(false);

	const onReviewListActionCompleted = useCallback(() => setIsReviewListTaskCompleted(true), []);
	// ######################
	// PP review list (End)
	// ######################

	// ######################
	// Complete task mutation
	// ######################
	const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();
	const [isConcurrentSessionDialogOpen, setIsConcurrentSessionDialogOpen] = useState(false);

	const doComplete = useCallback(async () => {
		try {
			await completeTask(metaPollingPlaceTaskJob.id).unwrap();
			notifications.show('Task completed — polling place is now Active', {
				severity: 'success',
				autoHideDuration: 3000,
			});
			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
				lat: mppLat,
				lon: mppLon,
			});
		} catch (err: unknown) {
			const errBody = JSON.stringify(err);
			if (errBody.includes("isn't in progress")) {
				setIsConcurrentSessionDialogOpen(true);
			} else {
				notifications.show(`Error completing task: ${errBody}`, {
					severity: 'error',
					autoHideDuration: 6000,
				});
			}
		}
	}, [
		completeTask,
		metaPollingPlaceTaskJob.id,
		metaPollingPlaceTaskJob.job_name,
		mppLat,
		mppLon,
		navigate,
		notifications.show,
	]);

	const onCloseConcurrentSessionDialog = useCallback(() => {
		setIsConcurrentSessionDialogOpen(false);
	}, []);

	const onGoToNextTaskFromConcurrentSessionDialog = useCallback(() => {
		setIsConcurrentSessionDialogOpen(false);
		navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
			lat: mppLat,
			lon: mppLon,
		});
	}, [metaPollingPlaceTaskJob.job_name, mppLat, mppLon, navigate]);
	// ######################
	// Complete task (End)
	// ######################

	// ######################
	// Completion confirmation dialog (FR-4)
	// ######################
	const [isCompleteConfirmDialogOpen, setIsCompleteConfirmDialogOpen] = useState(false);

	const onClickOpenCompleteDialog = useCallback(() => {
		setIsCompleteConfirmDialogOpen(true);
	}, []);

	const onCancelCompleteDialog = useCallback(() => {
		setIsCompleteConfirmDialogOpen(false);
	}, []);

	const onConfirmComplete = useCallback(async () => {
		setIsCompleteConfirmDialogOpen(false);
		await doComplete();
	}, [doComplete]);
	// ######################
	// Completion confirmation dialog (End)
	// ######################

	// ######################
	// Quick Accept (FR-12)
	// ######################
	const [isQuickAcceptConfirmDialogOpen, setIsQuickAcceptConfirmDialogOpen] = useState(false);

	const [rearrangePollingPlaces, { isLoading: isRearranging }] = useRearrangePollingPlacesMutation();

	const onClickQuickAccept = useCallback(() => {
		setIsQuickAcceptConfirmDialogOpen(true);
	}, []);

	const onCancelQuickAcceptDialog = useCallback(() => {
		setIsQuickAcceptConfirmDialogOpen(false);
	}, []);

	const onConfirmQuickAccept = useCallback(async () => {
		setIsQuickAcceptConfirmDialogOpen(false);
		try {
			// Empty rearrangement — no moves, no splits. Equivalent to "Looks good!"
			// but in a single-step fast path.
			await rearrangePollingPlaces({
				moves: [],
				splits: [],
				splitJobName: splitJobName,
			}).unwrap();

			await doComplete();
		} catch (err) {
			notifications.show(`Quick Accept failed: ${JSON.stringify(err)}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [doComplete, notifications.show, rearrangePollingPlaces, splitJobName]);
	// ######################
	// Quick Accept (End)
	// ######################

	// isCompleteAllowed: no unsaved edits AND either the PP review was actioned
	// OR passed_review is already true (reviewed in a prior session).
	const isCompleteAllowed =
		isDirty === false &&
		(isReviewListTaskCompleted === true ||
			metaPollingPlaceTaskJob.meta_polling_place.task_outcomes.passed_review === true);

	const tasksRemaining = metaPollingPlaceTaskJob.tasks_remaining;

	return (
		<React.Fragment>
			{/* FR-1 */}
			<MetaPollingPlaceSummaryCard metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place} />

			{/* FR-13: tasks remaining indicator */}
			{tasksRemaining !== undefined && tasksRemaining > 0 && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
					{tasksRemaining} remaining in this job
				</Typography>
			)}

			{/* FR-1 */}
			<MetaPollingPlaceHistorySummaryCard
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				pollingPlaceForActiveElection={pollingPlaceForActiveElection}
				cardSxProps={{ mt: 2 }}
			/>

			{/* FR-2: Editable core fields */}
			<MetaPollingPlaceCoreFieldsEditCard
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				nearbyMetaPollingPlaces={metaPollingPlaceTaskJob.nearby_meta_polling_places}
				onIsDirtyChange={onIsDirtyChange}
				cardSxProps={{ mt: 2 }}
			/>

			{/* FR-3: PP review list */}
			<MetaPollingPlacePollingPlacesReviewList
				metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
				jobName={metaPollingPlaceTaskJob.job_name}
				onActionCompleted={onReviewListActionCompleted}
				splitJobName={splitJobName}
				onClickCompleteNow={onClickOpenCompleteDialog}
				cardSxProps={{ mt: 2 }}
			/>

			{/* FR-5 */}
			<MetaPollingPlaceLinksManager
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				cardSxProps={{ mt: 2 }}
			/>

			{/* FR-5 */}
			<MetaPollingPlaceRemarks metaPollingPlaceTaskJob={metaPollingPlaceTaskJob} cardSxProps={{ mt: 2 }} />

			{/* FR-5 */}
			<MetaPollingPlaceTaskHistory metaPollingPlaceTaskJob={metaPollingPlaceTaskJob} cardSxProps={{ mt: 2 }} />

			{/* FR-6: Task action bar. Complete is handled externally (FR-4 confirmation dialog). */}
			<MetaPollingPlaceTaskActionBar
				metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
				onClickComplete={onClickOpenCompleteDialog}
				completeIsHandledExternally={true}
				isCloseAllowed={isDirty === false}
				isDeferAllowed={isDirty === false}
				isCompleteAllowed={isCompleteAllowed}
				additionalActions={
					isDirty === false ? (
						<Button
							size="small"
							color="success"
							variant="outlined"
							onClick={onClickQuickAccept}
							disabled={isRearranging || isCompleting}
							sx={{ mr: 1 }}
						>
							Quick Accept
						</Button>
					) : undefined
				}
			/>

			{/* FR-4: Completion confirmation dialog */}
			<Dialog open={isCompleteConfirmDialogOpen} onClose={onCancelCompleteDialog}>
				<DialogTitle>Promote to Active?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						Completing this task will promote this polling place from <strong>Draft</strong> to <strong>Active</strong>.
						This cannot be undone here. Continue?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button size="small" onClick={onCancelCompleteDialog}>
						Cancel
					</Button>
					<Button size="small" onClick={onConfirmComplete} disabled={isCompleting}>
						<span>Confirm</span>
					</Button>
				</DialogActions>
			</Dialog>

			{/* FR-12: Quick Accept confirmation dialog */}
			<Dialog open={isQuickAcceptConfirmDialogOpen} onClose={onCancelQuickAcceptDialog}>
				<DialogTitle>Quick Accept?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						Accept this polling place with no changes and mark it as <strong>Active</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button size="small" onClick={onCancelQuickAcceptDialog}>
						Cancel
					</Button>
					<Button size="small" onClick={onConfirmQuickAccept} disabled={isRearranging || isCompleting}>
						<span>Accept</span>
					</Button>
				</DialogActions>
			</Dialog>

			{/* FR-14: explicit next-action prompt on concurrent session completion */}
			<Dialog open={isConcurrentSessionDialogOpen} onClose={onCloseConcurrentSessionDialog}>
				<DialogTitle>Task already completed</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						This task was already completed in another session. Move to the next task?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button size="small" onClick={onCloseConcurrentSessionDialog}>
						Stay here
					</Button>
					<Button size="small" onClick={onGoToNextTaskFromConcurrentSessionDialog}>
						Go to next task
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
