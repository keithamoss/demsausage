import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Badge, Button, Fab, ListItemButton, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { styled } from '@mui/material/styles';
import { groupBy, sortBy } from 'lodash-es';
import * as React from 'react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { navigateToElection } from '../../../app/routing/navigationHelpers/navigationHelpersMap';
import { getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { getViewForElection, isElectionLive } from '../../elections/electionHelpers';
import { selectActiveElections, selectAllElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestCircleReact, getJurisdictionCrestStandaloneReact } from '../../icons/jurisdictionHelpers';

// Note: We did start down a path of using flexbox to line all of these elements up, but
// ultimately abandoned that as this works well enough!

const LayersSelectorContainer = styled(Box)(() => ({
	position: 'sticky',
	top: 64, // 48px (AppBar) + 16px (two lots of standard padding)
	maxWidth: 350 + 48 + 48, // 350 for an iPhone 15 Pro Max + the 48px padding on left and right
	marginLeft: 'auto',
	paddingLeft: 48,
	paddingRight: 48,
	zIndex: 1050,
}));

const StyledLayersButton = styled(Button)(() => ({
	width: '100%',
	height: 36,
	marginTop: 4, // Just enough to line it up with the vertical centre of the other two elements
	// These next two prevent really long election names from wrapping on smaller screens
	overflow: 'hidden',
	whiteSpace: 'nowrap',
}));

const StyledLayersBadge = styled(Badge)(({ theme }) => ({
	position: 'absolute',
	right: 26, // 24px of padding + 2px to get the edge of the <Button> to line up exactly with the centre of the Fab inside this badge
	'& .MuiBadge-badge': {
		right: 4,
		top: 4,
		backgroundColor: theme.palette.secondary.main,
	},
}));

const StyledFab = styled(Fab)(({ theme }) => ({
	backgroundColor: theme.palette.secondary.main,
	width: '44px',
	height: '44px',
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

const StyledCloseIconButton = styled(IconButton)(({ theme }) => ({
	position: 'absolute',
	right: '0px',
	marginRight: theme.spacing(1),
	zIndex: theme.zIndex.drawer + 1,
}));

interface Props {
	electionId: number;
}

export default function LayersSelector(props: Props) {
	const { electionId } = props;

	const theme = useTheme();

	const params = useParams();
	const navigate = useNavigate();

	const [state, setState] = React.useState(false);

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const elections = useAppSelector((state) => selectAllElections(state));
	const electionsByYear = groupBy(sortBy(elections, 'election_day').reverse(), (e) =>
		new Date(e.election_day).getFullYear(),
	);

	const currentElection = elections.find((e) => e.id === electionId);

	const urlElectionName = getStringParamOrUndefined(params, 'election_name');

	const toggleDrawer = useCallback(
		(open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
			if (
				event.type === 'keydown' &&
				((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
			) {
				return;
			}

			setState(open);
		},
		[],
	);

	const onClickElection = (election: Election) => () => {
		navigateToElection(navigate, election, getViewForElection(election));
	};

	if (currentElection === undefined) {
		return null;
	}

	return (
		<React.Fragment>
			<LayersSelectorContainer>
				{getJurisdictionCrestCircleReact(currentElection.jurisdiction, {
					position: 'absolute',
					width: 48,
					height: 48,
					left: 23, // Just enough to line the visual centre of the crest up with the edge of the <Button>
					zIndex: 1,
				})}

				<StyledLayersButton
					size="small"
					disabled={true}
					sx={{
						// Option 1: Purple + White
						// backgroundColor: mapaThemePrimaryPurple,
						// color: 'white !important',

						// Option 2: Blue Grey and White
						// backgroundColor: blueGrey[400],
						// color: 'white !important',

						// Option 3: White and Purple
						backgroundColor: 'white',
						color: `${mapaThemePrimaryPurple} !important`,

						boxShadow:
							'0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
					}}
				>
					{elections.find((e) => e.name_url_safe === urlElectionName)?.name}
				</StyledLayersButton>

				<StyledLayersBadge
					badgeContent={activeElections.length > 1 ? activeElections.length : null}
					// badgeContent={2}
					// color="primary"
					sx={{
						'& .MuiBadge-badge': {
							// Option 1: Purple and White
							// backgroundColor: mapaThemePrimaryPurple,
							// color: 'white',

							// Option 2: Blue Grey and White
							// backgroundColor: mapaThemePrimaryPurple,
							// color: 'white',

							// Option 3: White and Purple
							backgroundColor: 'white',
							color: mapaThemePrimaryPurple,

							zIndex: 1100,
						},
					}}
				>
					<StyledFab
						onClick={toggleDrawer(true)}
						color="primary"
						// Option 2: Blue Grey and White
						// color="primary"
						sx={
							{
								// Option 1: Purple and White
								// backgroundColor: 'white',
								// color: mapaThemePrimaryPurple,
								// Option 2: Blue Grey and White
								// backgroundColor: 'white',
								// color: mapaThemePrimaryPurple,
								// Option 3: White and Purple
								// defaults
							}
						}
					>
						<LayersIcon />
					</StyledFab>
				</StyledLayersBadge>
			</LayersSelectorContainer>

			<Drawer anchor="bottom" open={state} onClose={toggleDrawer(false)}>
				<StyledInteractableBoxFullHeight
					sx={{ width: 'auto' }}
					role="presentation"
					onClick={toggleDrawer(false)}
					onKeyDown={toggleDrawer(false)}
				>
					<StyledCloseIconButton aria-label="close-layers" onClick={toggleDrawer(false)}>
						<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
					</StyledCloseIconButton>

					<List
						sx={{
							width: '100%',
							bgcolor: 'background.paper',
							position: 'relative',
							overflow: 'auto',
							'& ul': { padding: 0 },
							'& li.MuiListSubheader-root:not(:first-of-type)': { paddingTop: 2 },
							'& li.MuiListSubheader-root': { paddingTop: 0, zIndex: 2 },
						}}
					>
						{Object.keys(electionsByYear)
							.sort()
							.reverse()
							.map((year: string) => {
								return (
									<React.Fragment key={year}>
										<ListSubheader
											sx={{
												fontSize: 16,
												fontWeight: theme.typography.fontWeightMedium,
												color: theme.palette.text.primary,
											}}
										>
											{year}
										</ListSubheader>

										{electionsByYear[year].map((election) => {
											return (
												<ListItem
													key={election.id}
													secondaryAction={
														isElectionLive(election) === true ? (
															<Button
																startIcon={<LiveTvIcon />}
																aria-label="live election"
																disabled={true}
																sx={{ color: `${theme.palette.secondary.main} !important` }}
															>
																Live
															</Button>
														) : null
													}
												>
													<ListItemAvatar>
														<Avatar
															sx={{
																width: 58,
																height: 58,
																marginRight: 2,
																backgroundColor: 'transparent',
																'& svg': {
																	width: 50,
																},
															}}
														>
															{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
														</Avatar>
													</ListItemAvatar>

													<ListItemButton onClick={onClickElection(election)}>
														<ListItemText
															sx={{
																'& .MuiListItemText-primary': {
																	fontSize: 15,
																	fontWeight: theme.typography.fontWeightMedium,
																	color: theme.palette.text.primary,
																},
															}}
															primary={election.name}
															secondary={new Date(election.election_day).toLocaleDateString('en-AU', {
																day: 'numeric',
																month: 'long',
																year: 'numeric',
															})}
														/>
													</ListItemButton>
												</ListItem>
											);
										})}
									</React.Fragment>
								);
							})}
					</List>
				</StyledInteractableBoxFullHeight>
			</Drawer>
		</React.Fragment>
	);
}
