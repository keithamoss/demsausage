import EmailIcon from '@mui/icons-material/Email';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import {
	Alert,
	AlertTitle,
	Box,
	Card,
	CardActions,
	CardContent,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Stack,
	Typography,
	styled,
} from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
import dayjs from 'dayjs';
import React from 'react';
import { useGetPollingPlaceStallsByIdQuery } from '../../app/services/pollingPlaces';
import { IconsFlexboxHorizontalSummaryRow } from '../icons/iconHelpers';
import { getNomsIconsBar, wrapIconWithTooltip } from './pollingPlaceSearchHelpers';
import { getStallStatusElement, getStallSubmitterTypeElement } from './pollingPlaceStallsHelpers';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
	paddingLeft: theme.spacing(1.5),
	// A bit more than the usual 1 because the 'contained' variant Approved/Denied/Pending buttons make the padding look visually smaller than the equivalents on the search cards
	paddingBottom: theme.spacing(1.5),
}));

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	minWidth: 36,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	marginBottom: 0,
	'& .MuiListItemText-primary': {
		color: blueGrey.A700,
	},
}));

interface Props {
	pollingPlaceId: number;
}

export default function PollingPlaceStallsList(props: Props) {
	const { pollingPlaceId } = props;

	const {
		data: pollingPlaceStalls,
		isFetching: isFetchingPollingPlaceStalls,
		isSuccess: isSuccessFetchingPollingPlaceStalls,
	} = useGetPollingPlaceStallsByIdQuery(pollingPlaceId);

	return (
		<React.Fragment>
			{isFetchingPollingPlaceStalls === true && <LinearProgress color="secondary" />}

			{isFetchingPollingPlaceStalls === false &&
				isSuccessFetchingPollingPlaceStalls === true &&
				pollingPlaceStalls.length === 0 && (
					<Alert severity="info">
						<AlertTitle>No stalls found</AlertTitle>
						There haven&apos;t been any stalls have been submitted yet for this polling place during this election.
					</Alert>
				)}

			{isFetchingPollingPlaceStalls === false &&
				isSuccessFetchingPollingPlaceStalls === true &&
				pollingPlaceStalls.length > 0 && (
					<Stack spacing={1}>
						{pollingPlaceStalls.map((stall) => (
							<Card key={stall.id} variant="outlined">
								<StyledCardContent>
									<Box>
										<IconsFlexboxHorizontalSummaryRow>
											{getNomsIconsBar(stall.noms, true, true)}
										</IconsFlexboxHorizontalSummaryRow>

										<Typography
											variant="h5"
											component="div"
											sx={{
												fontSize: 16,
												fontWeight: 500,
											}}
										>
											{stall.name || <em>No stall name supplied</em>}
										</Typography>

										<Typography color="text.secondary" sx={{ fontSize: 15 }}>
											{stall.description || <em>No stall description supplied</em>}
										</Typography>
									</Box>

									<List dense sx={{ paddingBottom: 1, paddingTop: 1 }}>
										<StyledListItem disableGutters>
											{wrapIconWithTooltip(
												<StyledListItemIcon>
													<EmailIcon
														sx={{
															color: blueGrey.A700,
														}}
													/>
												</StyledListItemIcon>,
												'Reported by',
											)}

											<StyledListItemText primary={stall.email} />
										</StyledListItem>

										<StyledListItem disableGutters>
											{wrapIconWithTooltip(
												<StyledListItemIcon>
													<WatchLaterIcon
														sx={{
															color: blueGrey.A700,
														}}
													/>
												</StyledListItemIcon>,
												'Reported on',
											)}

											<StyledListItemText
												primary={`${dayjs(stall.reported_timestamp).format('D MMMM YYYY')} at
											${dayjs(stall.reported_timestamp).format('HH:mm')}`}
											/>
										</StyledListItem>
									</List>
								</StyledCardContent>

								<StyledCardActions>
									{getStallStatusElement(stall.status, stall.previous_status)}

									{getStallSubmitterTypeElement(stall)}
								</StyledCardActions>
							</Card>
						))}
					</Stack>
				)}
		</React.Fragment>
	);
}
