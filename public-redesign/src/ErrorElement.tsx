import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import './App.css';
import { mapaThemePrimaryPurple } from './app/ui/theme';
import DemSausageColouredCrestGrillRaw from './assets/crest/coloured_crest_grill.svg?raw';
import { createInlinedSVGImage } from './features/icons/svgHelpers';

const PageContainer = styled('div')`
	height: 100vh;
	display: flex;
	align-items: start;
	justify-content: center;
	flex-direction: column;
	background-color: ${mapaThemePrimaryPurple};
`;

function ErrorElement() {
	return (
		<PageContainer>
			<Helmet>
				<title>Error | Democracy Sausage</title>
			</Helmet>

			<Box
				sx={{
					width: '100%',
					backgroundColor: 'white',
					borderTop: '10px solid white',
					borderBottom: '10px solid white',
					// backgroundColor: '#a197c7',
					height: '250px',
					// backgroundImage: "url('https://i.sstatic.net/CjzQS.jpg')",
					// backgroundImage: "url('/logo/sausage+cake_big.png')",
					// backgroundImage: "url('/big_election_image.png')",
					// backgroundRepeat: 'no-repeat',
					// backgroundSize: 'cover',
					// -webkit-filter: blur(5px);
					// -moz-filter: blur(5px);
					// -o-filter: blur(5px);
					// -ms-filter: blur(5px);
					// filter: 'blur(5px)',
					// p: 2,
					// display: 'flex',
					// justifyContent: 'center',
				}}
			>
				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						// backgroundColor: 'white',
						// backgroundColor: '#a197c7',
						height: '225px',
						// backgroundImage: "url('https://i.sstatic.net/CjzQS.jpg')",
						// backgroundImage: "url('/logo/sausage+cake_big.png')",
						// backgroundImage: "url('/big_election_image.png')",
						backgroundImage: "url('/screenie4.png')",
						backgroundRepeat: 'no-repeat',
						backgroundSize: 'cover',
						backgroundPositionY: 'center',
						// -webkit-filter: blur(5px);
						// -moz-filter: blur(5px);
						// -o-filter: blur(5px);
						// -ms-filter: blur(5px);
						filter: 'blur(10px)',
						p: 2,
						display: 'flex',
						justifyContent: 'center',
					}}
				></Box>

				<Box
					sx={{
						position: 'absolute',
						width: '100%',
						// backgroundColor: '#a197c7',
						height: '225px',
						// backgroundImage: "url('https://i.sstatic.net/CjzQS.jpg')",
						// backgroundImage: "url('/logo/sausage+cake_big.png')",
						// backgroundImage: "url('/big_election_image.png')",
						// backgroundRepeat: 'no-repeat',
						// backgroundSize: 'cover',
						// -webkit-filter: blur(5px);
						// -moz-filter: blur(5px);
						// -o-filter: blur(5px);
						// -ms-filter: blur(5px);
						// filter: 'blur(5px)',
						p: 2,
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					{createInlinedSVGImage(
						DemSausageColouredCrestGrillRaw,
						{
							width: '70%',
							minWidth: '400px',
							// display: 'none',
							// minHeight: '300px',
						},
						() => {},
					)}
				</Box>
			</Box>

			{/* <Box
				sx={{
					width: '100%',
					// backgroundColor: '#a197c7',
					height: '200px',
					// backgroundImage: "url('https://i.sstatic.net/CjzQS.jpg')",
					// backgroundImage: "url('/logo/sausage+cake_big.png')",
					backgroundImage: "url('/big_election_image.png')",
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
					// -webkit-filter: blur(5px);
					// -moz-filter: blur(5px);
					// -o-filter: blur(5px);
					// -ms-filter: blur(5px);
					filter: 'blur(5px)',
					p: 2,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				{createInlinedSVGImage(
					DemSausageColouredCrestGrillRaw,
					{
						width: '70%',
						minWidth: '400px',
						// display: 'none',
						// minHeight: '300px',
					},
					() => {},
				)}
			</Box> */}

			<Box sx={{ mt: 4, pl: 3, pr: 3, color: 'white' }}>
				<Typography variant="h4" sx={{ fontWeight: 600, mt: 3, mb: 0 }} gutterBottom>
					Error
				</Typography>

				<Typography variant="h2" sx={{ fontWeight: 800, mt: 3, mb: 3 }} gutterBottom>
					Sorry, we hit a snag!
				</Typography>

				<Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }} gutterBottom>
					We are currently experiencing technical issues, we hope to be back with you shortly.
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

			{/* <StyledBox>
				<Typography variant="h1" sx={{ fontWeight: 800, color: mapaThemePrimaryPurple }}>
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
					<strong>We&apos;ve hit a bit of a snag.</strong> Something went wrong and an error has occurred. Please do{' '}
					<a href="mailto:ausdemocracysausage@gmail.com">email us</a> and let us know.
				</Typography>
			</StyledBox>

			<StyledBox sx={{ minWidth: '350px' }}>
				<img src="/logo/logo512.png" style={{ maxWidth: '50%' }} />
			</StyledBox> */}
		</PageContainer>
	);
}

export default ErrorElement;
