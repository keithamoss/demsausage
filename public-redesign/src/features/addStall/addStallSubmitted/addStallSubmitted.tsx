import PublicIcon from '@mui/icons-material/Public';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { appBarHeight, mobileStepperMinHeight } from '../addStallHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100vh`,
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

export default function AddStallSubmitted() {
	return (
		<StyledInteractableBoxFullHeight>
			<Paper
				square
				elevation={0}
				sx={{
					display: 'flex',
					alignItems: 'center',
					height: 50,
					pl: 2,
					bgcolor: 'grey.200',
				}}
			>
				<Typography variant="h6">Stall submitted</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<Alert severity="success" sx={{ mb: 2 }}>
					Thanks for letting us know about the stall! We&apos;ll let you know once it&apos;s approved and it&apos;s
					appearing on the map.
				</Alert>

				<Button size="small" variant="outlined" startIcon={<PublicIcon />} href={'/'}>
					Head Back To The Map
				</Button>
			</Box>
		</StyledInteractableBoxFullHeight>
	);
}