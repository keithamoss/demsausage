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
import { navigateToElection } from '../../../app/routing/navigationHelpers';
import { getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { getElectionVeryShortName, getViewForElection, isElectionLive } from '../../elections/electionHelpers';
import { selectActiveElections, selectAllElections } from '../../elections/electionsSlice';

const StyledFab = styled(Fab)(({ theme }) => ({
	// position: 'absolute',
	// bottom: `${16 + 48 + 36}px`, // 16 for standard bottom padding, 48 for the height of <SearchBar />, and then 36 more on top
	// right: '16px',
	backgroundColor: theme.palette.secondary.main,
	width: '44px',
	height: '44px',
}));

interface Props {
	electionId: number;
}

const StyledLayersBadge = styled(Badge)(({ theme }) => ({
	position: 'absolute',
	top: '24px',
	right: '24px',
	zIndex: 1050,
	'& .MuiBadge-badge': {
		right: 4,
		top: 4,
		backgroundColor: theme.palette.secondary.main,
	},
}));

// const StyledIconButton = styled(IconButton)(() => ({
// 	backgroundColor: 'white',
// 	'&:hover': {
// 		backgroundColor: grey[200],
// 	},
// }));

const StyledCloseIconButton = styled(IconButton)(() => ({
	position: 'absolute',
	right: '0px',
	zIndex: '3',
	height: '48px',
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

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

	return (
		<React.Fragment>
			<Button
				size="small"
				disabled={true}
				sx={{
					marginTop: '46px',
					position: 'absolute',
					top: '28px',
					// 24px for the StyledLayersBadge's right offset
					// 40px for the width of StyledLayersBadge
					// 24px to ensure even spacing either side of StyledLayersBadge
					right: '44px', // 24px + 40px + 24px
					left: '24px',
					zIndex: 1050,
					height: '36px',

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
			</Button>

			<StyledLayersBadge
				badgeContent={activeElections.length > 1 ? activeElections.length : null}
				// color="primary"
				sx={{
					marginTop: '46px',
					// backgroundColor: 'white !important',
					// color: 'white',
					'& .MuiBadge-badge': {
						// border: '1px solid white',
						// color: 'white',

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
				{/* <StyledIconButton
					aria-label="layers"
					onClick={toggleDrawer(true)}
					// sx={{ border: `2px solid ${mapaThemePrimaryPurple}`, color: mapaThemePrimaryPurple }}
					sx={{ backgroundColor: mapaThemePrimaryPurple, color: 'white' }}
				>
					<LayersIcon />
				</StyledIconButton> */}

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

			<Drawer anchor="bottom" open={state} onClose={toggleDrawer(false)}>
				<StyledInteractableBoxFullHeight
					sx={{ width: 'auto' }}
					role="presentation"
					onClick={toggleDrawer(false)}
					onKeyDown={toggleDrawer(false)}
				>
					<StyledCloseIconButton aria-label="close-layers" onClick={toggleDrawer(false)}>
						<CloseIcon />
					</StyledCloseIconButton>

					<List
						sx={{
							width: '100%',
							bgcolor: 'background.paper',
							position: 'relative',
							overflow: 'auto',
							'& ul': { padding: 0 },
							'& li.MuiListSubheader-root': { zIndex: 2 },
						}}
						subheader={<li />}
					>
						{Object.keys(electionsByYear)
							.sort()
							.reverse()
							.map((year: string) => {
								return (
									<React.Fragment key={year}>
										<ListSubheader>{year}</ListSubheader>
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
																width: 50,
																height: 50,
																marginRight: 2,
																backgroundColor: election.id === electionId ? mapaThemePrimaryPurple : undefined,
															}}
														>
															{getElectionVeryShortName(election)}
														</Avatar>
													</ListItemAvatar>

													<ListItemButton onClick={onClickElection(election)}>
														<ListItemText
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
