import { yupResolver } from '@hookform/resolvers/yup';
import { Google } from '@mui/icons-material';
import { Alert, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { isEmpty } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { metaPollingPlaceNomsFormValidationSchema } from '../../../app/forms/pollingPlaceForm';
import type { Election } from '../../../app/services/elections';
import { useAddOrEditPollingBoothNomsMutation } from '../../../app/services/pollingPlaces';
import type { StallFoodOptions } from '../../../app/services/stalls';
import ElectionsManagerCard from '../../elections/ElectionsManagerCard';
import type { IPollingPlaceNoms } from '../../pollingPlaces/pollingPlacesInterfaces';
import MetaPollingPlaceHistorySummaryCard from '../common/MetaPollingPlaceHistorySummaryCard';
import MetaPollingPlaceLinksManager from '../common/MetaPollingPlaceLinksManager';
import MetaPollingPlacePollingPlacesReviewList from '../common/MetaPollingPlacePollingPlacesReviewList';
import MetaPollingPlaceRemarks from '../common/MetaPollingPlaceRemarks';
import MetaPollingPlaceSummaryCard from '../common/MetaPollingPlaceSummaryCard';
import MetaPollingPlaceTaskActionBar from '../common/MetaPollingPlaceTaskActionBar';
import MetaPollingPlaceTaskHistory from '../common/MetaPollingPlaceTaskHistory';
import MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector from '../controls/MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector';
import type { IPollingPlaceAttachedToMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	activeElection?: Election;
	pollingPlaceForActiveElection?: IPollingPlaceAttachedToMetaPollingPlace;
}

export default function MetaPollingPlaceTaskCrowdsourceFromFacebook(props: Props) {
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

	// ######################
	// Task Completion
	// ######################
	const [isReviewListTaskCompleted, setIsReviewListTaskCompleted] = useState(false);

	const onReviewListActionCompleted = () => setIsReviewListTaskCompleted(true);

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
	// Task Completion (End)
	// ######################

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

			<MetaPollingPlaceRemarks metaPollingPlaceTaskJob={metaPollingPlaceTaskJob} cardSxProps={{ mt: 2 }} />

			<MetaPollingPlaceTaskHistory metaPollingPlaceTaskJob={metaPollingPlaceTaskJob} cardSxProps={{ mt: 2 }} />

			<Card variant="outlined" sx={{ mt: 2 }}>
				<CardContent>
					<Typography>
						Click the button below to start a Google search to find the Facebook page for this polling place.
					</Typography>
				</CardContent>

				<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
					<Button variant="outlined" startIcon={<Google />} onClick={onClickSearchForFacebookPage}>
						Find Facebook page
					</Button>
				</CardActions>
			</Card>

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
				isCompleteAllowed={
					(pollingPlaceForActiveElection?.stall !== null || isDirty === true) &&
					(isReviewListTaskCompleted === true || metaPollingPlaceTaskJob.meta_polling_place.task_outcomes.passed_review)
				}
			/>
		</React.Fragment>
	);
}
