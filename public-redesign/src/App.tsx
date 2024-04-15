import AddLocationIcon from '@mui/icons-material/AddLocation';
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PublicIcon from '@mui/icons-material/Public';
import { AppBar, Divider, Drawer, IconButton, List, Toolbar, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import { ListItemButtonLink } from './app/ui/link';
import { mapaThemePrimaryPurple } from './app/ui/theme';

const TitleLogo = styled('img')`
	height: 32px;
	margin-right: 10px;
`;

export default function App() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}

		setDrawerOpen(open);
	};

	return (
		<div className="App">
			<AppBar
				position="sticky"
				sx={{
					backgroundColor: mapaThemePrimaryPurple,
				}}
			>
				<Toolbar variant="dense">
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 1 }}
						onClick={toggleDrawer(true)}
					>
						<MenuIcon />
					</IconButton>

					<TitleLogo src="/icons/sausage+cake_big.png" />

					<Typography
						variant="h5"
						noWrap
						component="a"
						href="/"
						sx={{
							flexGrow: 1,
							fontWeight: 500,
							color: 'inherit',
							textDecoration: 'none',
						}}
					>
						Democracy Sausage
					</Typography>
				</Toolbar>
			</AppBar>

			<Outlet />

			<Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
				<Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
					<List>
						{[
							{ text: 'Map', path: '/', icon: <PublicIcon /> },
							{
								text: 'Add Stall',
								path: '/add-stall',
								icon: <AddLocationIcon />,
							},
							{ text: 'About', path: '/about', icon: <InfoIcon /> },
							{ text: 'Item 4', path: '/' },
							{ text: 'Item 5', path: '/' },
						].map((item) => (
							<ListItemButtonLink
								key={item.text}
								to={item.path}
								primary={item.text}
								icon={item.icon === undefined ? <InboxIcon /> : item.icon}
							/>
						))}
					</List>
					<Divider />
					<List>
						{['Item 5', 'Item 6', 'Item 7'].map((text) => (
							<ListItemButtonLink key={text} to="/about" primary={text} />
						))}
					</List>
				</Box>
			</Drawer>
		</div>
	);
}
