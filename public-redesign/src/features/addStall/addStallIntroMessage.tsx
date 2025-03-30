import EmailIcon from '@mui/icons-material/Email';
import {
	Alert,
	AlertTitle,
	Avatar,
	Box,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Paper,
	Typography,
	styled,
} from '@mui/material';
import React from 'react';
import type { Election } from '../../app/services/elections';

const StyledUnorderedList = styled('ul')(({ theme }) => ({
	paddingTop: theme.spacing(1),
	paddingLeft: theme.spacing(2),
	marginTop: 0,
	marginBottom: 0,
	'& li:not(:last-child)': { paddingBottom: theme.spacing(1) },
}));

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
				<Alert severity="info">
					<AlertTitle>Guidelines for adding a stall to the map</AlertTitle>

					<StyledUnorderedList>
						<li>
							Please do not submit entries that are offensive, political, or do not relate to an election day stall
						</li>
						<li>
							If you are running a stall, please also make sure that you have authorisation to run your fundraising
							event at the polling place
						</li>
						<li>All entries are moderated and subject to approval</li>
					</StyledUnorderedList>
				</Alert>

				<List>
					<ListItemButton component="a" href="mailto:help@democracysausage.org">
						<ListItemAvatar>
							<Avatar>
								<EmailIcon />
							</Avatar>
						</ListItemAvatar>

						<ListItemText primary="Having trouble submitting a stall?" secondary="help@democracysausage.org" />
					</ListItemButton>
				</List>
			</Box>
		</React.Fragment>
	);
}
