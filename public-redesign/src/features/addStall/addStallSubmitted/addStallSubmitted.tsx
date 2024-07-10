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

export default function AddStallSubmitted(/*props: Props*/) {
	// const navigate = useNavigate();

	// const activeElections = useAppSelector((state) => selectActiveElections(state));

	// const [whoIsSubmitting, setWhoIsSubmitting] = React.useState<string>();
	// const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) =>
	// 	setWhoIsSubmitting(value);

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
				<Typography variant="h6">Submitted!</Typography>
			</Paper>

			<Box sx={{ minHeight: 300, maxWidth: 400, width: '100%', p: 2 }}>
				<React.Fragment>Yay, et cetera...</React.Fragment>
			</Box>
		</StyledInteractableBoxFullHeight>
	);
}
