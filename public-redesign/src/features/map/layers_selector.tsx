import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { groupBy, sortBy } from 'lodash-es';
import * as React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Badge, ListItemButton, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';

import { BadgeProps } from '@mui/material/Badge';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { Election } from '../../app/services/elections';
import { getElectionVeryShortName, isElectionLive } from '../elections/electionHelpers';
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

const StyledElectionBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
	'& .MuiBadge-badge': {
		right: 20,
		top: 6,
		border: `2px solid ${theme.palette.background.paper}`,
		backgroundColor: theme.palette.secondary.main,
	},
}));

const StyledIconButton = styled(IconButton)(() => ({
	backgroundColor: 'white',
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

	const navigate = useNavigate();

	const [state, setState] = React.useState(false);

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const elections = useAppSelector((state) => selectAllElections(state));
	const electionsByYear = groupBy(sortBy(elections, 'election_day').reverse(), (e) =>
		new Date(e.election_day).getFullYear(),
	);

	const theme = useTheme();

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}

		setState(open);
	};

	// const onClickElection = (election: Election) => navigate(`/${election.name_url_safe}`);
	const onClickElection = (election: Election) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {};

	return (
		<React.Fragment>
			<StyledLayersBadge
				badgeContent={activeElections.length > 1 ? activeElections.length : null}
				color="primary"
				className="layer-selector"
				/* ...or use this if we're using the current layout */
				sx={{ marginTop: '46px' }}
			>
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
							// maxHeight: 400,
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
															<IconButton edge="end" aria-label="delete">
																<LiveTvIcon sx={{ color: theme.palette.secondary.main }} />
															</IconButton>
														) : null
													}
												>
													<ListItemAvatar>
														{election.id === electionId ? (
															<StyledElectionBadge color="success" overlap="circular" badgeContent=" ">
																<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>SA</Avatar>
															</StyledElectionBadge>
														) : (
															<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>
																{getElectionVeryShortName(election)}
															</Avatar>
														)}
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
