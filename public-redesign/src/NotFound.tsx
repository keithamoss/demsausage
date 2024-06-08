import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { demSausageThemeWarningPurple } from './app/ui/theme';

const PageContainer = styled('div')`
	height: 100dvh;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

const StyledBox = styled(Box)`
	max-width: 50%;
	display: flex;
	align-content: center;
	justify-content: center;
`;

function NotFound() {
	return (
		<PageContainer>
			<Helmet>
				<title>Not Found | Democracy Sausage</title>
			</Helmet>

			<StyledBox>
				<Typography variant="h1" sx={{ fontWeight: 800, color: demSausageThemeWarningPurple }}>
					Oops!
				</Typography>
			</StyledBox>

			<StyledBox
				sx={{
					maxWidth: '30%',
					minWidth: '250px',
					marginTop: 1,
					marginBottom: 2,
				}}
			>
				<Typography variant="body1" sx={{ textAlign: 'center' }}>
					<strong>We&apos;ve hit a bit of a snag.</strong> The page you requested doesn&apos;t exist. Please do{' '}
					<a href="mailto:ausdemocracysausage@gmail.com">email us</a> and let us know.
				</Typography>
			</StyledBox>

			<StyledBox sx={{ minWidth: '350px' }}>
				<img src="/logo/logo512.png" style={{ maxWidth: '50%' }} />
			</StyledBox>
		</PageContainer>
	);
}

export default NotFound;
