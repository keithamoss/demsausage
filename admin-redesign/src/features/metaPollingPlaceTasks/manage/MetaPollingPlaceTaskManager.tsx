import { AddTask } from '@mui/icons-material';
import {
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	type SelectChangeEvent,
	TextField,
	styled,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { type ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToMetaPollingPlaceTasksRoot } from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import { useCreateJobMutation } from '../../../app/services/metaPollingPlaceTasks';
import { PollingPlaceState } from '../../pollingPlaces/pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
	// A bit of extra padding bottom here to allow for the presence of <AppBar> pinned at the bottom of the screen
	paddingBottom: theme.spacing(10),
}));

function MetaPollingPlaceTaskManager() {
	// @TODO Use RHF

	const navigate = useNavigate();
	const notifications = useNotifications();

	const [electionId, setElectionId] = useState<string | undefined>('58');
	const onElectionIdChange = (e: ChangeEvent<HTMLInputElement>) => setElectionId(e.target.value);

	const [taskCount, setTaskCount] = useState<string | undefined>('5');
	const onTaskCountChange = (e: ChangeEvent<HTMLInputElement>) => setTaskCount(e.target.value);

	const [deferredTasksIncluded, setDeferredTasksIncluded] = useState(false);
	const onIncludeDeferredTasksChange = (e: ChangeEvent<HTMLInputElement>) => setDeferredTasksIncluded(e.target.checked);

	const [jurisdiction, setJurisdiction] = useState<string>('');
	const onJurisdictionChange = (e: SelectChangeEvent<string>) => setJurisdiction(e.target.value);

	const [
		createJob,
		{
			data: createJobResponse,
			isLoading: isCreateJobLoading,
			isSuccess: isCreateJobSuccessful,
			isError: isCreateJobErrored,
			error,
		},
	] = useCreateJobMutation();

	const onClickAddTasks = () => {
		if (
			electionId !== undefined &&
			Number.isNaN(electionId) === false &&
			taskCount !== undefined &&
			Number.isNaN(taskCount) === false
		) {
			createJob({
				electionId: Number.parseInt(electionId),
				taskCount: Number.parseInt(taskCount),
				deferredTasksIncluded,
				jurisdiction,
			});
		}
	};

	useEffect(() => {
		if (isCreateJobSuccessful === true) {
			notifications.show(`${createJobResponse.tasks_created} tasks created`, {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isCreateJobSuccessful, notifications.show, createJobResponse?.tasks_created]);

	useEffect(() => {
		if (isCreateJobErrored === true) {
			notifications.show(`Error creating task: ${error}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [isCreateJobErrored, notifications.show, error]);

	return (
		<PageWrapper>
			<Button
				variant="outlined"
				onClick={() => {
					navigateToMetaPollingPlaceTasksRoot(navigate);
				}}
				sx={{ mb: 4 }}
			>
				View jobs list
			</Button>

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<TextField type="number" helperText="Election Id" onChange={onElectionIdChange} defaultValue={58} />
			</FormControl>

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<TextField type="number" helperText="Number of tasks" onChange={onTaskCountChange} defaultValue={5} />
			</FormControl>

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<FormControlLabel
					control={<Checkbox defaultChecked={false} onChange={onIncludeDeferredTasksChange} />}
					label="Include deferred tasks"
				/>
			</FormControl>

			<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
				<InputLabel id="choose-a-jurisdiction">Limit to jurisdiction</InputLabel>

				<Select
					labelId="choose-a-jurisdiction"
					label="Choose jurisdiction"
					onChange={onJurisdictionChange}
					defaultValue=""
				>
					{Object.entries(PollingPlaceState).map(([, jurisdiction]) => (
						<MenuItem key={jurisdiction} value={jurisdiction}>
							{jurisdiction}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<Button
				loading={isCreateJobLoading === true}
				loadingPosition="end"
				endIcon={<AddTask />}
				variant="outlined"
				onClick={onClickAddTasks}
			>
				Create Tasks
			</Button>
		</PageWrapper>
	);
}

export default MetaPollingPlaceTaskManager;
