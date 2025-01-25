import {
	Looks3Outlined,
	Looks4Outlined,
	Looks5Outlined,
	Looks6Outlined,
	LooksOneOutlined,
	LooksTwoOutlined,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { default as Owl } from '../../assets/illustrations/illlustrations.co/owl.svg?react';

export const getCountOfExistingStallsIcon = (count: number) => {
	switch (count) {
		case 0:
			return undefined;
		case 1:
			return <LooksOneOutlined />;
		case 2:
			return <LooksTwoOutlined />;
		case 3:
			return <Looks3Outlined />;
		case 4:
			return <Looks4Outlined />;
		case 5:
			return <Looks5Outlined />;
		case 6:
			return <Looks6Outlined />;
		default:
			return <LooksOneOutlined />;
	}
};

export const PendingStallsAllCaughtUp = () => (
	<Stack
		spacing={2}
		sx={{
			justifyContent: 'center',
			alignItems: 'center',
			'& > *': { maxWidth: 400 },
		}}
	>
		<Owl />

		<Box sx={{ textAlign: 'center', marginTop: '-40px !important' }}>
			<Typography variant="h4" gutterBottom>
				We're all caught up! There are no pending submissions.
			</Typography>

			<Typography variant="subtitle2">(Nor are the owls what they seem.)</Typography>
		</Box>
	</Stack>
);
