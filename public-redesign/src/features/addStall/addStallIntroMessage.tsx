import EmailIcon from '@mui/icons-material/Email';
import { Avatar, Box, List, ListItemAvatar, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import { Election } from '../../app/services/elections';

interface Props {
	election?: Election;
}

export default function AddStallIntroMessage(props: Props) {
	const { election } = props;

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
				<Typography variant="h6">{election !== undefined ? `Add Stall: ${election.name}` : 'Add Stall'}</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<Typography variant="body1" gutterBottom>
					Please complete the form below to add your stall to the map. Please do not submit entries that are offensive,
					political or do not relate to an election day stall. Please also make sure that you have authorisation to run
					your fundraising event at the polling place. All entries are moderated and subject to approval.
				</Typography>

				<List>
					<ListItemButton>
						<ListItemAvatar>
							<Avatar>
								<EmailIcon />
							</Avatar>
						</ListItemAvatar>
						<ListItemText
							primary="Having trouble submitting a stall?"
							secondary={<a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a>}
						/>
					</ListItemButton>
				</List>
			</Box>
		</React.Fragment>
	);
}
