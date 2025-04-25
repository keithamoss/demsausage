import { LinearProgress, styled } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import NotFound from '../../../NotFound';
import { useAppSelector } from '../../../app/hooks';
import { getIntegerParamOrUndefined } from '../../../app/routing/routingHelpers';
import type { Election } from '../../../app/services/elections';
import { useGetTaskQuery } from '../../../app/services/metaPollingPlaceTasks';
import { selectActiveElections } from '../../elections/electionsSlice';
import type { IPollingPlaceAttachedToMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import {
	type IMetaPollingPlaceTaskJob,
	IMetaPollingPlaceTaskStatus,
	IMetaPollingPlaceTaskType,
} from '../interfaces/metaPollingPlaceTasksInterfaces';
import MetaPollingPlaceTaskCrowdsourceFromFacebook from './MetaPollingPlaceTaskCrowdsourceFromFacebook';
import MetaPollingPlaceTaskQAPollingPlaceMismatch from './MetaPollingPlaceTaskQAPollingPlaceMismatch';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
	// A bit of extra padding bottom here to allow for the presence of <AppBar> pinned at the bottom of the screen
	paddingBottom: theme.spacing(10),
}));

function EntrypointLayer1() {
	const urlTaskId = getIntegerParamOrUndefined(useParams(), 'task_id');

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		data: metaPollingPlaceTaskJob,
		isLoading,
		isSuccess,
		isError,
	} = useGetTaskQuery(urlTaskId !== undefined ? urlTaskId : skipToken);

	if (isLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isError === true || isSuccess === false) {
		return <ErrorElement />;
	}

	if (metaPollingPlaceTaskJob.status !== IMetaPollingPlaceTaskStatus.IN_PROGRESS) {
		return <NotFound />;
	}

	const pollingPlaceForActiveElection =
		activeElections.length > 0
			? metaPollingPlaceTaskJob.meta_polling_place.polling_places.find(
					(p) => p.election_name === activeElections[0].name,
				)
			: undefined;

	return (
		<MetaPollingPlaceTask
			metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
			activeElection={activeElections.length > 0 ? activeElections[0] : undefined}
			pollingPlaceForActiveElection={pollingPlaceForActiveElection}
		/>
	);
}

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	activeElection?: Election;
	pollingPlaceForActiveElection?: IPollingPlaceAttachedToMetaPollingPlace;
}

const MetaPollingPlaceTaskNotImplementedYet = (props: Props) => <div>Task not implemented yet</div>;

const getTaskComponent = (type: IMetaPollingPlaceTaskType, props: Props): JSX.Element => {
	switch (type) {
		case IMetaPollingPlaceTaskType.REVIEW_DRAFT:
			return <MetaPollingPlaceTaskNotImplementedYet {...props} />;
		case IMetaPollingPlaceTaskType.REVIEW_PP:
			return <MetaPollingPlaceTaskNotImplementedYet {...props} />;
		case IMetaPollingPlaceTaskType.QA_PP_MISMATCH:
			return <MetaPollingPlaceTaskQAPollingPlaceMismatch {...props} />;
		case IMetaPollingPlaceTaskType.CROWDSOURCE_FROM_FACEBOOK:
			return <MetaPollingPlaceTaskCrowdsourceFromFacebook {...props} />;
	}
};

function MetaPollingPlaceTask(props: Props) {
	const { metaPollingPlaceTaskJob, activeElection, pollingPlaceForActiveElection } = props;

	return <PageWrapper>{getTaskComponent(metaPollingPlaceTaskJob.type, props)}</PageWrapper>;
}

export default EntrypointLayer1;
