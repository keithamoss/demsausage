import { Box, Paper, Typography } from '@mui/material';
import * as React from 'react';

export default function AddStallNoLiveElection() {
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
				<Typography variant="h6">There aren&apos;t any live elections at the moment</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<Typography variant="body2">
					Thanks for your interest in submitting a stall, but there aren&apos;t any elections coming up that we&apos;re
					planning to cover. If you know of an election that you think we should cover, please get in touch with us at{' '}
					<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> and we&apos;ll consider
					adding it.
				</Typography>
			</Box>
		</React.Fragment>
	);
}
