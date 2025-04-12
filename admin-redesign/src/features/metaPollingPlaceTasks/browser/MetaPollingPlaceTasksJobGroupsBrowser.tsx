import { FolderOpen } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardHeader, LinearProgress, Stack, styled } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { navigateToMetaPollingPlaceNextTaskJobByName } from '../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks';
import { useGetMetaPollingPlaceTaskJobGroupsQuery } from '../../../app/services/metaPollingPlaceTasks';
import { getMetaPollingPlaceTaskCategoryIcon } from '../helpers/metaPollingPlaceTasksHelpers';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

function MetaPollingPlaceTasksJobGroupsBrowser() {
	const navigate = useNavigate();

	const {
		data: metaPollingPlaceTasksJobGroups,
		isLoading,
		isSuccess,
		isError,
	} = useGetMetaPollingPlaceTaskJobGroupsQuery();

	if (isLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isError === true || isSuccess === false) {
		return <ErrorElement />;
	}

	const onOpenTaskJobGroup = (jobName: string) => () => navigateToMetaPollingPlaceNextTaskJobByName(navigate, jobName);

	return (
		<PageWrapper>
			{/* <Typography variant="body1" sx={{ mb: 1 }}>
				Our quality assurance report for recent elections to identify any "impossibilities" that might be creeping into
				the system.
			</Typography> */}

			<Stack direction="column" spacing={2} sx={{ mt: 2 }}>
				{metaPollingPlaceTasksJobGroups.map((item) => (
					<Card key={item.job_name} sx={{ maxWidth: 345 }}>
						<CardHeader
							avatar={getMetaPollingPlaceTaskCategoryIcon(item.category)}
							title={item.job_name}
							subheader={`${dayjs(item.max_created_on).format('D MMMM YYYY')} at ${dayjs(item.max_created_on).format('HH:mm')}`}
						/>

						<CardContent sx={{ pt: 0.5, pb: 0.5, fontSize: 14 }}>
							<strong>{item.task_count.toLocaleString()}</strong> {item.type} tasks
						</CardContent>

						<CardActions disableSpacing>
							<Button variant="outlined" startIcon={<FolderOpen />} onClick={onOpenTaskJobGroup(item.job_name)}>
								Open
							</Button>
						</CardActions>
					</Card>
				))}
			</Stack>
		</PageWrapper>
	);
}

export default MetaPollingPlaceTasksJobGroupsBrowser;
