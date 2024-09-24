import EmailIcon from '@mui/icons-material/Email';
import { AppBar, Box, Button, Toolbar, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import './App.css';
import { getDefaultOGMetaTags } from './app/ui/socialSharingTagsHelpers';
import { appBarHeight, mapaThemePrimaryPurple } from './app/ui/theme';
import DemSausageBannerRaw from './assets/banner/banner.svg?raw';
import DemSausageCrestBannerRaw from './assets/crest/crest_banner.svg?raw';
import TilesBackgroundRaw from './assets/tiles/tiles.svg?raw';
import { createInlinedSVGImage } from './features/icons/svgHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(() => ({
	backgroundColor: mapaThemePrimaryPurple,
	overflowY: 'auto',
	height: `100dvh`,
	paddingBottom: appBarHeight * 2,
}));

const ContentContainer = styled('div')`
	display: flex;
	align-items: start;
	flex-direction: column;
`;

function NotFound() {
	const theme = useTheme();

	const navigate = useNavigate();

	const onNavigateHome = useCallback(() => navigate(''), [navigate]);

	return (
		<StyledInteractableBoxFullHeight>
			<Helmet>
				<title>Page Not Found | Democracy Sausage</title>

				{getDefaultOGMetaTags()}
			</Helmet>

			<AppBar
				position="relative"
				elevation={0}
				sx={{
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<Toolbar
					sx={{
						// Override media queries injected by theme.mixins.toolbar
						'@media all': {
							minHeight: appBarHeight * 2,
						},
					}}
				>
					{createInlinedSVGImage(
						DemSausageBannerRaw,
						{
							paddingTop: theme.spacing(1),
							paddingBottom: theme.spacing(1),
							cursor: 'pointer',
							height: 68,
						},
						onNavigateHome,
					)}
				</Toolbar>
			</AppBar>

			<ContentContainer>
				<Box
					sx={{
						width: '100%',
						height: '225px',
						position: 'relative',
					}}
				>
					<Box
						sx={{
							position: 'absolute',
							width: '100%',
							height: '225px',
							backgroundImage: `url('data:image/svg+xml;base64,${window.btoa(TilesBackgroundRaw)}')`,
							p: 2,
						}}
					></Box>

					<Box
						sx={{
							position: 'absolute',
							width: '100%',
							height: '225px',
							p: 2,
							display: 'flex',
							justifyContent: 'center',
						}}
					>
						{createInlinedSVGImage(
							DemSausageCrestBannerRaw,
							{
								minWidth: '400px',
								paddingLeft: '30px',
								paddingRight: '30px',
							},
							onNavigateHome,
						)}
					</Box>
				</Box>

				<Box sx={{ mt: 2, pl: 3, pr: 3, color: 'white' }}>
					<Typography variant="h4" sx={{ fontWeight: 600, mt: 3, mb: 0 }} gutterBottom>
						Page Not Found
					</Typography>

					<Typography variant="h2" sx={{ fontWeight: 800, mt: 3, mb: 3 }} gutterBottom>
						Sorry, we hit a snag!
					</Typography>

					<Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }} gutterBottom>
						Well this is embarrasing.
					</Typography>

					<Button
						variant="outlined"
						startIcon={<EmailIcon />}
						sx={{ borderColor: 'white', color: 'white' }}
						component="a"
						href="mailto:ausdemocracysausage@gmail.com"
					>
						Let us know
					</Button>
				</Box>
			</ContentContainer>
		</StyledInteractableBoxFullHeight>
	);
}

export default NotFound;
