import { Google } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, LinearProgress, Typography, styled } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import { getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery } from '../../../app/services/metaPollingPlaceTasks';
import MetaPollingPlaceLinksManager from '../common/MetaPollingPlaceLinksManager';
import MetaPollingPlacePollingPlacesReviewList from '../common/MetaPollingPlacePollingPlacesReviewList';
import MetaPollingPlaceSummaryCard from '../common/MetaPollingPlaceSummaryCard';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
	paddingBottom: theme.spacing(2),
}));

function MetaPollingPlaceTaskCrowdsourceFromFacebook() {
	const params = useParams();

	const urlJobName = getStringParamOrUndefined(params, 'job_name');

	const {
		data: metaPollingPlaceTaskJob,
		isLoading,
		isSuccess,
		isError,
	} = useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery(urlJobName !== undefined ? urlJobName : skipToken);

	if (isLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isError === true || isSuccess === false) {
		return <ErrorElement />;
	}

	const onClickSearch = () =>
		window
			.open(
				`https://www.google.com.au/search?q=${encodeURI(`${metaPollingPlaceTaskJob.meta_polling_place.premises} ${metaPollingPlaceTaskJob.meta_polling_place.jurisdiction} Facebook`)}`,
				'_blank',
			)
			?.focus();

	return (
		<PageWrapper>
			<MetaPollingPlaceSummaryCard metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place} />

			<MetaPollingPlacePollingPlacesReviewList
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				cardSxProps={{ mt: 2 }}
			/>

			<Card variant="outlined" sx={{ mt: 2 }}>
				<CardContent>
					<Typography>Some instructions go here...</Typography>
				</CardContent>

				<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
					<Button variant="contained" startIcon={<Google />} onClick={onClickSearch}>
						Find Facebook page
					</Button>
				</CardActions>
			</Card>

			<MetaPollingPlaceLinksManager
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				cardSxProps={{ mt: 2 }}
			/>
		</PageWrapper>
	);
}

export default MetaPollingPlaceTaskCrowdsourceFromFacebook;
