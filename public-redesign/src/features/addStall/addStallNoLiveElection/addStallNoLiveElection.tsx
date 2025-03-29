import { Email } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import * as React from 'react';
import ErrorElement from '../../../ErrorElement';
import { useGetUpcomingElectionsQuery } from '../../../app/services/elections';
import { mergeJSXElementsItemsWithOxfordComma } from '../../../app/utils';
import { primaryFoodIcons } from '../../icons/iconHelpers';

export default function AddStallNoLiveElection() {
	const {
		data: upcomingElections,
		isLoading: isGetUpcomingElectionsLoading,
		isSuccess: isGetUpcomingElectionsSuccessful,
		isError: isGetUpcomingElectionsErrored,
	} = useGetUpcomingElectionsQuery();

	if (isGetUpcomingElectionsLoading === true) {
		return <LinearProgress color="secondary" />;
	}

	if (isGetUpcomingElectionsErrored === true || isGetUpcomingElectionsSuccessful === false) {
		return <ErrorElement />;
	}

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
				<Typography variant="h6">There are no live elections</Typography>
			</Paper>

			{upcomingElections.length === 0 && (
				<Box sx={{ width: '100%', p: 2 }}>
					<Typography variant="body2">
						Thanks for your interest in submitting a stall, but there aren&apos;t any elections coming up that
						we&apos;re planning to cover. If you know of an election that you think we should cover, please get in touch
						with us at <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> and we&apos;ll
						consider adding it.
					</Typography>
				</Box>
			)}

			{upcomingElections.length > 0 && (
				<Box sx={{ p: 2, pt: 1 }}>
					<Alert icon={primaryFoodIcons.bbq.icon.react} severity="success" sx={{ mt: 2 }}>
						<AlertTitle>We're warming up the barbie!</AlertTitle>
						Never fear, we're planning to cover the upcoming{' '}
						{mergeJSXElementsItemsWithOxfordComma(upcomingElections.map((e) => <strong key={e.id}>{e.name}</strong>))}.
						<br />
						<br />
						We'll have the map live and ready to go just as soon as the electoral commission releases the list of
						polling places.
					</Alert>

					{upcomingElections.filter((e) => e.name === 'Federal Election 2025').length === 1 && (
						<React.Fragment>
							<Typography variant="h6" sx={{ fontWeight: 800, mt: 3, mb: 3 }} gutterBottom>
								Want us to let you know when the map is live?
							</Typography>

							<Button
								variant="outlined"
								startIcon={<Email />}
								// sx={{ borderColor: 'white', color: 'white' }}
								component="a"
								href="https://mailchi.mp/196350149996/federal-election-2025"
								target="_blank"
							>
								Sign-up
							</Button>
						</React.Fragment>
					)}
				</Box>
			)}
		</React.Fragment>
	);
}
