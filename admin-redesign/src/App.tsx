import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import NavigationDrawer from './app/routing/navigationDrawer';
import { useGetPendingStallsQuery } from './app/services/stalls';
import { mapaThemePrimaryPurple } from './app/ui/theme';
import { getBaseURL } from './app/utils';
import DemSausageBannerRaw from './assets/banner/banner.svg?raw';
import DemSausageWhiteCrestGrillRaw from './assets/crest/white_crest_grill.svg?raw';
import { createInlinedSVGImage } from './features/icons/svgHelpers';

export default function App() {
	const navigate = useNavigate();

	const onNavigateHome = useCallback(() => navigate(''), [navigate]);

	const [drawerOpen, setDrawerOpen] = useState(false);

	const onToggleDrawer = useCallback(
		(open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
			if (
				event.type === 'keydown' &&
				((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
			) {
				return;
			}

			setDrawerOpen(open);
		},
		[],
	);

	const {
		data: pendingStalls,
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery();

	return (
		<div className="App">
			<Helmet>
				<title>Democracy Sausage Administration</title>
			</Helmet>

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
						sx={{ mr: 0.5 }}
						onClick={onToggleDrawer(true)}
					>
						<MenuIcon />
					</IconButton>

					{/* `fontSize: 0` ensures the logo and banner are both clickable links that don't take up extra vertical space */}
					<Link to={getBaseURL()} style={{ fontSize: 0 }}>
						{createInlinedSVGImage(
							DemSausageWhiteCrestGrillRaw,
							{
								marginRight: 20,
								paddingTop: 7,
								paddingBottom: 7,
								cursor: 'pointer',
								height: 48,
							},
							onNavigateHome,
						)}
					</Link>

					<Link to={getBaseURL()} style={{ fontSize: 0 }}>
						{createInlinedSVGImage(
							DemSausageBannerRaw,
							{
								marginRight: 20,
								paddingTop: 7,
								paddingBottom: 7,
								cursor: 'pointer',
								height: 48,
							},
							onNavigateHome,
						)}
					</Link>
				</Toolbar>
			</AppBar>

			<Outlet />

			{isGetPendingStallsSuccessful === true && (
				<Typography variant="h6">We have {pendingStalls.length} pending stalls</Typography>
			)}

			<NavigationDrawer open={drawerOpen} onToggleDrawer={onToggleDrawer} />
		</div>
	);
}
