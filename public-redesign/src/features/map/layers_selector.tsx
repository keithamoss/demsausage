import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Badge, Button, ListItemButton, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { blueGrey, grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { groupBy, sortBy } from 'lodash-es';
import * as React from 'react';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { Election } from '../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import { getDefaultElection, getElectionVeryShortName, isElectionLive } from '../elections/electionHelpers';
import { selectActiveElections, selectAllElections } from '../elections/electionsSlice';

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

const StyledIconButton = styled(IconButton)(() => ({
	backgroundColor: 'white',
	'&:hover': {
		backgroundColor: grey[200],
	},
}));

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
	const isViewingHistoricalElection =
		urlElectionName !== undefined && getDefaultElection(elections)?.name_url_safe !== urlElectionName;

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

	const onClickElection = (election: Election) => () => navigate(`/${election.name_url_safe}`);

	return (
		<React.Fragment>
			<StyledLayersBadge
				badgeContent={activeElections.length > 1 ? activeElections.length : null}
				color="primary"
				className="layer-selector"
				sx={{ marginTop: '46px' }}
			>
				{isViewingHistoricalElection === true && (
					<Button
						size="small"
						disabled={true}
						sx={{
							backgroundColor: 'white',
							color: `${blueGrey.A700} !important`,
							left: '20px',
							paddingRight: '25px',
						}}
					>
						{elections.find((e) => e.name_url_safe === urlElectionName)?.name}
					</Button>
				)}

				<StyledIconButton aria-label="layers" onClick={toggleDrawer(true)}>
					<LayersIcon />
				</StyledIconButton>
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
																day: '2-digit',
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
