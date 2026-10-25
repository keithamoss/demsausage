import {
	Alert,
	AlertTitle,
	Button,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	Link,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDialogs, useNotifications } from '@toolpad/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ErrorElement from '../../../ErrorElement';
import { useAppSelector } from '../../../app/hooks';
import {
	type PendingUnofficialStall,
	type PendingUnofficialStallNearbyPollingPlace,
	StallStatus,
	StallSubmitterType,
	getStallSubmitterTypeName,
	getStallTipOffSourceDescriptionFromAdminPOV,
	useApproveUnofficialStallMutation,
	useDeclineUnofficialStallMutation,
	useGetPendingUnofficialStallsQuery,
	useMatchUnofficialStallMutation,
} from '../../../app/services/stalls';
import { isDevelopment, pluralise } from '../../../app/utils';
import { selectAllElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReactAvatar } from '../../icons/jurisdictionHelpers';
import { PendingStallsAllCaughtUp } from '../pendingStallsHelpers';
import { DetailsGrid, DiffValue, NomsIcons, getDiffFieldLabel, getWebsiteLink } from './pendingUnofficialStallsHelpers';

dayjs.extend(relativeTime);

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	paddingBottom: theme.spacing(2),
}));

const getGoogleMapsURL = (stall: PendingUnofficialStall) => {
	const [lon, lat] = stall.location_info.geom.coordinates;
	return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
};

// Tip-offs don't have a stall name
const getStallHeading = (stall: PendingUnofficialStall) => stall.name || stall.location_info.name;

const isPossibleDuplicate = (stall: PendingUnofficialStall) =>
	stall.election_polling_places_loaded === false && stall.nearby_polling_places.length > 0;

function PendingUnofficialStalls() {
	const notifications = useNotifications();
	const dialogs = useDialogs();

	// Note: There's no need to check the loading status or errored state here, we already do that in App.tsx
	const elections = useAppSelector((state) => selectAllElections(state));

	const {
		data: stalls,
		isLoading,
		isError,
	} = useGetPendingUnofficialStallsQuery(undefined, {
		pollingInterval: isDevelopment() === true ? 30000 : 5000,
		skipPollingIfUnfocused: true,
	});

	const [approveStall] = useApproveUnofficialStallMutation();
	const [declineStall] = useDeclineUnofficialStallMutation();
	const [matchStall] = useMatchUnofficialStallMutation();

	const [busyStallId, setBusyStallId] = useState<number | undefined>(undefined);

	const onMatch = useCallback(
		async (stall: PendingUnofficialStall, pollingPlace: PendingUnofficialStallNearbyPollingPlace) => {
			setBusyStallId(stall.id);

			try {
				await matchStall({ stallId: stall.id, pollingPlaceId: pollingPlace.id }).unwrap();

				notifications.show(
					`Matched to ${pollingPlace.premises || pollingPlace.name} - it's now in Pending Submissions`,
					{ severity: 'success', autoHideDuration: 3000 },
				);
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				notifications.show(
					'data' in err && typeof err.data?.error === 'string' ? err.data.error : JSON.stringify(err),
					{ severity: err.status === 418 ? 'warning' : 'error' },
				);
			}

			setBusyStallId(undefined);
		},
		[matchStall, notifications],
	);

	const onAction = useCallback(
		async (stall: PendingUnofficialStall, action: 'approve' | 'decline') => {
			if (action === 'approve' && isPossibleDuplicate(stall)) {
				const confirmed = await dialogs.confirm(
					`There's already an approved polling place within 100m of ${getStallHeading(stall)}. Approving creates a second polling place.`,
					{
						title: 'Approve a possible duplicate?',
						okText: 'Approve anyway',
						cancelText: 'Cancel',
					},
				);

				if (confirmed === false) {
					return;
				}
			}

			if (action === 'decline') {
				const confirmed = await dialogs.confirm(`Decline submission #${stall.id} for ${getStallHeading(stall)}?`, {
					title: 'Are you sure?',
					okText: 'Decline',
					cancelText: 'Cancel',
				});

				if (confirmed === false) {
					return;
				}
			}

			setBusyStallId(stall.id);

			try {
				await (action === 'approve' ? approveStall(stall.id) : declineStall(stall.id)).unwrap();

				notifications.show(action === 'approve' ? 'Stall approved and polling place added' : 'Stall declined', {
					severity: 'success',
					autoHideDuration: 3000,
				});
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (err: any) {
				notifications.show(
					'data' in err && typeof err.data?.error === 'string' ? err.data.error : JSON.stringify(err),
					{ severity: err.status === 418 ? 'warning' : 'error' },
				);
			}

			setBusyStallId(undefined);
		},
		[approveStall, declineStall, dialogs, notifications],
	);

	if (isLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isError === true || stalls === undefined) {
		return <ErrorElement />;
	}

	return (
		<PageWrapper>
			<Helmet>
				<title>Pending Unofficial Submissions | Democracy Sausage</title>
			</Helmet>

			{stalls.length === 0 && <PendingStallsAllCaughtUp />}

			{stalls.length > 0 && (
				<Alert severity="info" variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper' }}>
					<AlertTitle>Pending unofficial submissions</AlertTitle>
					Submissions for locations that aren&apos;t official polling places yet. Approving one creates an unofficial
					polling place, which the polling place loader matches to an official one when they&apos;re loaded.
				</Alert>
			)}

			<Stack spacing={1}>
				{stalls.map((stall, idx) => {
					const electionNameURLSafe = elections.find((e) => e.id === stall.election)?.name_url_safe;

					return (
						<React.Fragment key={stall.id}>
							{(idx === 0 || stalls[idx - 1].election !== stall.election) &&
								(() => {
									const election = elections.find((e) => e.id === stall.election);
									const count = stalls.filter((s) => s.election === stall.election).length;

									return (
										<Card variant="outlined" sx={{ mt: idx === 0 ? 0 : 2 }}>
											<CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
												<ListItem sx={{ p: 0 }}>
													{election !== undefined && (
														<ListItemAvatar>
															{getJurisdictionCrestStandaloneReactAvatar(election.jurisdiction)}
														</ListItemAvatar>
													)}
													<ListItemText
														sx={{ pl: 2, '& .MuiListItemText-primary': { fontSize: 15, fontWeight: 500 } }}
														primary={stall.election_name}
														secondary={`${count} pending unofficial ${pluralise('submission', count)}`}
													/>
												</ListItem>
											</CardContent>
										</Card>
									);
								})()}

							<Card
								variant="outlined"
								sx={isPossibleDuplicate(stall) ? { borderColor: 'error.main', borderWidth: 3 } : undefined}
							>
								<CardContent>
									{isPossibleDuplicate(stall) && (
										<Alert variant="filled" severity="error" sx={{ mb: 1 }}>
											<AlertTitle>Possible duplicate!</AlertTitle>
											There are already approved polling places within 100m. Check this isn&apos;t the same place before
											approving, or you&apos;ll create a second polling place.
											<ul style={{ margin: 0 }}>
												{stall.nearby_polling_places.map((pp) => (
													<li key={pp.id}>
														{pp.premises || pp.name}, {pp.address} ({pp.distance_m}m away){' '}
														{electionNameURLSafe !== undefined && (
															<Link
																href={`/polling-places/${electionNameURLSafe}/${pp.id}/`}
																target="_blank"
																rel="noopener noreferrer"
																color="inherit"
																sx={{ fontWeight: 500 }}
															>
																Edit polling place
															</Link>
														)}
													</li>
												))}
											</ul>
										</Alert>
									)}

									<Typography variant="h6">{getStallHeading(stall)}</Typography>
									<Typography variant="body2" color="text.secondary" gutterBottom>
										{stall.location_info.name}, {stall.location_info.address} ({stall.location_info.state}) &middot;{' '}
										<Link href={getGoogleMapsURL(stall)} target="_blank" rel="noopener noreferrer">
											View on map
										</Link>
									</Typography>

									<Stack spacing={1} sx={{ my: 1 }}>
										{stall.election_polling_places_loaded === true && (
											<Alert severity="info">
												This election now has official polling places, so this can&apos;t be approved here. Match it to
												an official polling place to send it to Pending Submissions.
												{stall.nearby_polling_places.length === 0 ? (
													<div>There are no official polling places within 1km.</div>
												) : (
													<ul style={{ margin: 0 }}>
														{stall.nearby_polling_places.map((pp) => (
															<li key={pp.id}>
																{pp.premises || pp.name}, {pp.address} ({pp.distance_m}m away){' '}
																<Button
																	size="small"
																	disabled={busyStallId !== undefined}
																	onClick={() => onMatch(stall, pp)}
																>
																	Match
																</Button>
															</li>
														))}
													</ul>
												)}
											</Alert>
										)}

										{stall.election_polling_places_loaded === false && stall.state_matches_election === false && (
											<Alert severity="warning">
												The submitted state &apos;{stall.location_info.state}&apos; doesn&apos;t match this
												election&apos;s jurisdiction ({stall.election_jurisdiction.toUpperCase()}).
											</Alert>
										)}

										{stall.election_polling_places_loaded === false && stall.polling_place_state === null && (
											<Alert severity="error">
												Unofficial stalls can&apos;t be approved here for federal elections.
											</Alert>
										)}

										{stall.previous_status === StallStatus.Declined && (
											<Alert severity="warning">
												Previously declined by {stall.triaged_by_name || 'Unknown'}
												{stall.triaged_on !== null && ` on ${dayjs(stall.triaged_on).format('D MMM YYYY HH:mm')}`} and
												since edited by the submitter.
												{stall.diff !== null && stall.diff.length > 0 && (
													<ul style={{ margin: 0 }}>
														{stall.diff.map((change) => (
															<li key={change.field}>
																<strong>{getDiffFieldLabel(change.field)}:</strong> <DiffValue value={change.old} />{' '}
																&rarr; <DiffValue value={change.new} />
															</li>
														))}
													</ul>
												)}
											</Alert>
										)}

										{stall.nearby_pending_stalls.length > 0 && (
											<Alert severity="warning">
												Other pending submissions within 100m, which may be for the same place:
												<ul style={{ margin: 0 }}>
													{stall.nearby_pending_stalls.map((other) => (
														<li key={other.id}>
															#{other.id} {other.name} ({other.distance_m}m away)
														</li>
													))}
												</ul>
											</Alert>
										)}
									</Stack>

									<DetailsGrid
										rows={[
											['Submission', `#${stall.id} · ${getStallSubmitterTypeName(stall.submitter_type)}`],
											[
												'Submitted',
												<Tooltip key="submitted" title={dayjs(stall.reported_timestamp).format('D MMMM YYYY HH:mm')}>
													<span>{dayjs(stall.reported_timestamp).fromNow()}</span>
												</Tooltip>,
											],
											...(stall.owner_edit_timestamp !== null
												? ([
														[
															'Last edited',
															<Tooltip
																key="edited"
																title={dayjs(stall.owner_edit_timestamp).format('D MMMM YYYY HH:mm')}
															>
																<span>{dayjs(stall.owner_edit_timestamp).fromNow()}</span>
															</Tooltip>,
														],
													] as [string, React.ReactNode][])
												: []),
											[
												'Email',
												<Link key="email" href={`mailto:${stall.email}`}>
													{stall.email}
												</Link>,
											],
											...(stall.submitter_type === StallSubmitterType.Owner
												? ([
														['Description', stall.description || '-'],
														['Opening hours', stall.opening_hours || '-'],
														['Website', getWebsiteLink(stall.website || '')],
													] as [string, React.ReactNode][])
												: []),
											...(stall.submitter_type !== StallSubmitterType.Owner &&
											(stall.tipoff_source !== '' || stall.tipoff_source_other !== '')
												? ([
														[
															'Source',
															stall.tipoff_source !== ''
																? getStallTipOffSourceDescriptionFromAdminPOV(
																		stall.submitter_type,
																		stall.tipoff_source,
																		stall.tipoff_source_other,
																	)
																: stall.tipoff_source_other,
														],
													] as [string, React.ReactNode][])
												: []),
											['Food & drink', <NomsIcons key="noms" noms={stall.noms} />],
										]}
									/>
								</CardContent>

								<CardActions>
									<Button
										variant="contained"
										color={isPossibleDuplicate(stall) ? 'warning' : 'primary'}
										disabled={
											busyStallId !== undefined ||
											stall.polling_place_state === null ||
											stall.election_polling_places_loaded === true
										}
										onClick={() => onAction(stall, 'approve')}
									>
										{isPossibleDuplicate(stall) ? 'Approve anyway' : 'Approve'}
									</Button>
									<Button
										variant="outlined"
										color="error"
										disabled={busyStallId !== undefined}
										onClick={() => onAction(stall, 'decline')}
									>
										Decline
									</Button>
								</CardActions>
							</Card>
						</React.Fragment>
					);
				})}
			</Stack>
		</PageWrapper>
	);
}

export default PendingUnofficialStalls;
