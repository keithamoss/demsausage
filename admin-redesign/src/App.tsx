import GoogleIcon from '@mui/icons-material/Google';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Button, IconButton, LinearProgress, Toolbar, styled } from '@mui/material';
import type React from 'react';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import ErrorElement from './ErrorElement';
import { useAppSelector } from './app/hooks/store';
import NavigationDrawer from './app/routing/navigationDrawer';
import { useGetElectionsQuery } from './app/services/elections';
import { useGetPendingStallsQuery } from './app/services/stalls';
import { mapaThemePrimaryPurple } from './app/ui/theme';
import { getAPIBaseURL, getBaseURL } from './app/utils';
import DemSausageBannerRaw from './assets/banner/banner.svg?raw';
import DemSausageWhiteCrestGrillRaw from './assets/crest/white_crest_grill.svg?raw';
import { isUserLoggedIn, selectUser } from './features/auth/authSlice';
import { createInlinedSVGImage } from './features/icons/svgHelpers';

const LoginContainer = styled('div')`
	height: 100dvh;
	display: flex;
	align-items: center;
	justify-content: center;
`;

function AppEntrypoint() {
	const user = useAppSelector(selectUser);

	const isLoggedIn = useAppSelector(isUserLoggedIn);

	if (isLoggedIn === undefined) {
		// So we don't show the login button while we're waiting to see if the user is logged in
		return null;
	}

	if (user === null) {
		return (
			<LoginContainer>
				<Button
					variant="contained"
					size="large"
					startIcon={<GoogleIcon />}
					// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
					onClick={() => (window.location.href = `${getAPIBaseURL()}/login/google-oauth2/`)}
				>
					Login
				</Button>
			</LoginContainer>
		);
	}

	return <AppEntrypointLayer2 />;
}

function AppEntrypointLayer2() {
	// Most endpoints expect both Pending Stalls and Elections to be pre-populated, so let's just do that here!
	// Important: We're initiating this pre-fetching *after* we have a user object to avoid 403s
	const {
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery();

	const {
		isLoading: isGetElectionsLoading,
		isSuccess: isGetElectionsSuccessful,
		isError: isGetElectionsErrored,
	} = useGetElectionsQuery();

	if (isGetPendingStallsLoading === true || isGetElectionsLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (
		isGetPendingStallsErrored === true ||
		isGetPendingStallsSuccessful === false ||
		isGetElectionsErrored === true ||
		isGetElectionsSuccessful === false
	) {
		return <ErrorElement />;
	}

	return <App />;
}

function App() {
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

			<NavigationDrawer open={drawerOpen} onToggleDrawer={onToggleDrawer} />
		</div>
	);
}

export default AppEntrypoint;
