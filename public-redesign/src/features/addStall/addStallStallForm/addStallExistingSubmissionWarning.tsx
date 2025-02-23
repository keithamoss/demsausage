import EditIcon from '@mui/icons-material/Edit';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Alert, AlertTitle, Button, Card, CardActions, CardContent, Paper, Typography } from '@mui/material';
import React from 'react';

interface Props {
	pollingPlaceLinkAbsolute: string;
}

export const AddStallExistingSubmissionWarning = (props: Props) => {
	const { pollingPlaceLinkAbsolute } = props;

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
				<Typography variant="h6">We&apos;ve already had a submission for this polling place</Typography>
			</Paper>

			<Card sx={{ pb: 1 }}>
				<CardContent sx={{ pl: 2, pb: 1 }}>
					<Alert severity="info" icon={<EditIcon />} sx={{ mb: 2 }}>
						<AlertTitle>Would you like to edit it?</AlertTitle>
						If you submitted this stall previously and you&apos;d now like to make a change, check your inbox for the
						confirmation email we sent you. There&apos;s a link in there that will let you edit your stall.
					</Alert>

					<Alert severity="success" icon={<FiberNewIcon />}>
						<AlertTitle>Have more information to add about this stall?</AlertTitle>
						If this wasn&apos;t submitted by you, or if you&apos;re running another stall at this booth, please review
						what&apos;s already here (just click &apos;Open Polling Place&apos; below) and consider if you still need to
						list your stall. If you do still want to send in your submission, just hit &apos;Continue&apos; below.
					</Alert>
				</CardContent>

				<CardActions sx={{ pl: 2 }}>
					<Button
						size="small"
						variant="outlined"
						startIcon={<OpenInNewIcon />}
						href={pollingPlaceLinkAbsolute}
						target="_blank"
					>
						Open Polling Place
					</Button>
				</CardActions>
			</Card>
		</React.Fragment>
	);
};
