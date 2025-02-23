import {
	Approval,
	DoNotDisturbOn,
	Edit,
	FiberNew,
	History,
	NewReleases,
	OpenInNew,
	Radar,
	Storefront,
} from '@mui/icons-material';
import {
	Alert,
	Button,
	Card,
	CardActions,
	CardContent,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	styled,
} from '@mui/material';
import { type PollingPlaceWithPendingStall, StallStatus } from '../../../app/services/stalls';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { getPublicSiteBaseURL, pluralise } from '../../../app/utils';
import { getPollingPlacePermalinkFromProps } from '../../pollingPlaces/pollingPlaceHelpers';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	padding: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({ paddingLeft: theme.spacing(1) }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

interface Props {
	pollingPlace: PollingPlaceWithPendingStall;
	onOpenPollingPlaceHistory: () => void;
	onOpenPollingPlaceSubmissions: () => void;
}

export default function PendingStallsPollingPlaceAndStallsSummary(props: Props) {
	const { pollingPlace, onOpenPollingPlaceHistory, onOpenPollingPlaceSubmissions } = props;

	const pendingStallsNewCount = pollingPlace.pending_stalls.filter((s) => s.triaged_on === null).length;

	const pendingStallsApprovedWithEditsCount = pollingPlace.pending_stalls.filter(
		(s) => s.triaged_on !== null && s.previous_status === StallStatus.Approved,
	).length;

	const pendingStallsDeclinedWithEditsCount = pollingPlace.pending_stalls.filter(
		(s) => s.triaged_on !== null && s.previous_status === StallStatus.Declined,
	).length;

	return (
		<Card variant="outlined" sx={{ mt: 2 }}>
			<StyledCardContent>
				{pollingPlace.stall === null && (
					<Alert severity="success" icon={<NewReleases />} sx={{ mb: 1 }}>
						This polling place doesn&apos;t have any stall data yet.
					</Alert>
				)}

				{pollingPlace.stall !== null && pollingPlace.previous_subs.approved === 0 && (
					<Alert severity="success" icon={<Radar />} sx={{ mb: 1 }}>
						This polling place already has some stall data that was sourced by one of us.
					</Alert>
				)}

				<List dense sx={{ pt: 0, pb: 0 }}>
					{pendingStallsNewCount > 0 && (
						<StyledListItem>
							<StyledListItemIcon>
								<FiberNew sx={{ color: mapaThemePrimaryGrey }} />
							</StyledListItemIcon>

							<ListItemText
								primary={`${pendingStallsNewCount} new ${pluralise('submission', pendingStallsNewCount)}`}
							/>
						</StyledListItem>
					)}

					{pendingStallsApprovedWithEditsCount > 0 && (
						<StyledListItem>
							<StyledListItemIcon>
								<Edit sx={{ color: mapaThemePrimaryGrey }} />
							</StyledListItemIcon>

							<ListItemText
								primary={`${pendingStallsApprovedWithEditsCount} approved ${pluralise('submission', pendingStallsApprovedWithEditsCount)} with edits`}
							/>
						</StyledListItem>
					)}

					{pollingPlace.previous_subs.approved > 0 &&
						pollingPlace.previous_subs.approved > pendingStallsApprovedWithEditsCount && (
							<StyledListItem>
								<StyledListItemIcon>
									<Approval sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>

								<ListItemText
									primary={`${pollingPlace.previous_subs.approved - pendingStallsApprovedWithEditsCount} approved ${pluralise('submission', pollingPlace.previous_subs.approved - pendingStallsApprovedWithEditsCount)}`}
								/>
							</StyledListItem>
						)}

					{pendingStallsDeclinedWithEditsCount > 0 && (
						<StyledListItem>
							<StyledListItemIcon>
								<Edit sx={{ color: mapaThemePrimaryGrey }} />
							</StyledListItemIcon>

							<ListItemText
								primary={`${pendingStallsDeclinedWithEditsCount} declined ${pluralise('submission', pendingStallsDeclinedWithEditsCount)} with edits`}
							/>
						</StyledListItem>
					)}

					{pollingPlace.previous_subs.denied > 0 &&
						pollingPlace.previous_subs.denied > pendingStallsDeclinedWithEditsCount && (
							<StyledListItem>
								<StyledListItemIcon>
									<DoNotDisturbOn sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>

								<ListItemText
									primary={`${pollingPlace.previous_subs.denied - pendingStallsDeclinedWithEditsCount} declined ${pluralise('submission', pollingPlace.previous_subs.denied - pendingStallsDeclinedWithEditsCount)}`}
								/>
							</StyledListItem>
						)}
				</List>
			</StyledCardContent>

			<CardActions sx={{ pt: 0 }}>
				<Button size="small" startIcon={<History />} onClick={onOpenPollingPlaceHistory}>
					History
				</Button>

				<Button size="small" startIcon={<Storefront />} onClick={onOpenPollingPlaceSubmissions}>
					Submissions
				</Button>

				<Button
					startIcon={<OpenInNew />}
					href={`${getPublicSiteBaseURL()}${getPollingPlacePermalinkFromProps(
						pollingPlace.election_name_url_safe,
						pollingPlace.name,
						pollingPlace.premises,
						pollingPlace.state,
					)}`}
					target="_blank"
				>
					Open
				</Button>
			</CardActions>
		</Card>
	);
}
