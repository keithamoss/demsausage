import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';
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

	// F6: Stable job name shared across all splits in this review session (FR-7 / B3).
	// Splits triggered during a QA_PP_MISMATCH session are grouped under one job name
	// in the task browser rather than creating a separate job per split.
	const splitJobName = useRef(`MPP Split - ${dayjs().format('D MMMM YYYY HH:mm:ss')}`);

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
				splitJobName={splitJobName.current}
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
