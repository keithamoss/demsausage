import { yupResolver } from '@hookform/resolvers/yup';
import { Google } from '@mui/icons-material';
import { Alert, Button, Card, CardActions, CardContent, LinearProgress, Typography, styled } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { useNotifications } from '@toolpad/core';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import ErrorElement from '../../../ErrorElement';
import NotFound from '../../../NotFound';
import { metaPollingPlaceNomsFormValidationSchema } from '../../../app/forms/pollingPlaceForm';
import { useAppSelector } from '../../../app/hooks';
import { getIntegerParamOrUndefined } from '../../../app/routing/routingHelpers';
import type { Election } from '../../../app/services/elections';
import { useGetTaskQuery } from '../../../app/services/metaPollingPlaceTasks';
import { useAddOrEditPollingBoothNomsMutation } from '../../../app/services/pollingPlaces';
import type { StallFoodOptions } from '../../../app/services/stalls';
import ElectionsManagerCard from '../../elections/ElectionsManagerCard';
import { selectActiveElections } from '../../elections/electionsSlice';
import type { IPollingPlaceNoms } from '../../pollingPlaces/pollingPlacesInterfaces';
import MetaPollingPlaceLinksManager from '../common/MetaPollingPlaceLinksManager';
import MetaPollingPlacePollingPlacesReviewList from '../common/MetaPollingPlacePollingPlacesReviewList';
import MetaPollingPlaceSummaryCard from '../common/MetaPollingPlaceSummaryCard';
import MetaPollingPlaceTaskActionBar from '../common/MetaPollingPlaceTaskActionBar';
import MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector from '../controls/MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector';
import type { IPollingPlaceAttachedToMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import { IMetaPollingPlaceLinkType } from '../interfaces/metaPollingPlaceLinksInterfaces';
import {
	type IMetaPollingPlaceTaskJob,
	IMetaPollingPlaceTaskStatus,
} from '../interfaces/metaPollingPlaceTasksInterfaces';

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
		<MetaPollingPlaceTaskCrowdsourceFromFacebook
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

function MetaPollingPlaceTaskCrowdsourceFromFacebook(props: Props) {
	const { metaPollingPlaceTaskJob, activeElection, pollingPlaceForActiveElection } = props;

	const notifications = useNotifications();

	// ######################
	// Search for Facebook Page
	// ######################
	const onClickSearchForFacebookPage = () =>
		window
			.open(
				`https://www.google.com.au/search?q=${encodeURI(`${metaPollingPlaceTaskJob.meta_polling_place.premises} ${metaPollingPlaceTaskJob.meta_polling_place.jurisdiction} Facebook`)}`,
				'_blank',
			)
			?.focus();
	// ######################
	// Search for Facebook Page (End)
	// ######################

	// ######################
	// Form Management
	// ######################
	const {
		watch,
		setValue,
		handleSubmit,
		control,
		trigger,
		formState: { errors, isDirty },
	} = useForm<{ noms: IPollingPlaceNoms }>({
		resolver: yupResolver(metaPollingPlaceNomsFormValidationSchema),
		defaultValues: {
			noms: pollingPlaceForActiveElection?.stall?.noms || {},
		},
	});

	const { noms } = watch();

	const onFoodOptionChange = useCallback(
		(foodOptions: StallFoodOptions) => setValue('noms', foodOptions, { shouldDirty: true }),
		[setValue],
	);

	const onDoneWithForm: SubmitHandler<{ noms: IPollingPlaceNoms }> = useCallback(
		async (data) => {
			if (isEmpty(data) === false && isEmpty(data.noms) === false && pollingPlaceForActiveElection !== undefined) {
				try {
					await addOrEditPollingPlaceNoms({
						pollingPlaceId: pollingPlaceForActiveElection.id,
						stall: { noms: data.noms, source: 'Facebook Research Task' },
					}).unwrap();
				} catch (err) {
					notifications.show(JSON.stringify(err), {
						severity: 'error',
					});
				}
			}
		},
		[pollingPlaceForActiveElection, notifications.show],
	);
	// ######################
	// Form Management (End)
	// ######################

	const [
		addOrEditPollingPlaceNoms,
		{
			isLoading: isAddingOrEditingPollingPlaceNomsLoading,
			isSuccess: isAddingOrEditingPollingPlaceNomsSuccessful,
			isError: isAddingOrEditingPollingPlaceNomsErrored,
		},
	] = useAddOrEditPollingBoothNomsMutation();

	const onCompleteTask = useCallback(() => handleSubmit(onDoneWithForm)(), [handleSubmit, onDoneWithForm]);
	// ######################
	// Form Management (End)
	// ######################

	return (
		<PageWrapper>
			<MetaPollingPlaceSummaryCard metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place} />

			<MetaPollingPlacePollingPlacesReviewList
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				cardSxProps={{ mt: 2 }}
			/>

			{metaPollingPlaceTaskJob.meta_polling_place.links.filter((l) => l.type === IMetaPollingPlaceLinkType.FACEBOOK)
				.length === 0 && (
				<Card variant="outlined" sx={{ mt: 2 }}>
					<CardContent>
						<Typography>Some instructions go here...</Typography>
					</CardContent>

					<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
						<Button variant="contained" startIcon={<Google />} onClick={onClickSearchForFacebookPage}>
							Find Facebook page
						</Button>
					</CardActions>
				</Card>
			)}

			<MetaPollingPlaceLinksManager
				metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
				cardSxProps={{ mt: 2 }}
			/>

			{activeElection !== undefined && (
				<Card variant="outlined" sx={{ mt: 2 }}>
					<CardContent sx={{ pt: 1, pb: '8px !important' }}>
						<ElectionsManagerCard
							election={activeElection}
							cardSxProps={{ pt: 1, pb: '8px !important' }}
							borderless={true}
							showProgressBar={false}
						/>

						<MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector
							foodOptions={noms}
							onChange={onFoodOptionChange}
							errors={errors}
						/>
					</CardContent>
				</Card>
			)}

			{activeElection === undefined && (
				<Alert severity="error">There are no active elections for this meta polling place.</Alert>
			)}

			<MetaPollingPlaceTaskActionBar
				metaPollingPlaceTaskJob={metaPollingPlaceTaskJob}
				onClickComplete={onCompleteTask}
				isCloseAllowed={isDirty === false}
				isDeferAllowed={isDirty === false}
				isCompleteAllowed={pollingPlaceForActiveElection?.stall !== null || isDirty === true}
			/>
		</PageWrapper>
	);
}

export default EntrypointLayer1;
