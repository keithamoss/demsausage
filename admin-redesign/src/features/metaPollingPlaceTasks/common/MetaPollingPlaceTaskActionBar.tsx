import { ArrowBack, AssignmentLate, AssignmentReturn, AssignmentTurnedIn } from '@mui/icons-material';
import {
	AppBar,
	Backdrop,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Toolbar,
	Typography,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	navigateToMetaPollingPlaceNextTaskJobByName,
	navigateToMetaPollingPlaceTasksRoot,
} from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import {
	useCloseTaskMutation,
	useCompleteTaskMutation,
	useDeferTaskMutation,
} from '../../../app/services/metaPollingPlaceTasks';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	onClickComplete?: () => void;
	isCloseAllowed: boolean;
	isDeferAllowed: boolean;
	isCompleteAllowed: boolean;
	/**
	 * When true, clicking "Complete" calls `onClickComplete` (e.g. to open a
	 * confirmation dialog) but does NOT internally call `completeTask`.  The
	 * caller is responsible for calling the complete mutation and navigating.
	 * Default: false (built-in complete behaviour).
	 */
	completeIsHandledExternally?: boolean;
	/** Optional extra buttons rendered before Close in the action toolbar. */
	additionalActions?: React.ReactNode;
}

function MetaPollingPlaceTaskActionBar(props: Props) {
	const {
		metaPollingPlaceTaskJob,
		onClickComplete,
		isCloseAllowed,
		isDeferAllowed,
		isCompleteAllowed,
		completeIsHandledExternally = false,
		additionalActions,
	} = props;

	const navigate = useNavigate();

	const notifications = useNotifications();

	const [isLoadingScreenShown, setIsLoadingScreenShown] = useState(false);

	// Extract the task MPP's coordinates so the next task endpoint can return a
	// geographically nearby task rather than a random one.
	const [mppLon, mppLat] = metaPollingPlaceTaskJob.meta_polling_place.geom_location.coordinates;

	const onBackToTaskList = useCallback(() => {
		navigateToMetaPollingPlaceTasksRoot(navigate);
	}, [navigate]);

	// ######################
	// Close Task
	// ######################
	const onClose = () => {
		setIsLoadingScreenShown(true);

		setIsCloseAddRemarksDialogOpen(true);
	};

	const [isCloseAddRemarksDialogOpen, setIsCloseAddRemarksDialogOpen] = React.useState(false);

	const closeAddRemarksInputFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const onCancelCloseAddRemarksDialog = useCallback(() => {
		setIsCloseAddRemarksDialogOpen(false);
		setIsLoadingScreenShown(false);
	}, []);

	const [
		closeTask,
		{
			isLoading: isCloseTaskLoading,
			isSuccess: isCloseTaskSuccessful,
			isError: isCloseTaskErrored,
			error: closeTaskError,
		},
	] = useCloseTaskMutation();

	const onConfirmCloseAddRemarksDialog = () => {
		closeTask({ id: metaPollingPlaceTaskJob.id, remarks: closeAddRemarksInputFieldRef.current?.value || '' });
	};

	useEffect(() => {
		if (isCloseTaskSuccessful === true) {
			setIsLoadingScreenShown(false);

			notifications.show('Task closed', {
				severity: 'success',
				autoHideDuration: 3000,
			});

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
				lat: mppLat,
				lon: mppLon,
			});
		}
	}, [isCloseTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name, mppLat, mppLon]);

	useEffect(() => {
		if (isCloseTaskErrored === true) {
			notifications.show(`Error closing task: ${JSON.stringify(closeTaskError)}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [isCloseTaskErrored, notifications.show, closeTaskError]);
	// ######################
	// Close Task (End)
	// ######################

	// ######################
	// Defer Task
	// ######################
	const onDefer = () => {
		setIsLoadingScreenShown(true);

		setIsDeferAddRemarksDialogOpen(true);
	};

	const [isDeferAddRemarksDialogOpen, setIsDeferAddRemarksDialogOpen] = React.useState(false);

	const deferAddRemarksInputFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const onCancelDeferAddRemarksDialog = useCallback(() => {
		setIsDeferAddRemarksDialogOpen(false);
		setIsLoadingScreenShown(false);
	}, []);

	const [
		deferTask,
		{
			isLoading: isDeferTaskLoading,
			isSuccess: isDeferTaskSuccessful,
			isError: isDeferTaskErrored,
			error: deferTaskError,
		},
	] = useDeferTaskMutation();

	const onConfirmDeferAddRemarksDialog = () => {
		deferTask({ id: metaPollingPlaceTaskJob.id, remarks: deferAddRemarksInputFieldRef.current?.value || '' });
	};

	useEffect(() => {
		if (isDeferTaskSuccessful === true) {
			setIsLoadingScreenShown(false);

			notifications.show('Task deferred', {
				severity: 'success',
				autoHideDuration: 3000,
			});

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
				lat: mppLat,
				lon: mppLon,
			});
		}
	}, [isDeferTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name, mppLat, mppLon]);

	useEffect(() => {
		if (isDeferTaskErrored === true) {
			notifications.show(`Error deferring task: ${JSON.stringify(deferTaskError)}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [isDeferTaskErrored, notifications.show, deferTaskError]);
	// ######################
	// Defer Task (End)
	// ######################

	// ######################
	// Complete Task
	// ######################
	const [
		completeTask,
		{
			isLoading: isCompleteTaskLoading,
			isSuccess: isCompleteTaskSuccessful,
			isError: isCompleteTaskErrored,
			error: completeTaskError,
		},
	] = useCompleteTaskMutation();

	const onComplete = () => {
		setIsLoadingScreenShown(true);

		if (onClickComplete !== undefined) {
			onClickComplete();
		}

		// When complete logic is handled externally (e.g. REVIEW_DRAFT confirmation
		// dialog), don't fire the internal completeTask mutation here.  The caller
		// is responsible for completing the task and navigating away.
		if (completeIsHandledExternally) {
			return;
		}

		completeTask(metaPollingPlaceTaskJob.id);
	};

	useEffect(() => {
		if (isCompleteTaskSuccessful === true) {
			setIsLoadingScreenShown(false);

			notifications.show('Task completed', {
				severity: 'success',
				autoHideDuration: 3000,
			});

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
				lat: mppLat,
				lon: mppLon,
			});
		}
	}, [isCompleteTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name, mppLat, mppLon]);

	useEffect(() => {
		if (isCompleteTaskErrored === true) {
			setIsLoadingScreenShown(false);

			// FR-14: Detect 'task already completed in another session' and give the
			// reviewer an actionable message rather than a generic one.
			const errorBody = JSON.stringify(completeTaskError);
			if (errorBody.includes("isn't in progress")) {
				notifications.show('This task was already completed in another session. Move to the next task.', {
					severity: 'warning',
					autoHideDuration: 8000,
				});
				navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name, {
					lat: mppLat,
					lon: mppLon,
				});
			} else {
				notifications.show(`Error completing task: ${JSON.stringify(completeTaskError)}`, {
					severity: 'error',
					autoHideDuration: 6000,
				});
			}
		}
	}, [
		isCompleteTaskErrored,
		notifications.show,
		completeTaskError,
		navigate,
		metaPollingPlaceTaskJob.job_name,
		mppLat,
		mppLon,
	]);
	// ######################
	// Complete Task (End)
	// ######################

	return (
		<React.Fragment>
			<AppBar
				position="fixed"
				color="transparent"
				sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}
				className="bottomAppBarPresent"
			>
				<Toolbar sx={{ justifyContent: 'flex-end' }}>
					<Button
						size="small"
						color="secondary"
						variant="outlined"
						sx={{ mr: 1 }}
						endIcon={<ArrowBack />}
						onClick={onBackToTaskList}
					>
						<span>Task list</span>
					</Button>
					{additionalActions}
					<Button
						// loading={isDeleting}
						loadingPosition="end"
						disabled={isCloseAllowed === false}
						size="small"
						color="primary"
						endIcon={<AssignmentLate />}
						onClick={onClose}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Close</span>
					</Button>

					<Button
						// loading={isDeleting}
						loadingPosition="end"
						disabled={isDeferAllowed === false}
						size="small"
						color="primary"
						endIcon={<AssignmentReturn />}
						onClick={onDefer}
						sx={{ ml: 1 }}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Defer</span>
					</Button>

					<Button
						// loading={isSaving}
						loadingPosition="end"
						disabled={isCompleteAllowed === false}
						size="small"
						color="primary"
						endIcon={<AssignmentTurnedIn />}
						onClick={onComplete}
						sx={{ ml: 1 }}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Complete</span>
					</Button>
				</Toolbar>
			</AppBar>

			<Backdrop open={isLoadingScreenShown} sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}>
				<CircularProgress color="inherit" />
			</Backdrop>

			<Dialog open={isCloseAddRemarksDialogOpen} onClose={onCancelCloseAddRemarksDialog}>
				<DialogTitle>Close Task</DialogTitle>

				<DialogContent>
					<Typography variant="body2" sx={{ mb: 1 }}>
						Tasks should only be closed when they're impossible to complete. e.g. When a polling place has no Facebook
						presence and you're doing a Facebook Research task.
					</Typography>

					<TextFieldWithout1Password
						inputRef={closeAddRemarksInputFieldRef}
						variant="standard"
						multiline
						sx={{ mt: 1, ml: 1, flex: 1 }}
						placeholder="Wise words"
						helperText={"Since you're closing this task, are there any remarks you'd like to make about why?"}
					/>
				</DialogContent>

				<DialogActions>
					<Button /*disabled={isAddLinkLoading === true}*/ size="small" onClick={onCancelCloseAddRemarksDialog}>
						Cancel
					</Button>

					<Button
						// loading={isAddLinkLoading}
						loadingPosition="end"
						// disabled={isDirty === false}
						size="small"
						onClick={onConfirmCloseAddRemarksDialog}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Done</span>
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={isDeferAddRemarksDialogOpen} onClose={onCancelDeferAddRemarksDialog}>
				<DialogTitle>Defer Task</DialogTitle>

				<DialogContent>
					<Typography variant="body2" sx={{ mb: 1 }}>
						Tasks should be deferred when you can't complete them now, but may be able to in the near future.
					</Typography>

					<TextFieldWithout1Password
						inputRef={deferAddRemarksInputFieldRef}
						variant="standard"
						multiline
						sx={{ mt: 1, ml: 1, flex: 1 }}
						placeholder="Wise words"
						helperText={
							"Since you're deferring this task, are there any remarks you'd like to leave for when this task reappears?"
						}
					/>
				</DialogContent>

				<DialogActions>
					<Button /*disabled={isAddLinkLoading === true}*/ size="small" onClick={onCancelDeferAddRemarksDialog}>
						Cancel
					</Button>

					<Button
						// loading={isAddLinkLoading}
						loadingPosition="end"
						// disabled={isDirty === false}
						size="small"
						onClick={onConfirmDeferAddRemarksDialog}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Done</span>
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}

export default MetaPollingPlaceTaskActionBar;
