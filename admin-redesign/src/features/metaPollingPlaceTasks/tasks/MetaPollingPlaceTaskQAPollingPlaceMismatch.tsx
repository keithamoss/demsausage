import React, { useState } from 'react';
import type { Election } from '../../../app/services/elections';
import MetaPollingPlaceHistorySummaryCard from '../common/MetaPollingPlaceHistorySummaryCard';
import MetaPollingPlacePollingPlacesReviewList from '../common/MetaPollingPlacePollingPlacesReviewList';
import MetaPollingPlaceSummaryCard from '../common/MetaPollingPlaceSummaryCard';
import MetaPollingPlaceTaskActionBar from '../common/MetaPollingPlaceTaskActionBar';
import type { IPollingPlaceAttachedToMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	activeElection?: Election;
	pollingPlaceForActiveElection?: IPollingPlaceAttachedToMetaPollingPlace;
}

export default function MetaPollingPlaceTaskQAPollingPlaceMismatch(props: Props) {
	const { metaPollingPlaceTaskJob, activeElection, pollingPlaceForActiveElection } = props;

	const [isTaskCompleted, setIsTaskCompleted] = useState(false);

	const onReviewListActionCompleted = () => setIsTaskCompleted(true);

	return (
		<React.Fragment>
			<MetaPollingPlaceSummaryCard metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place} />

			<MetaPollingPlaceHistorySummaryCard
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				pollingPlaceForActiveElection={pollingPlaceForActiveElection}
				cardSxProps={{ mt: 2 }}
			/>

			<MetaPollingPlacePollingPlacesReviewList
				metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
				jobName={metaPollingPlaceTaskJob.job_name}
				onActionCompleted={onReviewListActionCompleted}
				cardSxProps={{ mt: 2 }}
			/>

			<MetaPollingPlaceTaskActionBar
				metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
				isCloseAllowed={isTaskCompleted === false}
				isDeferAllowed={isTaskCompleted === false}
				isCompleteAllowed={isTaskCompleted === true}
			/>
		</React.Fragment>
	);
}
