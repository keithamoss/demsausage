import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirectionsIcon from '@mui/icons-material/Directions';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import PublicIcon from '@mui/icons-material/Public';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	Avatar,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	ListItemIcon,
	Snackbar,
	useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useCallback, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { navigateToMapUsingURLParamsWithoutUpdatingTheView } from '../../app/routing/navigationHelpers';
import { Election } from '../../app/services/elections';
import { mapaThemePrimaryGrey, mapaThemePrimaryPurple } from '../../app/ui/theme';
import { getBaseURL, isClipboardApiSupported, isWebShareApiSupported } from '../../app/utils';
import { isElectionLive } from '../elections/electionHelpers';
import RedCrossOfShame from '../icons/red-cross-of-shame';
import RunOut from '../icons/run-out';
import { getNomsIconsForPollingPlace } from '../search/searchBarHelpers';
import {
	getPollingPlaceDivisionsDescriptiveText,
	getPollingPlaceNomsDescriptiveText,
	getPollingPlacePermalinkFromElectionAndPollingPlace,
	getSausageChanceDescription,
	getSausageChanceDescriptionSubheader,
	getStallWebsiteDomainName,
	getStallWebsiteWithProtocol,
	isStallWebsiteValid,
	pollingPlaceHasReportsOfNoms,
} from './pollingPlaceHelpers';
import { IPollingPlace } from './pollingPlacesInterfaces';

const StyledCardHeader = styled(CardHeader)(() => ({
	// pointerEvents: "all",
}));

const FlexboxIcons = styled('div')(() => ({
	flexGrow: 1,
	marginLeft: 1,
	svg: {
		marginRight: '10px',
	},
}));

const StyledSectionHeadingDivider = styled(Divider)(({ theme }) => ({
	paddingTop: theme.spacing(1),
	paddingBottom: theme.spacing(1),
}));

const StyledSectionHeadingChip = styled(Chip)(() => ({ fontWeight: 700, color: mapaThemePrimaryGrey }));

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	'& .MuiListItemText-primary': {
		color: mapaThemePrimaryGrey,
		fontWeight: 700,
	},
}));

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

interface Props {
	pollingPlace: IPollingPlace;
	election: Election;
}

export default function PollingPlaceCard(props: Props) {
	const { pollingPlace, election } = props;

	const theme = useTheme();

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const cameFromInternalNavigation = (location.state as LocationState)?.cameFromInternalNavigation === true;

	// const nomsReader = pollingPlace.stall !== null ? new NomsReader(pollingPlace.stall.noms) : undefined;

	const onClose = useCallback(() => {
		// If we've arrived here by searching in the UI, we know we can just
		// go back and we'll remain within the search drawer interface.
		// In most cases, this should send them back to the list of
		// polling place search results for them to choose a different place from.
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to the map.
			navigateToMapUsingURLParamsWithoutUpdatingTheView(params, navigate);
		}
	}, [cameFromInternalNavigation, navigate, params]);

	// ######################
	// Copy To Clipboard
	// ######################
	const [isCopyToClipboardSnackbarShown, setIsCopyToClipboardSnackbarShown] = useState(false);

	const onCopyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(
				`${getBaseURL()}${getPollingPlacePermalinkFromElectionAndPollingPlace(election, pollingPlace)}`,
			);
			setIsCopyToClipboardSnackbarShown(true);
		} catch {
			/* empty */
		}
	}, [election, pollingPlace]);

	const onSnackbarClose = useCallback(() => setIsCopyToClipboardSnackbarShown(false), []);
	// ######################
	// Copy To Clipboard (End)
	// ######################

	// ######################
	// Share Link
	// ######################
	const onShareLink = useCallback(() => {
		const shareData = {
			title: `${pollingPlace.premises || pollingPlace.name} | Democracy Sausage | ${election.name}`,
			url: `${getBaseURL()}${getPollingPlacePermalinkFromElectionAndPollingPlace(election, pollingPlace)}`,
		};

		if (navigator.canShare(shareData)) {
			navigator.share(shareData);
		} else {
			// Don't worry about handling a fail on canShare() or share()
		}
	}, [election, pollingPlace]);
	// ######################
	// Share Link (End)
	// ######################

	// ######################
	// Visit Stall Website
	// ######################
	const [isVisitStallWebsiteConfirmDialogShown, setIsVisitStallWebsiteConfirmDialogShown] = useState(false);

	const onVisitStallWebsite = useCallback(() => setIsVisitStallWebsiteConfirmDialogShown(true), []);

	const onVisitStallWebsiteConfirmOK = useCallback(() => {
		setIsVisitStallWebsiteConfirmDialogShown(false);

		// https://stackoverflow.com/a/11384018/7368493
		window.open(getStallWebsiteWithProtocol(pollingPlace.stall?.website), '_blank')?.focus();
	}, [pollingPlace.stall?.website]);

	const onVisitStallWebsiteConfirmNope = useCallback(() => setIsVisitStallWebsiteConfirmDialogShown(false), []);
	// ######################
	// Visit Stall Website (End)
	// ######################

	return (
		<Box sx={{ width: '100%' }}>
			<Stack spacing={1}>
				<Card variant="outlined" sx={{ border: 0 }}>
					<StyledCardHeader
						action={
							<IconButton onClick={onClose}>
								<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
							</IconButton>
							// <IconButton onClick={onClose} size="large">
							// 	<HighlightOffIcon sx={{ color: mapaThemePrimaryPurple, fontSize: '32px' }} />
							// </IconButton>
						}
						title={pollingPlace.premises || pollingPlace.name}
						subheader={pollingPlace.address}
						sx={{ paddingBottom: 0, '& .MuiCardHeader-title': { fontWeight: 500, color: 'rgb(0,0,0)' } }}
					/>

					{isElectionLive(election) === true && pollingPlace.stall === null && (
						<CardContent sx={{ paddingBottom: 1 }}>
							<Button
								startIcon={<SendIcon />}
								variant="contained"
								size="large"
								color="secondary"
								style={{ float: 'right', marginLeft: theme.spacing(2) }}
							>
								Send tip-off
							</Button>

							<Typography component={'p'} sx={{ fontSize: 14 }} color="text.secondary">
								We don&lsquo;t have any reports for the polling place yet. If you find any stalls here, be sure to let
								us know!
							</Typography>
						</CardContent>
					)}

					<CardContent>
						{isElectionLive(election) === true && pollingPlace.stall === null && (
							<React.Fragment>
								<StyledSectionHeadingDivider>
									<StyledSectionHeadingChip label="OUR PREDICTION" />
								</StyledSectionHeadingDivider>

								<CardHeader
									avatar={
										<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }}>
											<CasinoIcon />
										</Avatar>
									}
									title={getSausageChanceDescription(pollingPlace)}
									subheader={getSausageChanceDescriptionSubheader(pollingPlace)}
									// mB 0.5 here to give a little more space on the bottom to match what we see above the <Avatar>
									sx={{ paddingTop: 1, paddingBottom: 1, marginBottom: 0.5 }}
								/>
							</React.Fragment>
						)}

						<FlexboxIcons>
							<FlexboxIcons>{getNomsIconsForPollingPlace(pollingPlace, false)}</FlexboxIcons>
						</FlexboxIcons>

						{pollingPlace.stall !== null && (
							<React.Fragment>
								{/* NOTE: We set pB here because we have a lot of elements that may be the first element in different scenarios, so it's easier just to have the required padding on the divider than trying to detect which element is first. */}
								<StyledSectionHeadingDivider sx={{ paddingBottom: 2 }}>
									<StyledSectionHeadingChip label="STALL" />
								</StyledSectionHeadingDivider>

								{pollingPlace.stall.noms.nothing === true && (
									<List dense sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}>
										<StyledListItem disableGutters>
											<StyledListItemIcon>
												<RedCrossOfShame sx={{ color: mapaThemePrimaryGrey }} />
											</StyledListItemIcon>

											<StyledListItemText
												primary="Sausageless!"
												secondary="Our roving reporters have informed us that there's no stall here."
											/>
										</StyledListItem>
									</List>
								)}

								{pollingPlace.stall.name !== '' && (
									<Typography
										variant="h5"
										sx={{
											fontSize: 16,
											fontWeight: 500,
											color: 'rgb(0,0,0)',
											paddingBottom: 1,
										}}
									>
										{pollingPlace.stall.name}
									</Typography>
								)}

								{pollingPlace.stall.description !== '' && (
									<Typography variant="body2" sx={{ marginBottom: 2, whiteSpace: 'break-spaces' }}>
										{pollingPlace.stall.description}
									</Typography>
								)}

								<List dense sx={{ paddingBottom: 0, paddingTop: 0, marginBottom: 0 }}>
									{pollingPlace.stall.noms.run_out === true && (
										<StyledListItem disableGutters>
											<StyledListItemIcon>
												<RunOut />
											</StyledListItemIcon>

											<StyledListItemText
												primary="Sold out!"
												secondary="Our roving reporters have informed us that they've run out of food."
											/>
										</StyledListItem>
									)}

									{pollingPlaceHasReportsOfNoms(pollingPlace) === true && (
										<StyledListItem disableGutters>
											<StyledListItemIcon>
												<RestaurantIcon sx={{ color: mapaThemePrimaryGrey }} />
											</StyledListItemIcon>

											<StyledListItemText
												primary="On Offer"
												secondary={getPollingPlaceNomsDescriptiveText(pollingPlace)}
												sx={{
													'& .MuiListItemText-secondary:first-letter': { textTransform: 'capitalize' },
												}}
											/>
										</StyledListItem>
									)}

									{pollingPlace.stall.opening_hours !== '' && (
										<StyledListItem disableGutters>
											<StyledListItemIcon>
												<AccessTimeIcon sx={{ color: mapaThemePrimaryGrey }} />
											</StyledListItemIcon>

											<StyledListItemText primary="Stall Open" secondary={pollingPlace.stall.opening_hours} />
										</StyledListItem>
									)}
								</List>
							</React.Fragment>
						)}

						<StyledSectionHeadingDivider>
							<StyledSectionHeadingChip label="POLLING PLACE" />
						</StyledSectionHeadingDivider>

						<List dense sx={{ paddingBottom: 0, paddingTop: 1 }}>
							{pollingPlace.entrance_desc !== '' && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<DirectionsIcon sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="Entrance" secondary={pollingPlace.entrance_desc} />
								</StyledListItem>
							)}

							<StyledListItem disableGutters>
								<StyledListItemIcon>
									<AccessibleForwardIcon sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>

								<StyledListItemText primary="Wheelchair Access" secondary={pollingPlace.wheelchair_access} />
							</StyledListItem>

							{pollingPlace.wheelchair_access_description.length >= 1 && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<AccessibleForwardIcon sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Wheelchair Access Information"
										secondary={pollingPlace.wheelchair_access_description}
									/>
								</StyledListItem>
							)}

							{pollingPlace.divisions.length >= 1 && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<CheckCircleOutlineIcon sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary={pollingPlace.divisions.length >= 2 ? 'Divisions' : 'Divison'}
										secondary={getPollingPlaceDivisionsDescriptiveText(pollingPlace)}
									/>
								</StyledListItem>
							)}

							{pollingPlace.booth_info.length >= 1 && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<InfoOutlinedIcon sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Booth Information"
										secondary={pollingPlace.booth_info}
										sx={{
											mt: 0,
											'& .MuiListItemText-secondary': { textTransform: 'capitalize' },
										}}
									/>
								</StyledListItem>
							)}
						</List>

						<Divider sx={{ paddingTop: 2, paddingBottom: 0, mb: 0 }}></Divider>
					</CardContent>

					<CardActions sx={{ pl: 2, pt: 0 }}>
						{isClipboardApiSupported() === true && (
							<Button startIcon={<ContentCopyIcon />} size="small" onClick={onCopyToClipboard}>
								Copy Link
							</Button>
						)}

						{isWebShareApiSupported() === true && (
							<Button startIcon={<IosShareIcon />} size="small" onClick={onShareLink}>
								Share
							</Button>
						)}

						{isStallWebsiteValid(pollingPlace.stall?.website) && (
							<Button startIcon={<PublicIcon />} size="small" onClick={onVisitStallWebsite}>
								Stall Website
							</Button>
						)}
					</CardActions>
				</Card>
			</Stack>

			<Snackbar open={isCopyToClipboardSnackbarShown} autoHideDuration={6000} onClose={onSnackbarClose}>
				<Alert severity="info" variant="filled" sx={{ width: '100%' }}>
					Polling place link copied
				</Alert>
			</Snackbar>

			<Dialog open={isVisitStallWebsiteConfirmDialogShown} onClose={onVisitStallWebsiteConfirmNope}>
				<DialogTitle>Visit this stall&apos;s website</DialogTitle>

				<DialogContent>
					You&apos;re about to leave Demoracy Sausage and visit&nbsp;
					<Typography variant="overline" display="inline-block">
						{getStallWebsiteDomainName(pollingPlace.stall?.website) || 'Unknown Domain'}
					</Typography>
				</DialogContent>

				<DialogActions>
					<Button autoFocus onClick={onVisitStallWebsiteConfirmNope}>
						No thanks
					</Button>
					<Button onClick={onVisitStallWebsiteConfirmOK}>OK</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
