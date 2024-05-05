import PublicIcon from '@mui/icons-material/Public';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirectionsIcon from '@mui/icons-material/Directions';
import IosShareIcon from '@mui/icons-material/IosShare';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

import { Avatar, Chip, Divider, useTheme } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { navigateToSearchDrawer } from '../../app/routing/navigationHelpers';
import { Election } from '../../app/services/elections';
import { isElectionLive } from '../elections/electionHelpers';
import { NomsReader } from '../map/noms';
import { getNomsIconsForPollingPlace } from '../map/searchBar/searchBarHelpers';
import {
	getPollingPlaceDivisionsDescriptiveText,
	getPollingPlaceNomsDescriptiveText,
	getSausageChancColourIndicator,
	getSausageChanceDescription,
	getSausageChanceDescriptionSubheader,
	pollingPlaceHasReports,
	pollingPlaceHasReportsOfNoms,
} from './pollingPlaceHelpers';
import { IPollingPlace } from './pollingPlacesInterfaces';

const FlexboxIcons = styled('div')(() => ({
	flexGrow: 1,
	svg: {
		paddingRight: '5px',
		paddingBottom: '5px',
		width: '55px',
	},
}));

const StyledCardHeader = styled(CardHeader)(() => ({
	// pointerEvents: "all",
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

	const nomsReader = pollingPlace.stall !== null ? new NomsReader(pollingPlace.stall.noms) : undefined;

	const onClose = () => {
		// If we've arrived here by searching in the UI, we know we can just
		// go back and we'll remain within the search drawer interface.
		// In most cases, this should send them back to the list of
		// polling place search results for them to choose a different place from,
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to start a brand new search.
			navigateToSearchDrawer(params, navigate);
		}
	};

	// @TODO How to make it clear post-election that a booth had no reports?

	// @TODO Create a debug page that shows all of the possible states somehow? (based on actual data from past elections?)

	// @TODO Allow for multi-paragraph stall descriptions

	return (
		<Box sx={{ width: '100%' }}>
			<Stack spacing={1}>
				<Card variant="outlined" sx={{ border: 0 }}>
					<StyledCardHeader
						action={
							<IconButton aria-label="settings" onClick={onClose}>
								<CloseIcon />
							</IconButton>
						}
						title={pollingPlace.premises || pollingPlace.name}
						subheader={pollingPlace.address}
						sx={{ paddingBottom: 0 }}
					/>

					{isElectionLive(election) !== undefined &&
						(nomsReader === undefined || nomsReader.hasAnyNoms() === false) && (
							<CardContent sx={{ paddingBottom: 1 }}>
								<Button
									startIcon={<SendIcon />}
									variant="contained"
									size="large"
									color="secondary"
									style={{ float: 'right', marginLeft: theme.spacing(1) }}
								>
									Send tip-off
								</Button>

								<Typography component={'p'} sx={{ fontSize: 14 }} color="text.secondary">
									We don&lsquo;t have any reports for the polling place yet. If you find any stalls here, be sure to let
									us know!
								</Typography>
							</CardContent>
						)}

					{isElectionLive(election) !== undefined && pollingPlaceHasReports(pollingPlace) === false && (
						<React.Fragment>
							<Divider sx={{ paddingTop: 1, paddingBottom: 1 }}>
								<Chip label="OUR PREDICTION" />
							</Divider>

							<CardHeader
								avatar={
									<Avatar sx={{ bgcolor: getSausageChancColourIndicator(pollingPlace) }} aria-label="recipe">
										<CasinoIcon />
									</Avatar>
								}
								title={getSausageChanceDescription(pollingPlace)}
								subheader={getSausageChanceDescriptionSubheader(pollingPlace)}
								sx={{ paddingTop: 1, paddingBottom: 0 }}
							/>
						</React.Fragment>
					)}

					<CardContent>
						{/* {isElectionLive(election) !== undefined &&
							(nomsReader === undefined || nomsReader.hasAnyNoms() === false) && (
								<React.Fragment>
									<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
										We don&lsquo;t have any reports for the polling place yet.
									</Typography>
									<Button startIcon={<SendIcon />} variant="contained" size="large" color="secondary">
										Send us a tip-off
									</Button>
								</React.Fragment>
							)} */}

						<FlexboxIcons>
							<FlexboxIcons>{getNomsIconsForPollingPlace(pollingPlace)}</FlexboxIcons>
						</FlexboxIcons>

						{pollingPlace.stall !== null && (
							<React.Fragment>
								<Divider sx={{ paddingTop: 1, paddingBottom: 1 }}>
									<Chip label="DESCRIPTION" />
								</Divider>

								{/* <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    Word of the Day
                  </Typography> */}

								<Typography
									variant="h5"
									sx={{
										fontSize: 16,
										fontWeight: 550,
										textTransform: 'uppercase',
										paddingTop: 1,
										paddingBottom: 1,
									}}
								>
									{pollingPlace.stall?.name}
								</Typography>
								<Typography variant="body2">
									{/* Family and Friends of South Melbourne Park Primary bring you a lakeside BBQ and baked goods Bonanza */}
									{pollingPlace.stall?.description}
								</Typography>
								{/* <Typography variant="body2">
							Our P & F Association will be holding a sausage sizzle, selling snags in Bakers Delight bread, bacon and
							eggs rolls and drinks. PLUS we will be having a huge cake stall AND craft stall. Don't miss out! 122
							Jasper Road, Bentleigh (entry from Higgins Road)
						</Typography> */}
							</React.Fragment>
						)}

						<Divider sx={{ paddingTop: 2 }}>
							<Chip label="DETAILS" />
						</Divider>

						<List dense sx={{ paddingBottom: 0, paddingTop: 0 }}>
							{pollingPlace.stall !== null && pollingPlaceHasReportsOfNoms(pollingPlace) === true && (
								<ListItem disableGutters>
									<ListItemIcon>
										<RestaurantIcon />
									</ListItemIcon>
									{/* <ListItemText primary="On Offer" secondary="sausage sizzle, cake stall, bacon and egg burgers" /> */}
									<ListItemText primary="On Offer" secondary={getPollingPlaceNomsDescriptiveText(pollingPlace)} />
								</ListItem>
							)}

							{pollingPlace.stall?.opening_hours !== '' && pollingPlace.stall !== null && (
								<ListItem disableGutters>
									<ListItemIcon>
										<AccessTimeIcon />
									</ListItemIcon>
									{/* <ListItemText primary="Stall Open" secondary="From 8am" /> */}
									<ListItemText primary="Stall Open" secondary={pollingPlace.stall?.opening_hours} />
								</ListItem>
							)}

							{pollingPlace.entrance_desc !== '' && (
								<ListItem disableGutters>
									<ListItemIcon>
										<DirectionsIcon />
									</ListItemIcon>
									{/* <ListItemText primary="Entrance" secondary="Access via Aughtie Drive" /> */}
									<ListItemText primary="Entrance" secondary={pollingPlace.entrance_desc} />
								</ListItem>
							)}

							<ListItem disableGutters>
								<ListItemIcon>
									<AccessibleForwardIcon />
								</ListItemIcon>
								{/* <ListItemText primary="Wheelchair Access" secondary="Assisted wheelchair access" /> */}
								<ListItemText primary="Wheelchair Access" secondary={pollingPlace.wheelchair_access} />
							</ListItem>

							{pollingPlace.divisions.length >= 1 && (
								<ListItem disableGutters>
									<ListItemIcon>
										<CheckCircleOutlineIcon />
									</ListItemIcon>
									{/* <ListItemText primary="Division" secondary="Bentleigh District" /> */}
									<ListItemText
										primary={pollingPlace.divisions.length >= 2 ? 'Divisions' : 'Divison'}
										secondary={getPollingPlaceDivisionsDescriptiveText(pollingPlace)}
									/>
								</ListItem>
							)}
						</List>
					</CardContent>

					<CardActions>
						<Button startIcon={<ContentCopyIcon />} size="small">
							Copy Link
						</Button>
						<Button startIcon={<IosShareIcon />} size="small">
							Share
						</Button>
						<Button startIcon={<PublicIcon />} size="small">
							Stall Website
						</Button>
					</CardActions>
				</Card>
			</Stack>
		</Box>
	);
}
