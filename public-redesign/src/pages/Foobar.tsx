import { Box, Container, styled, Typography } from '@mui/material';
import * as React from 'react';

// When using TypeScript 4.x and above
// import type {} from '@mui/lab/themeAugmentation';

// const theme = createTheme({
//   components: {
//     MuiTimeline: {
//       styleOverrides: {
//         root: {
//           backgroundColor: 'red',
//         },
//       },
//     },
//   },
// });

// const MapContainer = styled((props) => <Container {...props} />)`
//   & .MuiTooltip-tooltip {
//     background-color: turquoise;
//   }
// `;

const MapContainer = styled(Container)({
	color: 'darkslategray',
	backgroundColor: 'turquoise',
	padding: 8,
	borderRadius: 4,
});

export default function App() {
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
			}}
		>
			<MapContainer sx={{ mt: 8, mb: 2 }} maxWidth="sm">
				<Typography variant="h2" component="h1" gutterBottom>
					Sticky footer
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					{'Pin a footer to the bottom of the viewport.'}
					{'The footer will move as the main element of the page grows.'}
				</Typography>
				<Typography variant="body1">Sticky footer placeholder.</Typography>
			</MapContainer>
			<Box
				component="footer"
				sx={{
					py: 3,
					px: 2,
					mt: 'auto',
					backgroundColor: (theme) =>
						theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
				}}
			>
				<Container maxWidth="sm">
					<Typography variant="body1">My sticky footer can be found here.</Typography>
				</Container>
			</Box>
		</Box>
	);
}
