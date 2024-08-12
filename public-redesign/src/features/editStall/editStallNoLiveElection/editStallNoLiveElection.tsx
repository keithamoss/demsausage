import { Box, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function EditStallNoLiveElection() {
	return (
		<React.Fragment>
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
				<Typography variant="h6">This election is no longer live</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<Typography variant="body2">
					Thanks for your interest in editing your stall, but this election is no longer live.
				</Typography>
			</Box>
		</React.Fragment>
	);
}
