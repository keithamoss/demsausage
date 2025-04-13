import { Alert, AlertTitle, Button, LinearProgress, styled } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import {
	navigateToMetaPollingPlaceTaskJobTask,
	navigateToMetaPollingPlaceTasksRoot,
} from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import { getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery } from '../../../app/services/metaPollingPlaceTasks';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
	// A bit of extra padding bottom here to allow for the presence of <AppBar> pinned at the bottom of the screen
	paddingBottom: theme.spacing(10),
}));

function MetaPollingPlaceTaskNextTask() {
	const navigate = useNavigate();

	const urlJobName = getStringParamOrUndefined(useParams(), 'job_name');

	const {
		data: metaPollingPlaceTaskJob,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery(urlJobName !== undefined ? urlJobName : skipToken);

	useEffect(() => {
		if (isSuccess === true && urlJobName !== undefined) {
			navigateToMetaPollingPlaceTaskJobTask(navigate, urlJobName, metaPollingPlaceTaskJob.id);
		}
	}, [isSuccess, navigate, urlJobName, metaPollingPlaceTaskJob?.id]);

	if (isLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if ((isError === true && 'data' in error && error.status !== 404) || urlJobName === undefined) {
		return <ErrorElement />;
	}

	return (
		<PageWrapper>
			{/* All errors that reach here are 404s */}
			{error !== undefined && (
				<Alert severity="success">
					<AlertTitle>Task queue empty</AlertTitle>
					<p>
						There are no more tasks in the queue for the job <strong>{urlJobName}</strong>.
					</p>
					<p>You can return to the jobs list to view other jobs.</p>

					<Button
						variant="outlined"
						color="inherit"
						onClick={() => {
							navigateToMetaPollingPlaceTasksRoot(navigate);
						}}
					>
						View other jobs
					</Button>
				</Alert>
			)}
		</PageWrapper>
	);
}

export default MetaPollingPlaceTaskNextTask;
