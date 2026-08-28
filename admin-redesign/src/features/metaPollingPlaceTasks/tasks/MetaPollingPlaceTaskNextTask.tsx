import { Alert, AlertTitle, Button, LinearProgress, styled } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

	const [searchParams] = useSearchParams();
	const latParam = searchParams.get('lat');
	const lonParam = searchParams.get('lon');
	const lat = latParam !== null ? Number(latParam) : undefined;
	const lon = lonParam !== null ? Number(lonParam) : undefined;

	const queryArg =
		urlJobName !== undefined
			? { job_name: urlJobName, ...(lat !== undefined && lon !== undefined ? { lat, lon } : {}) }
			: skipToken;

	const {
		data: metaPollingPlaceTaskJob,
		isLoading,
		isFetching,
		isSuccess,
		isError,
	} = useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery(queryArg, {
		// Always fetch a fresh "next" task instead of immediately reusing cache.
		refetchOnMountOrArgChange: true,
	});

	useEffect(() => {
		if (isSuccess === true && isFetching === false && metaPollingPlaceTaskJob !== null && urlJobName !== undefined) {
			navigateToMetaPollingPlaceTaskJobTask(navigate, urlJobName, metaPollingPlaceTaskJob.id, true);
		}
	}, [isSuccess, isFetching, navigate, metaPollingPlaceTaskJob, urlJobName]);

	if (isLoading === true || isFetching === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isError === true || urlJobName === undefined) {
		return <ErrorElement />;
	}

	return (
		<PageWrapper>
			{metaPollingPlaceTaskJob === null && (
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
