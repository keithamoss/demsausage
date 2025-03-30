import { Approval, Close, DoNotDisturb, QuestionMark } from '@mui/icons-material';
import {
	Alert,
	AlertTitle,
	AppBar,
	IconButton,
	Link,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateToPollingPlaceSearchResultsFromElectionAndSearchTermDirectly } from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import type { Election } from '../../app/services/elections';
import {
	type ElectionPendingStallsLatestChanges,
	StallStatus,
	useGetPendingStallsQuery,
} from '../../app/services/stalls';
import { DialogWithTransition } from '../../app/ui/dialog';

interface EntrpointProps {
	election: Election;
	onClose: () => void;
}

function ElectionPendingStallsLatestChangesEntrypoint(props: EntrpointProps) {
	const { election, onClose } = props;

	// Note: There's no need to check the loading status or errored state here, we already do that in App.tsx
	const { data: electionsWithPendingStalls } = useGetPendingStallsQuery();

	const pendingStallsForElection = electionsWithPendingStalls?.find((i) => i.election_id === election.id);

	if (pendingStallsForElection === undefined) {
		// return <ErrorElement />;

		return (
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<Close />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Latest Changes
						</Typography>
					</Toolbar>
				</AppBar>

				<Alert severity="warning" sx={{ mt: 2 }}>
					<AlertTitle>Oops!</AlertTitle>
					We currently can't show the "Latest changes" view while there isn't at least one pending stall. We'll fix this
					later.
				</Alert>
			</DialogWithTransition>
		);
	}

	return (
		<ElectionPendingStallsLatestChangesList
			election={election}
			latest_changes={pendingStallsForElection.latest_changes}
			onClose={onClose}
		/>
	);
}

type Props = {
	election: Election;
	latest_changes: ElectionPendingStallsLatestChanges[];
	onClose: () => void;
};

function ElectionPendingStallsLatestChangesList(props: Props) {
	const { election, latest_changes, onClose } = props;

	const navigate = useNavigate();

	const onNavigateToPollingPlace = useCallback(
		(pollingPlaceName: string) => () => {
			navigateToPollingPlaceSearchResultsFromElectionAndSearchTermDirectly(navigate, election, pollingPlaceName);
		},
		[navigate, election],
	);

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<Close />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Latest Changes
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ p: 2 }}>
				<Typography variant="body1" sx={{ mb: 2 }}>
					These are the latest changes made to approve or decline submissions for this election.
				</Typography>

				<List sx={{ pt: 0 }}>
					{latest_changes.map((item) => (
						<Paper key={item.history_id} variant="outlined" sx={{ mb: 1 }}>
							<ListItem>
								<ListItemIcon>
									{item.status === StallStatus.Approved ? (
										<Approval />
									) : item.status === StallStatus.Declined ? (
										<DoNotDisturb />
									) : (
										<QuestionMark />
									)}
								</ListItemIcon>

								<ListItemText
									primary={
										<React.Fragment>
											{item.triaged_by} {item.status.toLowerCase()} submission #{item.stall_id} at{' '}
											<Link onClick={onNavigateToPollingPlace(item.polling_place_name)}>{item.polling_place_name}</Link>
										</React.Fragment>
									}
									secondary={`${dayjs(item.datetime).format('D MMMM YYYY')} at ${dayjs(item.datetime).format('HH:mm')}`}
								/>
							</ListItem>
						</Paper>
					))}
				</List>
			</Paper>
		</DialogWithTransition>
	);
}

export default ElectionPendingStallsLatestChangesEntrypoint;
