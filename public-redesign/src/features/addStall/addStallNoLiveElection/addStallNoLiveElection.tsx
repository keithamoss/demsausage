import { Box, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function AddStallNoLiveElection(/*props: Props*/) {
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
				<Typography variant="h6">No live election</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300,*/ /*maxWidth: 400, */ width: '100%', p: 2 }}></Box>
		</React.Fragment>
	);
}
