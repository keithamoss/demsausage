import { AssignmentLate, AssignmentReturn, AssignmentTurnedIn } from '@mui/icons-material';
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
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToMetaPollingPlaceNextTaskJobByName } from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import {
	useCloseTaskMutation,
	useCompleteTaskMutation,
	useDeferTaskMutation,
} from '../../../app/services/metaPollingPlaceTasks';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	onClickComplete: () => void;
	isCloseAllowed: boolean;
	isDeferAllowed: boolean;
	isCompleteAllowed: boolean;
}

function MetaPollingPlaceTaskActionBar(props: Props) {
	const { metaPollingPlaceTaskJob, onClickComplete, isCloseAllowed, isDeferAllowed, isCompleteAllowed } = props;

	const navigate = useNavigate();

	const notifications = useNotifications();

	const [isLoadingScreenShown, setIsLoadingScreenShown] = useState(false);

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

	const [closeTask, { isLoading: isCloseTaskLoading, isSuccess: isCloseTaskSuccessful }] = useCloseTaskMutation();

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

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name);
		}
	}, [isCloseTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name]);
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

	const [deferTask, { isLoading: isDeferTaskLoading, isSuccess: isDeferTaskSuccessful }] = useDeferTaskMutation();

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

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name);
		}
	}, [isDeferTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name]);
	// ######################
	// Defer Task (End)
	// ######################

	// ######################
	// Complete Task
	// ######################
	const [completeTask, { isLoading: isCompleteTaskLoading, isSuccess: isCompleteTaskSuccessful }] =
		useCompleteTaskMutation();

	const onComplete = () => {
		setIsLoadingScreenShown(true);

		onClickComplete();

		completeTask(metaPollingPlaceTaskJob.id);
	};

	useEffect(() => {
		if (isCompleteTaskSuccessful === true) {
			setIsLoadingScreenShown(false);

			notifications.show('Task completed', {
				severity: 'success',
				autoHideDuration: 3000,
			});

			navigateToMetaPollingPlaceNextTaskJobByName(navigate, metaPollingPlaceTaskJob.job_name);
		}
	}, [isCompleteTaskSuccessful, notifications.show, navigate, metaPollingPlaceTaskJob.job_name]);
	// ######################
	// Complete Task (End)
	// ######################

	return (
		<React.Fragment>
			<AppBar position="fixed" color="transparent" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
				<Toolbar sx={{ justifyContent: 'flex-end' }}>
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
