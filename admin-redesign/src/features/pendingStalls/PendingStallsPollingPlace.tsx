import { MapsHomeWork } from '@mui/icons-material';
import { Avatar, Backdrop, Card, CardContent, CardHeader, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDialogs, useNotifications } from '@toolpad/core';
import { isEmpty } from 'lodash-es';
import React, { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import type { UseFormHandleSubmit, UseFormSetValue } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import NotFound from '../../NotFound';
import { navigateToPendingStallsRoot } from '../../app/routing/navigationHelpers/navigationHelpersPendingStalls';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import {
	type PendingStall,
	type PollingPlaceWithPendingStall,
	StallApprovalType,
	useApproveStallMutation,
	useDeclineStallMutation,
	useGetPendingStallsQuery,
} from '../../app/services/stalls';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import PollingPlaceNomsEditorForm from '../pollingPlaces/PollingPlaceNomsEditorForm';
import { getPollingPlaceSummaryCardForHeading } from '../pollingPlaces/pollingPlaceHelpers';
import { mergeStallWithPollingPlaceFormNomsAndUpdateForm } from '../pollingPlaces/pollingPlaceNomsEditorFormHelpers';
import type { IPollingPlaceStallModifiableProps } from '../pollingPlaces/pollingPlacesInterfaces';
import PendingStallPollingPlaceHistory from './PendingStallPollingPlaceHistory';
import PendingStallPollingPlaceSubmissions from './PendingStallPollingPlaceSubmissions';
import PendingStallsPollingPlaceAndStallsSummary from './PendingStallsPollingPlaceAndStallsSummary';
import { isStallMergedWithPollingPlace } from './PendingStallsPollingPlaceHelpers';
import PendingStallsPollingPlaceStallsList from './PendingStallsPollingPlaceStallsList';

// const bottomNav = 56;

// const Root = styled('div')(({ theme }) => ({
// 	height: '100%',
// 	// Bg for light was grey[100]
// 	backgroundColor: theme.palette.mode === 'light' ? 'white' : theme.palette.background.default,
// 	paddingBottom: `${bottomNav}px`,
// }));

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	paddingBottom: theme.spacing(2),
	// @TODO This is to add enough space for the end of the form to appear without the BottomNav bar from the Form sitting on top. What's the non-hacky way to fix this that we used on the Polling Place Editor?
	// See above
	// paddingBottom: theme.spacing(8),
}));

function EntrypointLayer1() {
	const urlPollingPlaceId = getIntegerParamOrUndefined(useParams(), 'polling_place_id');

	const {
		data: electionsWithPendingStalls,
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery();

	if (urlPollingPlaceId === undefined) {
		return <NotFound />;
	}

	if (isGetPendingStallsLoading === true) {
		return null;
	}

	if (isGetPendingStallsErrored === true || isGetPendingStallsSuccessful === false) {
		return <ErrorElement />;
	}

	let pollingPlace: PollingPlaceWithPendingStall | undefined;
	for (const item of electionsWithPendingStalls) {
		pollingPlace = item.booths.find((p) => ('id' in p ? p.id === urlPollingPlaceId : undefined));

		if (pollingPlace !== undefined) {
			break;
		}
	}

	if (pollingPlace === undefined) {
		return <NotFound />;
	}

	return <PendingStallsPollingPlace pollingPlace={pollingPlace} />;
}

const onDoneCreatingOrEditingNoop = () => {};

const onDeleteNoop = () => {};

type Props = {
	pollingPlace: PollingPlaceWithPendingStall;
};

function PendingStallsPollingPlace(props: Props) {
	const { pollingPlace } = props;

	const navigate = useNavigate();

	const notifications = useNotifications();
	const dialogs = useDialogs();

	const handleSubmitRef = useRef<UseFormHandleSubmit<IPollingPlaceStallModifiableProps>>();
	const setValueRef = useRef<UseFormSetValue<IPollingPlaceStallModifiableProps>>();
	const isDirtyRef = useRef<boolean>();

	const [isLoadingScreenShown, setIsLoadingScreenShown] = useState(false);

	// ######################
	// Approve Stall Query
	// ######################
	const [approveStall] = useApproveStallMutation();
	// ######################
	// Approve Stall Query (End)
	// ######################

	// ######################
	// Form Handling
	// ######################
	const onMergeChanges = useCallback(
		async (stallId: number, stall: Partial<IPollingPlaceStallModifiableProps>, approvalType: StallApprovalType) => {
			setIsLoadingScreenShown(true);

			try {
				// We await here (rather than the usual pattern) because these actions cause a refresh of pending stalls, which means this page shows an error (per Entrypoint above) if the polling place doesn't have any more pending stalls to process.
				// unwrap() ensures we catch errors from the API.
				await approveStall({
					stallId,
					pollingPlaceNoms: stall,
					approvalType,
				}).unwrap();

				setIsLoadingScreenShown(false);

				notifications.show('Stall approved, polling place updated', {
					severity: 'success',
					autoHideDuration: 3000,
				});

				// If this is the last stall to be triaged on this polling place, just head back to the pending stalls list...
				if (pollingPlace.pending_stalls.length === 1) {
					navigateToPendingStallsRoot(navigate);
				}
			} catch (err) {
				notifications.show(JSON.stringify(err), {
					severity: 'error',
				});

				setIsLoadingScreenShown(false);
			}
		},
		[approveStall, notifications.show, pollingPlace.pending_stalls.length, navigate],
	);

	const onDoneWithForm = useCallback(
		(stall: PendingStall, approvalType: StallApprovalType) => async (data: IPollingPlaceStallModifiableProps) => {
			// Prompt to confirm if there haven't been any changes to the form
			if (isDirtyRef.current === false) {
				const confirmed = await dialogs.confirm("There haven't been any changes made to the polling place.", {
					title: 'Are you sure?',
					okText: 'Go Ahead',
					cancelText: 'Cancel',
				});

				if (confirmed === false) {
					return;
				}
			}

			// Prompt to confirm if it doesn't look like the stall has been merged onto the polling place
			if (isStallMergedWithPollingPlace(stall, data) === false) {
				const confirmed = await dialogs.confirm(
					"It doesn't look like this stall's changes have been applied to the polling place.",
					{
						title: 'Are you sure?',
						okText: 'Go Ahead',
						cancelText: 'Cancel',
					},
				);

				if (confirmed === false) {
					return;
				}
			} else if (approvalType === StallApprovalType.ApproveAndMergeByHand) {
				// Prompt to confirm because isStallMergedWithPollingPlace() is very MVP
				const confirmed = await dialogs.confirm('Have you made all of the necessary changes to the polling place?', {
					title: 'Are you sure?',
					okText: 'Go Ahead',
					cancelText: 'Cancel',
				});

				if (confirmed === false) {
					return;
				}
			}

			if (isEmpty(data) === false) {
				onMergeChanges(stall.id, data, approvalType);
			}
		},
		[onMergeChanges, dialogs.confirm],
	);
	// ######################
	// Form Handling (End)
	// ######################

	// ######################
	// Decline Stall
	// ######################
	const [declineStall] = useDeclineStallMutation();

	const onDecline = useCallback(
		(stall: PendingStall) => async () => {
			const confirmed = await dialogs.confirm('Do you really want to decline this stall?', {
				title: 'Are you sure?',
				okText: 'Go Ahead',
				cancelText: 'Cancel',
			});

			if (confirmed === true) {
				setIsLoadingScreenShown(true);

				try {
					// We await here (rather than the usual pattern) because these actions cause a refresh of pending stalls, which means this page shows an error (per Entrypoint above) if the polling place doesn't have any more pending stalls to process.
					// unwrap() ensures we catch errors from the API.
					await declineStall(stall.id).unwrap();

					setIsLoadingScreenShown(false);

					notifications.show('Stall declined', {
						severity: 'success',
						autoHideDuration: 3000,
					});

					// If this is the last stall to be triaged on this polling place, just head back to the pending stalls list...
					if (pollingPlace.pending_stalls.length === 1) {
						navigateToPendingStallsRoot(navigate);
					}
				} catch (err) {
					notifications.show(JSON.stringify(err), {
						severity: 'error',
					});

					setIsLoadingScreenShown(false);
				}
			}
		},
		[dialogs.confirm, declineStall, notifications.show, pollingPlace.pending_stalls.length, navigate],
	);
	// ######################
	// Decline Stall (End)
	// ######################

	// ######################
	// Approve and Merge Automatically
	// ######################
	const onApproveAndMergeAutomatically = (stall: PendingStall) => () => {
		if (setValueRef.current !== undefined) {
			mergeStallWithPollingPlaceFormNomsAndUpdateForm(stall, pollingPlace, setValueRef.current);

			// Submit the form (this handles showing client-side validation errors)
			if (handleSubmitRef.current !== undefined) {
				handleSubmitRef.current(onDoneWithForm(stall, StallApprovalType.ApproveAndMegeAutomatically))();
			}
		}
	};
	// ######################
	// Approve and Merge Automatically (End)
	// ######################

	// ######################
	// Approve and Merge By Hand
	// ######################
	const onApproveAndMergeByHand = useCallback(
		(stall: PendingStall) => () => {
			// Submit the form (this handles showing client-side validation errors)
			if (handleSubmitRef.current !== undefined) {
				handleSubmitRef.current(onDoneWithForm(stall, StallApprovalType.ApproveAndMergeByHand))();
			}
		},
		[onDoneWithForm],
	);
	// ######################
	// Approve and Merge By Hand (End)
	// ######################

	// ######################
	// History and Submissions Dialog Management
	// ######################
	const [isPollingPlaceHistoryOpen, setIsPollingPlaceHistoryOpen] = useState(false);
	const onOpenPollingPlaceHistory = useCallback(() => setIsPollingPlaceHistoryOpen(true), []);
	const onClosePollingPlaceHistory = useCallback(() => setIsPollingPlaceHistoryOpen(false), []);

	const [isPollingPlaceSubmissionsOpen, setIsPollingPlaceSubmissionsOpen] = useState(false);
	const onOpenPollingPlaceSubmissions = useCallback(() => setIsPollingPlaceSubmissionsOpen(true), []);
	const onClosePollingPlaceSubmissions = useCallback(() => setIsPollingPlaceSubmissionsOpen(false), []);
	// ######################
	// History and Submissions Dialog Management (End)
	// ######################

	return (
		<React.Fragment>
			<Helmet>
				<title>{pollingPlace.premises || pollingPlace.name} | Pending Submissions | Democracy Sausage</title>
			</Helmet>

			<PageWrapper>
				{getPollingPlaceSummaryCardForHeading(pollingPlace)}

				<PendingStallsPollingPlaceAndStallsSummary
					pollingPlace={pollingPlace}
					onOpenPollingPlaceHistory={onOpenPollingPlaceHistory}
					onOpenPollingPlaceSubmissions={onOpenPollingPlaceSubmissions}
				/>

				<PendingStallsPollingPlaceStallsList
					pollingPlace={pollingPlace}
					stalls={pollingPlace.pending_stalls}
					onApproveAndMergeAutomatically={onApproveAndMergeAutomatically}
					onApproveAndMergeByHand={onApproveAndMergeByHand}
					onDecline={onDecline}
				/>

				<Card variant="outlined">
					<CardHeader
						sx={{
							p: 1,
							pb: 0,
							'& .MuiCardHeader-title': {
								fontSize: 18,
								fontWeight: 700,
							},
						}}
						avatar={
							<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} variant="rounded">
								<MapsHomeWork />
							</Avatar>
						}
						title="Polling Place"
					/>

					<CardContent
						sx={{
							pt: 0,
						}}
					>
						<PollingPlaceNomsEditorForm
							pollingPlace={pollingPlace}
							onDoneCreatingOrEditing={onDoneCreatingOrEditingNoop}
							isSaving={false}
							onDelete={onDeleteNoop}
							isDeleting={false}
							allowPasteOnTextFields={true}
							allowAppBarControl={false}
							handleSubmitRef={handleSubmitRef}
							setValueRef={setValueRef}
							isDirtyRef={isDirtyRef}
						/>
					</CardContent>
				</Card>

				{/* @TODO Navigation bar */}
				{/* <AppBar position="fixed" color="transparent" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
					<Toolbar sx={{ justifyContent: 'flex-start' }}>
						<Button
							size="small"
							startIcon={<FiberNewOutlined />}
							// sx={{
							// 	color: `${blueGrey.A700} !important`,
							// 	ml: '0px !important',
							// }}
						>
							Top
						</Button>

						<Button
							size="small"
							startIcon={<FiberNewOutlined />}
						>
							Sub 1
						</Button>

						<Button
							size="small"
							startIcon={<FiberNewOutlined />}
						>
							Sub 2
						</Button>

						<Button
							size="small"
							startIcon={<FiberNewOutlined />}
						>
							Booth
						</Button>
					</Toolbar>
				</AppBar> */}
			</PageWrapper>

			<Backdrop open={isLoadingScreenShown} sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}>
				<CircularProgress color="inherit" />
			</Backdrop>

			{isPollingPlaceHistoryOpen === true && <PendingStallPollingPlaceHistory onClose={onClosePollingPlaceHistory} />}

			{isPollingPlaceSubmissionsOpen === true && (
				<PendingStallPollingPlaceSubmissions onClose={onClosePollingPlaceSubmissions} />
			)}
		</React.Fragment>
	);
}

export default EntrypointLayer1;
