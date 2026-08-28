import {
	CallMerge,
	Check,
	ExpandLess,
	ExpandMore,
	GppGood,
	PlayArrow,
	RestartAlt,
	Troubleshoot,
} from '@mui/icons-material';
import {
	Alert,
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
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
	/**
	 * Stable job name for REVIEW_DRAFT tasks created by splits in this review
	 * session.  When provided, all splits share this job name in the task
	 * browser.  If omitted, the backend generates a unique fallback per split.
	 */
	splitJobName?: string;
	/**
	 * When provided, a "Complete now?" prompt appears after "Looks good!" succeeds.
	 * Should be wired to the parent's completion handler.
	 */
	onClickCompleteNow?: () => void;
}

function MetaPollingPlacePollingPlacesReviewList(props: Props) {
	const { metaPollingPlaceTaskJob, jobName, onActionCompleted, cardSxProps, splitJobName, onClickCompleteNow } = props;

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

	const sortedNearbyMPPs = useMemo(
		() =>
			[...metaPollingPlaceTaskJob.nearby_meta_polling_places].sort(
				(a, b) => a.distance_from_task_mpp_metres - b.distance_from_task_mpp_metres || a.id - b.id,
			),
		[metaPollingPlaceTaskJob.nearby_meta_polling_places],
	);

	const duplicateNames = useMemo(() => {
		const counts = new Map<string, number>();
		for (const mpp of [
			metaPollingPlaceTaskJob.meta_polling_place,
			...metaPollingPlaceTaskJob.nearby_meta_polling_places,
		]) {
			const key = mpp.premises.trim().toLowerCase();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
	}, [metaPollingPlaceTaskJob.meta_polling_place, metaPollingPlaceTaskJob.nearby_meta_polling_places]);

	const HIGH_AMBIGUITY_DISTANCE_METRES = 250;
	const hasHighAmbiguity = useMemo(() => {
		const withinThreshold = metaPollingPlaceTaskJob.nearby_meta_polling_places.filter(
			(mpp) => mpp.distance_from_task_mpp_metres <= HIGH_AMBIGUITY_DISTANCE_METRES,
		);
		return withinThreshold.some((mpp) => duplicateNames.has(mpp.premises.trim().toLowerCase()));
	}, [metaPollingPlaceTaskJob.nearby_meta_polling_places, duplicateNames]);

	const [pollingPlacesToReview, setPollingPlacesToReview] = React.useState<
		{ pollingPlace: IPollingPlaceAttachedToMetaPollingPlace; metaPollingPlace: IMetaPollingPlace }[] | undefined
	>(undefined);

	const [countOfPollingPlacesToReview, setCountOfPollingPlacesToReview] = React.useState<number>(0);

	const [movesAndSplits, setMovesAndSplits] = React.useState<
		{ moves: { pollingPlaceId: number; metaPollingPlaceId: number }[]; splits: number[] } | undefined
	>(undefined);

	// ######################
	// Undo Stack
	// ######################
	const [undoStack, setUndoStack] = React.useState<
		{
			item: { pollingPlace: IPollingPlaceAttachedToMetaPollingPlace; metaPollingPlace: IMetaPollingPlace };
			action: 'keep' | 'move' | 'split';
			moveTargetId?: number;
		}[]
	>([]);

	const onUndoInDialog = useCallback(() => {
		if (undoStack.length === 0 || !Array.isArray(pollingPlacesToReview)) return;

		const last = undoStack[undoStack.length - 1];

		setPollingPlacesToReview([last.item, ...pollingPlacesToReview]);

		if (movesAndSplits !== undefined) {
			if (last.action === 'move' && last.moveTargetId !== undefined) {
				setMovesAndSplits({
					...movesAndSplits,
					moves: movesAndSplits.moves.filter((m) => m.pollingPlaceId !== last.item.pollingPlace.id),
				});
			} else if (last.action === 'split') {
				setMovesAndSplits({
					...movesAndSplits,
					splits: movesAndSplits.splits.filter((id) => id !== last.item.pollingPlace.id),
				});
			}
		}

		setUndoStack((prev) => prev.slice(0, -1));
		setIsReviewDialogOpen(true);
	}, [undoStack, pollingPlacesToReview, movesAndSplits]);
	// ######################
	// Undo Stack (End)
	// ######################

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
	const removeFirstPollingPlaceFromReviewList = useCallback(
		(action: 'keep' | 'move' | 'split', moveTargetId?: number) => {
			if (Array.isArray(pollingPlacesToReview) && pollingPlacesToReview.length > 0) {
				const [first, ...rest] = pollingPlacesToReview;
				setUndoStack((prev) => [...prev, { item: first, action, moveTargetId }]);
				setPollingPlacesToReview(rest);
			}
		},
		[pollingPlacesToReview],
	);

	const onKeepPollingPlace = (pollingPlaceId: number) => () => {
		removeFirstPollingPlaceFromReviewList('keep');
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

		removeFirstPollingPlaceFromReviewList('move', metaPollingPlaceId);
	};

	const onSplitPollingPlace = (pollingPlaceId: number) => () => {
		if (movesAndSplits !== undefined && movesAndSplits.splits.includes(pollingPlaceId) === false) {
			const localMovesAndSplits = { ...movesAndSplits };

			localMovesAndSplits.splits.push(pollingPlaceId);

			setMovesAndSplits(localMovesAndSplits);
		}

		removeFirstPollingPlaceFromReviewList('split');
	};
	// ######################
	// Review Choices (End)
	// ######################

	// ######################
	// Review Actions
	// ######################
	const onClickBeginReview = () => {
		setIsReviewDialogOpen(true);
		setUndoStack([]);

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
				await rearrangePollingPlaces({ ...movesAndSplits, splitJobName }).unwrap();

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
			// Submit an empty rearrangement first so any splits generated by this
			// session (splitJobName) are sent to the backend.  For "Looks good!"
			// there are no moves or splits, but the call is still required to keep
			// the flow consistent.
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

	// ######################
	// Merge All
	// ######################
	const [isMergeAllConfirmOpen, setIsMergeAllConfirmOpen] = React.useState(false);

	const onClickMergeAll = async () => {
		setIsMergeAllConfirmOpen(false);

		const moves = sortedNearbyMPPs.flatMap((mpp) =>
			mpp.polling_places.map((pp) => ({
				pollingPlaceId: pp.id,
				metaPollingPlaceId: metaPollingPlaceTaskJob.meta_polling_place.id,
			})),
		);

		try {
			await rearrangePollingPlaces({ moves, splits: [], splitJobName }).unwrap();

			notifications.show('Polling places merged successfully', {
				severity: 'success',
				autoHideDuration: 3000,
			});

			await createCompletedTask({
				meta_polling_place: metaPollingPlaceTaskJob.meta_polling_place.id,
				job_name: `From ${jobName}`,
				category: IMetaPollingPlaceTaskCategory.REVIEW,
				type: IMetaPollingPlaceTaskType.REVIEW_PP,
			}).unwrap();

			onActionCompleted();
		} catch (err) {
			notifications.show(`Merge failed: ${JSON.stringify(err)}`, {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	};
	// ######################
	// Merge All (End)
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
					subheader={
						isLooksGoodSuccessful
							? 'Reviewed ✓'
							: pollingPlacesToReview === undefined
								? 'Review not started'
								: pollingPlacesToReview.length === 0
									? 'All decisions made — confirm or restart'
									: `In progress (${countOfPollingPlacesToReview - pollingPlacesToReview.length} of ${countOfPollingPlacesToReview} reviewed)`
					}
				/>

				{hasHighAmbiguity === true && (
					<Alert severity="warning" sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0 }}>
						One or more nearby MPPs share the same name as this MPP — check carefully before moving or splitting.
					</Alert>
				)}

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

							{sortedNearbyMPPs.length > 0 && (
								<React.Fragment>
									<Divider sx={{ mt: 2, mb: 2 }} />
									<Typography sx={{ mb: 1 }} variant="h6" component="div">
										Other nearby meta polling places
									</Typography>

									{sortedNearbyMPPs.map((mpp) => (
										<React.Fragment key={mpp.id}>
											<MetaPollingPlaceSummaryCard
												metaPollingPlace={mpp}
												showDuplicateNameWarning={duplicateNames.has(mpp.premises.trim().toLowerCase())}
											/>

											<Box sx={{ pl: 2 }}>
												{mpp.polling_places.map((pp) => (
													<MetaPollingPlacePollingPlacesReviewListItem
														key={pp.id}
														pollingPlace={pp}
														metaPollingPlace={mpp}
														showState={true}
													/>
												))}
											</Box>
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
							{pollingPlacesToReview === undefined &&
								isLooksGoodSuccessful === false &&
								sortedNearbyMPPs.length > 0 && (
									<Button
										onClick={() => setIsMergeAllConfirmOpen(true)}
										variant="outlined"
										startIcon={<CallMerge />}
										color="warning"
									>
										{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
										<span>Merge all into this MPP</span>
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
							{isLooksGoodSuccessful === true && onClickCompleteNow !== undefined && (
								<Alert
									severity="success"
									action={
										<Button size="small" color="success" onClick={onClickCompleteNow}>
											Complete now
										</Button>
									}
								>
									Marked as reviewed.
								</Alert>
							)}{' '}
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
					canUndo={undoStack.length > 0}
					onUndo={onUndoInDialog}
				/>
			)}

			<Dialog open={isMergeAllConfirmOpen} onClose={() => setIsMergeAllConfirmOpen(false)}>
				<DialogTitle>Merge all polling places?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						This will move all polling places from the {sortedNearbyMPPs.length} nearby MPP
						{sortedNearbyMPPs.length !== 1 ? 's' : ''} into this MPP. Their linked polling places will be reassigned
						here.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button size="small" onClick={() => setIsMergeAllConfirmOpen(false)}>
						Cancel
					</Button>
					<Button size="small" onClick={onClickMergeAll} color="warning">
						<span>Merge all</span>
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}

export default MetaPollingPlacePollingPlacesReviewList;
