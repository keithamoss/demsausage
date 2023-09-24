import LayersIcon from '@mui/icons-material/Layers';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Badge, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';

import { BadgeProps } from '@mui/material/Badge';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';

import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';

interface Props {}

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

export default function LayersSelector(props: Props) {
	const [state, setState] = React.useState(false);

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

	return (
		<React.Fragment>
			<StyledLayersBadge
				badgeContent={2}
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
				<Box sx={{ width: 'auto' }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
					<StyledCloseIconButton aria-label="close-layers" onClick={toggleDrawer(false)}>
						<CloseIcon />
					</StyledCloseIconButton>

					<List
						sx={{
							width: '100%',
							bgcolor: 'background.paper',
							position: 'relative',
							overflow: 'auto',
							maxHeight: 400,
							'& ul': { padding: 0 },
							'& li.MuiListSubheader-root': { zIndex: 2 },
						}}
						subheader={<li />}
					>
						<ListSubheader>2022</ListSubheader>
						<ListItem
							secondaryAction={
								<IconButton edge="end" aria-label="delete">
									<LiveTvIcon sx={{ color: theme.palette.secondary.main }} />
								</IconButton>
							}
							//   sx={{ backgroundColor: "rgba(103, 64, 180, 0.3)" }}
						>
							<ListItemAvatar>
								<StyledElectionBadge color="success" overlap="circular" badgeContent=" ">
									<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>SA</Avatar>
								</StyledElectionBadge>
							</ListItemAvatar>
							<ListItemText primary="Election 1" secondary="Jan 9, 2022" />
						</ListItem>
						<ListItem
							secondaryAction={
								<IconButton edge="end" aria-label="delete">
									<LiveTvIcon sx={{ color: theme.palette.secondary.main }} />
								</IconButton>
							}
						>
							<ListItemAvatar>
								<StyledElectionBadge color="success" overlap="circular" badgeContent=" ">
									<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>VIC</Avatar>
								</StyledElectionBadge>
							</ListItemAvatar>
							<ListItemText primary="Election 2" secondary="Jan 7, 2022" />
						</ListItem>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>NSW</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 3" secondary="July 20, 2022" />
						</ListItem>

						<ListSubheader>2021</ListSubheader>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>TAS</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 4" secondary="Jan 9, 2021" />
						</ListItem>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>VIC</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 5" secondary="Jan 7, 2021" />
						</ListItem>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>WA</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 6" secondary="July 20, 2021" />
						</ListItem>

						<ListSubheader>2020</ListSubheader>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>NT</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 7" secondary="Jan 9, 2020" />
						</ListItem>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>ACT</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 8" secondary="Jan 7, 2020" />
						</ListItem>
						<ListItem>
							<ListItemAvatar>
								<Avatar sx={{ width: 50, height: 50, marginRight: 2 }}>NSW</Avatar>
							</ListItemAvatar>
							<ListItemText primary="Election 9" secondary="July 20, 2020" />
						</ListItem>
					</List>
				</Box>
			</Drawer>
		</React.Fragment>
	);
}
