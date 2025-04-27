import { Check, ExpandLess, ExpandMore, GppGood, PlayArrow, RestartAlt, Troubleshoot } from '@mui/icons-material';
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
	Stack,
	type SxProps,
	Typography,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCreateCompletedTaskMutation } from '../../../app/services/metaPollingPlaceTasks';
import { useRearrangePollingPlacesMutation } from '../../../app/services/metaPollingPlaces';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import type {
	IMetaPollingPlace,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';
import {
	IMetaPollingPlaceTaskCategory,
	type IMetaPollingPlaceTaskJob,
	IMetaPollingPlaceTaskType,
} from '../interfaces/metaPollingPlaceTasksInterfaces';
import MetaPollingPlacePollingPlacesReviewDialog from './MetaPollingPlacePollingPlacesReviewDialog';
import MetaPollingPlacePollingPlacesReviewListItem from './MetaPollingPlacePollingPlacesReviewListItem';
import MetaPollingPlaceSummaryCard from './MetaPollingPlaceSummaryCard';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	jobName: string;
	onActionCompleted: () => void;
	cardSxProps: SxProps;
}

function MetaPollingPlacePollingPlacesReviewList(props: Props) {
	const { metaPollingPlaceTaskJob, jobName, onActionCompleted, cardSxProps } = props;

	const notifications = useNotifications();

	// ######################
	// Hide/Show Review List
	// ######################
	const [showLinkedPollingPlaces, setShowLinkedPollingPlaces] = useState(
		metaPollingPlaceTaskJob.meta_polling_place.task_outcomes.passed_review === false,
	);

	const onClickShowLinkedPollingPlaces = () => {
		setShowLinkedPollingPlaces(!showLinkedPollingPlaces);
	};
	// ######################
	// Hide/Show Review List (End)
	// ######################

	// ######################
	// Review Dialog Management
	// ######################
	const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

	const metaPollingPlaces = useMemo(
		() => [metaPollingPlaceTaskJob.meta_polling_place, ...metaPollingPlaceTaskJob.nearby_meta_polling_places],
		[metaPollingPlaceTaskJob.meta_polling_place, metaPollingPlaceTaskJob.nearby_meta_polling_places],
	);

	const [pollingPlacesToReview, setPollingPlacesToReview] = React.useState<
		{ pollingPlace: IPollingPlaceAttachedToMetaPollingPlace; metaPollingPlace: IMetaPollingPlace }[] | undefined
	>(undefined);

	const [countOfPollingPlacesToReview, setCountOfPollingPlacesToReview] = React.useState<number>(0);

	const [movesAndSplits, setMovesAndSplits] = React.useState<
		{ moves: { pollingPlaceId: number; metaPollingPlaceId: number }[]; splits: number[] } | undefined
	>(undefined);

	const onCloseReviewDialog = useCallback(() => setIsReviewDialogOpen(false), []);

	useEffect(() => {
		if (Array.isArray(pollingPlacesToReview) && pollingPlacesToReview.length === 0) {
			setIsReviewDialogOpen(false);
		}
	}, [pollingPlacesToReview]);
	// ######################
	// Review Dialog Management (End)
	// ######################

	// ######################
	// Review Choices
	// ######################
	const removeFirstPollingPlaceFromReviewList = useCallback(() => {
		if (Array.isArray(pollingPlacesToReview)) {
			const [, ...rest] = pollingPlacesToReview;
			setPollingPlacesToReview(rest);
		}
	}, [pollingPlacesToReview]);

	const onKeepPollingPlace = (pollingPlaceId: number) => () => {
		removeFirstPollingPlaceFromReviewList();
	};

	const onMovePollingPlace = (pollingPlaceId: number, metaPollingPlaceId: number) => () => {
		if (
			movesAndSplits !== undefined &&
			movesAndSplits.moves.find((item) => item.pollingPlaceId === pollingPlaceId) === undefined
		) {
			const localMovesAndSplits = { ...movesAndSplits };

			localMovesAndSplits.moves.push({
				pollingPlaceId,
				metaPollingPlaceId,
			});

			setMovesAndSplits(localMovesAndSplits);
		}

		removeFirstPollingPlaceFromReviewList();
	};

	const onSplitPollingPlace = (pollingPlaceId: number) => () => {
		if (movesAndSplits !== undefined && movesAndSplits.splits.includes(pollingPlaceId) === false) {
			const localMovesAndSplits = { ...movesAndSplits };

			localMovesAndSplits.splits.push(pollingPlaceId);

			setMovesAndSplits(localMovesAndSplits);
		}

		removeFirstPollingPlaceFromReviewList();
	};
	// ######################
	// Review Choices (End)
	// ######################

	// ######################
	// Review Actions
	// ######################
	const onClickBeginReview = () => {
		setIsReviewDialogOpen(true);

		setMovesAndSplits({
			moves: [],
			splits: [],
		});

		const reviewList = [];

		for (const pollingPlace of metaPollingPlaceTaskJob.meta_polling_place.polling_places) {
			reviewList.push({
				pollingPlace,
				metaPollingPlace: metaPollingPlaceTaskJob.meta_polling_place,
			});
		}

		for (const metaPollingPlace of metaPollingPlaceTaskJob.nearby_meta_polling_places) {
			for (const pollingPlace of metaPollingPlace.polling_places) {
				reviewList.push({
					pollingPlace,
					metaPollingPlace,
				});
			}
		}

		setPollingPlacesToReview(reviewList);

		setCountOfPollingPlacesToReview(reviewList.length);
	};

	const onClickResumeReview = () => setIsReviewDialogOpen(true);

	const onClickRestartReview = () => onClickBeginReview();

	const [
		rearrangePollingPlaces,
		{ isLoading: isRearrangePollingPlacesLoading, isSuccess: isRearrangePollingPlacesSuccessful },
	] = useRearrangePollingPlacesMutation();

	const onClickConfirmReview = async () => {
		if (Array.isArray(pollingPlacesToReview) && pollingPlacesToReview.length === 0 && movesAndSplits !== undefined) {
			try {
				await rearrangePollingPlaces(movesAndSplits).unwrap();

				notifications.show('Polling places rearranged successfully', {
					severity: 'success',
					autoHideDuration: 3000,
				});

				// Only confirm the primary MPP is good because we need to do the review from the PERSPECTIVE of each individual MPP to ensure that there aren't any other MPPs near them that need polling places moved into them.
				await createCompletedTask({
					meta_polling_place: metaPollingPlaceTaskJob.meta_polling_place.id,
					job_name: `From ${jobName}`,
					category: IMetaPollingPlaceTaskCategory.REVIEW,
					type: IMetaPollingPlaceTaskType.REVIEW_PP,
				}).unwrap();

				onActionCompleted();
			} catch (err) {
				notifications.show(`Polling place rearrangement failed: ${JSON.stringify(err)}`, {
					severity: 'error',
					autoHideDuration: 6000,
				});
			}
		}
	};
	// ######################
	// Review Actions (End)
	// ######################

	// ######################
	// Looks Good!
	// ######################
	const [createCompletedTask, { isLoading: isLooksGoodLoading, isSuccess: isLooksGoodSuccessful }] =
		useCreateCompletedTaskMutation();

	const onClickLooksGood = useCallback(async () => {
		try {
			// Only confirm the primary MPP is good because we need to do the review from the PERSPECTIVE of each individual MPP to ensure that there aren't any other MPPs near them that need polling places moved into them.
			await createCompletedTask({
				meta_polling_place: metaPollingPlaceTaskJob.meta_polling_place.id,
				job_name: `From ${jobName}`,
				category: IMetaPollingPlaceTaskCategory.REVIEW,
				type: IMetaPollingPlaceTaskType.REVIEW_PP,
			}).unwrap();

			onActionCompleted();
		} catch (err) {
			notifications.show(`Looks good failed: ${JSON.stringify(err)}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [
		createCompletedTask,
		metaPollingPlaceTaskJob.meta_polling_place.id,
		jobName,
		onActionCompleted,
		notifications.show,
	]);
	// ######################
	// Looks Good! (End)
	// ######################

	return (
		<React.Fragment>
			<Card variant="outlined" sx={cardSxProps}>
				<CardHeader
					avatar={
						<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} aria-label="recipe">
							{metaPollingPlaceTaskJob.meta_polling_place.polling_places.length}
						</Avatar>
					}
					action={
						<IconButton onClick={onClickShowLinkedPollingPlaces}>
							{showLinkedPollingPlaces === true ? <ExpandLess /> : <ExpandMore />}
						</IconButton>
					}
					onClick={onClickShowLinkedPollingPlaces}
					title="Linked polling places"
					// subheader="September 14, 2016"
				/>

				<Collapse in={showLinkedPollingPlaces} timeout="auto" unmountOnExit>
					<CardContent sx={{ pt: 0 }}>
						<List disablePadding>
							{metaPollingPlaceTaskJob.meta_polling_place.polling_places.map((pollingPlace) => (
								<MetaPollingPlacePollingPlacesReviewListItem
									key={pollingPlace.id}
									pollingPlace={pollingPlace}
									metaPollingPlace={metaPollingPlaceTaskJob.meta_polling_place}
								/>
							))}

							{metaPollingPlaceTaskJob.nearby_meta_polling_places.length > 0 && (
								<React.Fragment>
									<Typography sx={{ mt: 1, mb: 1 }} variant="h6" component="div">
										Other nearby meta polling places
									</Typography>

									{metaPollingPlaceTaskJob.nearby_meta_polling_places.map((mpp) => (
										<React.Fragment key={mpp.id}>
											<MetaPollingPlaceSummaryCard metaPollingPlace={mpp} />

											{mpp.polling_places.map((pp) => (
												<MetaPollingPlacePollingPlacesReviewListItem
													key={pp.id}
													pollingPlace={pp}
													metaPollingPlace={mpp}
												/>
											))}
										</React.Fragment>
									))}
								</React.Fragment>
							)}
						</List>
					</CardContent>

					<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
						<Stack flexGrow={1} spacing={1}>
							{pollingPlacesToReview === undefined && isLooksGoodSuccessful === false && (
								<Button onClick={onClickBeginReview} variant="outlined" startIcon={<Troubleshoot />}>
									{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
									<span>Begin Review</span>
								</Button>
							)}

							{Array.isArray(pollingPlacesToReview) &&
								pollingPlacesToReview.length > 0 &&
								isLooksGoodSuccessful === false && (
									<Button onClick={onClickResumeReview} variant="outlined" startIcon={<PlayArrow />}>
										{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
										<span>Resume Review</span>
									</Button>
								)}

							{Array.isArray(pollingPlacesToReview) &&
								pollingPlacesToReview.length < countOfPollingPlacesToReview &&
								isLooksGoodSuccessful === false && (
									<Button
										disabled={isRearrangePollingPlacesSuccessful === true}
										onClick={onClickRestartReview}
										variant="outlined"
										startIcon={<RestartAlt />}
									>
										{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
										<span>Restart Review</span>
									</Button>
								)}

							{Array.isArray(pollingPlacesToReview) &&
								pollingPlacesToReview.length === 0 &&
								isLooksGoodSuccessful === false && (
									<Button
										loading={isRearrangePollingPlacesLoading}
										loadingPosition="end"
										disabled={isRearrangePollingPlacesSuccessful === true}
										onClick={onClickConfirmReview}
										variant="contained"
										startIcon={<Check />}
									>
										{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
										<span>Confirm Review</span>
									</Button>
								)}

							<Button
								loading={isLooksGoodLoading === true}
								loadingPosition="end"
								disabled={isRearrangePollingPlacesSuccessful === true || isLooksGoodSuccessful === true}
								onClick={onClickLooksGood}
								variant="outlined"
								startIcon={<GppGood />}
							>
								{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
								<span>Looks good!</span>
							</Button>
						</Stack>
					</CardActions>
				</Collapse>
			</Card>

			{isReviewDialogOpen === true && Array.isArray(pollingPlacesToReview) && pollingPlacesToReview.length > 0 && (
				<MetaPollingPlacePollingPlacesReviewDialog
					pollingPlace={pollingPlacesToReview[0].pollingPlace}
					metaPollingPlace={pollingPlacesToReview[0].metaPollingPlace}
					metaPollingPlaces={metaPollingPlaces}
					onKeep={onKeepPollingPlace}
					onMove={onMovePollingPlace}
					onSplit={onSplitPollingPlace}
					pagePosition={countOfPollingPlacesToReview - pollingPlacesToReview.length + 1}
					totalPages={countOfPollingPlacesToReview}
					onClose={onCloseReviewDialog}
				/>
			)}
		</React.Fragment>
	);
}

export default MetaPollingPlacePollingPlacesReviewList;
