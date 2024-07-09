import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import './App.css';
import NavigationDrawer from './app/routing/navigationDrawer';
import { mapaThemePrimaryPurple } from './app/ui/theme';
import { getAPIBaseURL, getBaseURL } from './app/utils';
import DemSausageWhiteCrestGrill from '../public/assets/crest/white_crest_grill.svg?react';
import DemSausageWhiteCrestGrillRaw from '../public/assets/crest/white_crest_grill.svg?raw';
import DemSausageColouredCrestGrillRaw from '../public/assets/crest/coloured_crest_grill.svg?raw';
import DemSausageBanner from '../public/assets/banner/banner.svg?react';
import DemSausageBannerRaw from '../public/assets/banner/banner.svg?raw';
import WAJurisdictionCrestCircleRaw from '../public/assets/jurisdictions/wa_circle.svg?raw';
import { getJurisdictionCrestCircleReact } from './features/icons/jurisdictionHelpers';
import { prepareRawSVG } from './features/icons/svgHelpers';

const TitleLogo = styled('img')`
	height: 32px;
	margin-right: 10px;
`;

export default function App() {
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

					{/* <img
						src={`data:image/svg+xml;utf8,${prepareRawSVG(DemSausageWhiteCrestGrillRaw, 1, 1, { width: '80%', height: '80%' })}`}
					/> */}

					{/* {prepareRawSVG(DemSausageWhiteCrestGrillRaw, 1, 1, { width: '40%', height: '40%' })} */}

					{/* <DemSausageWhiteCrestGrill
						style={{ marginRight: 20, paddingTop: 7, paddingBottom: 7, cursor: 'pointer', maxHeight: 50 }}
					/> */}

					{/* {getJurisdictionCrestCircleReact('wa', {

					})} */}

					{/* <a href="/" style={{ lineHeight: 'normal' }}> */}
					<img
						src={`data:image/svg+xml;utf8,${DemSausageWhiteCrestGrillRaw.replace(
							'width="174.36"',
							`width="${174.36 * 0.4}"`,
						)
							.replace('height="87.85"', `height="${87.85 * 0.4}"`)
							.replaceAll('#', '%23')
							.replaceAll('"', "'")}`}
						style={{ marginRight: 20, paddingTop: 7, paddingBottom: 7, cursor: 'pointer' }}
					/>
					{/* </a> */}

					{/* <img
						src={`data:image/svg+xml;utf8,${DemSausageColouredCrestGrillRaw.replace(
							'width="175.59"',
							`width="${175.59 * 0.4}"`,
						)
							.replace('height="88.38"', `height="${88.38 * 0.4}"`)
							.replaceAll('#', '%23')
							.replaceAll('"', "'")}`}
						style={{ marginRight: 20, paddingTop: 7, paddingBottom: 7 }}
					/> */}

					<img
						src={`data:image/svg+xml;utf8,${DemSausageBannerRaw.replace('width="495.66"', `width="${495.66 * 0.4}"`)
							.replace('height="89.63"', `height="${89.63 * 0.4}"`)
							.replaceAll('#', '%23')
							.replaceAll('"', "'")}`}
						style={{ marginRight: 20, paddingTop: 7, paddingBottom: 7 }}
					/>

					{/* <img
						src={`data:image/svg+xml;utf8,${WAJurisdictionCrestCircleRaw.replace(
							'width="298.07"',
							`width="${298.07 * 0.15}"`,
						)
							.replace('height="298.07"', `height="${298.07 * 0.15}"`)
							.replaceAll('#', '%23')
							.replaceAll('"', "'")}`}
						style={{ paddingTop: 7, paddingBottom: 7 }}
					/> */}

					{/* <TitleLogo src="/logo/sausage+cake_big.png" />

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
					</Typography> */}
				</Toolbar>
			</AppBar>

			<Outlet />

			<NavigationDrawer open={drawerOpen} onToggleDrawer={onToggleDrawer} />
		</div>
	);
}
