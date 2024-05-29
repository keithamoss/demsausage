import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import NavigationDrawer from './app/routing/navigationDrawer';
import { mapaThemePrimaryPurple } from './app/ui/theme';

const TitleLogo = styled('img')`
	height: 32px;
	margin-right: 10px;
`;

export default function App() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const onToggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
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
						onClick={onToggleDrawer(true)}
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

			<NavigationDrawer open={drawerOpen} onToggleDrawer={onToggleDrawer} />
		</div>
	);
}
