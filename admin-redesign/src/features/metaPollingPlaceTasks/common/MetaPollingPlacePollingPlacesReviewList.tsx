import { ExpandLess, ExpandMore, GppBad, GppGood } from '@mui/icons-material';
import {
	Avatar,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Collapse,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	type SxProps,
	Typography,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import React, { useEffect, useState } from 'react';
import { useAddTaskMutation, useCreateCompletedTaskMutation } from '../../../app/services/metaPollingPlaceTasks';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import type { IMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import {
	IMetaPollingPlaceTaskCategory,
	IMetaPollingPlaceTaskType,
} from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlacePollingPlacesReviewList(props: Props) {
	const { metaPollingPlace, cardSxProps } = props;

	const notifications = useNotifications();

	const [showLinkedPollingPlaces, setShowLinkedPollingPlaces] = useState(
		metaPollingPlace.task_outcomes.passed_review === false,
	);

	const onClickShowLinkedPollingPlaces = () => {
		setShowLinkedPollingPlaces(!showLinkedPollingPlaces);
	};

	useEffect(
		() => setShowLinkedPollingPlaces(metaPollingPlace.task_outcomes.passed_review === false),
		[metaPollingPlace.task_outcomes.passed_review],
	);

	// ######################
	// Looks Good
	// ######################
	const [createCompletedTask, { isLoading: isCreateCompletedTaskLoading, isSuccess: isCreateCompletedTaskSuccessful }] =
		useCreateCompletedTaskMutation();

	const onClickLooksGood = () =>
		createCompletedTask({
			meta_polling_place: metaPollingPlace.id,
			job_name: 'From Facebook Research',
			category: IMetaPollingPlaceTaskCategory.REVIEW,
			type: IMetaPollingPlaceTaskType.REVIEW_PP,
		});

	useEffect(() => {
		if (isCreateCompletedTaskSuccessful === true) {
			notifications.show('Saved', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isCreateCompletedTaskSuccessful, notifications.show]);
	// ######################
	// Looks Good (End)
	// ######################

	// ######################
	// Looks Suss
	// ######################
	const [addTask, { isLoading: isAddTaskLoading, isSuccess: isAddTaskSuccessful }] = useAddTaskMutation();

	const onClickLooksSuss = () =>
		addTask({
			meta_polling_place: metaPollingPlace.id,
			job_name: 'From Facebook Research',
			category: IMetaPollingPlaceTaskCategory.QA,
			type: IMetaPollingPlaceTaskType.QA_PP_MISMATCH,
		});

	useEffect(() => {
		if (isAddTaskSuccessful === true) {
			notifications.show('Saved', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isAddTaskSuccessful, notifications.show]);
	// ######################
	// Looks Suss (End)
	// ######################

	// @TODO Use red/green highlighting to diff against the MPP details?

	return (
		<Card variant="outlined" sx={cardSxProps}>
			<CardHeader
				avatar={
					<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} aria-label="recipe">
						{metaPollingPlace.polling_places.length}
					</Avatar>
				}
				action={
					<IconButton onClick={onClickShowLinkedPollingPlaces}>
						{showLinkedPollingPlaces === true ? <ExpandLess /> : <ExpandMore />}
					</IconButton>
				}
				title="Linked polling places"
				// subheader="September 14, 2016"
			/>

			<Collapse in={showLinkedPollingPlaces} timeout="auto" unmountOnExit>
				<CardContent sx={{ pt: 0 }}>
					<List disablePadding>
						{metaPollingPlace.polling_places.map((pollingPlace) => (
							<ListItem key={pollingPlace.id} disablePadding>
								<ListItemButton>
									<ListItemText
										sx={{
											'& .MuiListItemText-primary': {
												fontSize: 16,
												fontWeight: 500,
											},
										}}
										primary={pollingPlace.premises}
										secondary={
											<React.Fragment>
												<Typography component={'span'} sx={{ display: 'block' }}>
													{pollingPlace.address}
												</Typography>
												<Typography component={'span'} sx={{ display: 'block' }}>
													{pollingPlace.name}
												</Typography>
												<Typography component={'span'} sx={{ display: 'block' }}>
													{pollingPlace.election_name}
												</Typography>
											</React.Fragment>
										}
									/>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</CardContent>

				<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
					<Button
						loading={isCreateCompletedTaskLoading === true}
						loadingPosition="end"
						onClick={onClickLooksGood}
						variant="outlined"
						startIcon={<GppGood />}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Looks good!</span>
					</Button>

					<Button
						loading={isAddTaskLoading === true}
						loadingPosition="end"
						onClick={onClickLooksSuss}
						variant="outlined"
						color="error"
						startIcon={<GppBad />}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Looks suss!</span>
					</Button>
				</CardActions>
			</Collapse>
		</Card>
	);
}

export default MetaPollingPlacePollingPlacesReviewList;
