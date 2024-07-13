import { Box, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100dvh`,
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
				<React.Fragment>
					Thanks for letting us know about your stall! We&apos;ll let you know once it&apos;s approved and it&apos;s
					appearing on the map.
				</React.Fragment>
			</Box>
		</StyledInteractableBoxFullHeight>
	);
}
