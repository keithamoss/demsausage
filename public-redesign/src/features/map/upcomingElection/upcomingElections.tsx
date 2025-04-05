import { Close, Email } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import * as React from 'react';
import { useGetUpcomingElectionsQuery } from '../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { mergeJSXElementsItemsWithOxfordComma } from '../../../app/utils';

export default function UpcomingElection() {
	// Note: WIP of a banner that would appear on the map noting an upcoming election.
	// Abandoned for now because it means rejigging the plumbing of the /elections/public/
	// endpoint to return these upcoming elections and then the ripple effects of
	// having to change every use of selectAllElections() to a selector that only gets
	// non-hidden elections et cetera.

	const {
		data: upcomingElections,
		isLoading: isGetUpcomingElectionsLoading,
		isSuccess: isGetUpcomingElectionsSuccessful,
		isError: isGetUpcomingElectionsErrored,
	} = useGetUpcomingElectionsQuery();

	const [isOpen, setIsOpen] = React.useState(true);

	const onClose = () => setIsOpen(false);

	if (isOpen === false) {
		return null;
	}

	if (isGetUpcomingElectionsLoading === true) {
		return null;
	}

	if (isGetUpcomingElectionsErrored === true || isGetUpcomingElectionsSuccessful === false) {
		// return <ErrorElement />;
		return null;
	}

	return (
		<Box
			sx={{
				position: 'absolute',
				top: 114, // 48px (AppBar) + 16px (two lots of standard padding) + 50px (<LayersSelector /> height)
				zIndex: 1050,
				margin: 1,
				maxWidth: 500,
			}}
		>
			<Card variant="outlined">
				<CardHeader
					action={
						<IconButton onClick={onClose}>
							<Close sx={{ color: 'white' }} />
						</IconButton>
					}
					title="We're warming up the barbie!"
					sx={{
						p: 1,
						backgroundColor: mapaThemePrimaryPurple,
						color: '#FFFFFF',
						'& .MuiCardHeader-title': {
							fontSize: 16,
							fontWeight: 600,
						},
					}}
				/>

				<CardContent sx={{ p: 1, fontSize: 14 }}>
					<Typography gutterBottom sx={{ color: 'text.primary', fontSize: 14, fontWeight: 600, display: 'none' }}>
						We're warming up the barbie!
					</Typography>
					Never fear, we will be covering{' '}
					{mergeJSXElementsItemsWithOxfordComma(upcomingElections.map((e) => <strong key={e.id}>{e.name}</strong>))}.
					The map will be live just as soon as the electoral commission releases the list of polling places.
				</CardContent>

				<CardActions>
					<Button
						size="small"
						variant="outlined"
						startIcon={<Email />}
						component="a"
						href="https://mailchi.mp/196350149996/federal-election-2025"
						target="_blank"
					>
						Send me updates
					</Button>
				</CardActions>
			</Card>
		</Box>
	);
}
