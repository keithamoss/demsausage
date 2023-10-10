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
import { styled, useTheme } from '@mui/material/styles';

import { Avatar, Chip, Divider } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { IconsWithTooltips } from '../icons/noms';

interface Props {
	toggleStallFocussed: any;
	focussedStallId: number;
}

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

export default function StallFocus(props: Props) {
	const { toggleStallFocussed, focussedStallId } = props;

	const theme = useTheme();

	const ppPremises = focussedStallId === 0 ? 'Gladstone Views Primary School' : 'Sea Views Primary School';
	const ppName = focussedStallId === 0 ? 'Gladstone Views' : "Fisherman's Knob";
	const ppAddress = focussedStallId === 0 ? 'Carrick Drive, Gladstone Park 3043' : 'Avast Drive, Ye Matey Park 1234';

	return (
		<Box sx={{ width: '100%' }}>
			<Stack spacing={1}>
				<Card variant="outlined" sx={{ border: 0 }}>
					<StyledCardHeader
						action={
							<IconButton aria-label="settings" onClick={toggleStallFocussed}>
								<CloseIcon />
							</IconButton>
						}
						title={ppPremises}
						subheader={ppAddress}
						sx={{ paddingBottom: 0 }}
					/>

					<CardActions sx={{ paddingBottom: 0, paddingLeft: 2 }}>
						<Button startIcon={<SendIcon />} variant="contained" size="large" color="secondary">
							Send us a tip-off
						</Button>
					</CardActions>

					<CardHeader
						avatar={
							<Avatar sx={{ bgcolor: theme.palette.secondary.main }} aria-label="recipe">
								<CasinoIcon />
							</Avatar>
						}
						title="This booth has a FAIR chance of having food"
						subheader="Based on reports from past elections"
						sx={{ paddingBottom: 0 }}
					/>

					<CardContent>
						<FlexboxIcons>
							<IconsWithTooltips />
						</FlexboxIcons>

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
							{ppName}
						</Typography>
						<Typography variant="body2">
							Family and Friends of South Melbourne Park Primary bring you a lakeside BBQ and baked goods Bonanza
						</Typography>
						<Typography variant="body2">
							Our P & F Association will be holding a sausage sizzle, selling snags in Bakers Delight bread, bacon and
							eggs rolls and drinks. PLUS we will be having a huge cake stall AND craft stall. Don't miss out! 122
							Jasper Road, Bentleigh (entry from Higgins Road)
						</Typography>

						<Divider sx={{ paddingTop: 2 }}>
							<Chip label="DETAILS" />
						</Divider>

						<List dense sx={{ paddingBottom: 0, paddingTop: 0 }}>
							<ListItem disableGutters>
								<ListItemIcon>
									<RestaurantIcon />
								</ListItemIcon>
								<ListItemText primary="Noms" secondary="sausage sizzle, cake stall, bacon and egg burgers" />
							</ListItem>

							<ListItem disableGutters>
								<ListItemIcon>
									<DirectionsIcon />
								</ListItemIcon>
								<ListItemText primary="Entrance" secondary="Access via Aughtie Drive" />
							</ListItem>
							<ListItem disableGutters>
								<ListItemIcon>
									<AccessibleForwardIcon />
								</ListItemIcon>
								<ListItemText primary="Wheelchair Access" secondary="Assisted wheelchair access" />
							</ListItem>
							<ListItem disableGutters>
								<ListItemIcon>
									<CheckCircleOutlineIcon />
								</ListItemIcon>
								<ListItemText primary="Division" secondary="Bentleigh District" />
							</ListItem>
							<ListItem disableGutters>
								<ListItemIcon>
									<AccessTimeIcon />
								</ListItemIcon>
								<ListItemText primary="Open" secondary="From 8am" />
							</ListItem>
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
