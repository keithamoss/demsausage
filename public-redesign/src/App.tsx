import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, IconButton, Toolbar } from '@mui/material';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import NavigationDrawer from './app/routing/navigationDrawer';
import { mapaThemePrimaryPurple } from './app/ui/theme';
import { getAPIBaseURL, getBaseURL } from './app/utils';
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

	return (
		<div className="App">
			<Helmet>
				<title>Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={getBaseURL()} />
				<meta property="og:title" content="Democracy Sausage" />
				<meta property="og:image" content={`${getAPIBaseURL()}/0.1/current_map_image/`} />
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

			<NavigationDrawer open={drawerOpen} onToggleDrawer={onToggleDrawer} />
		</div>
	);
}
