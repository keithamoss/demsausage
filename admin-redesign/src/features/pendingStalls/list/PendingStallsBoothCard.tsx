import { FiberNewOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import type { PollingPlaceWithPendingStall } from '../../../app/services/stalls';
import { pluralise } from '../../../app/utils';
import { getCountOfExistingStallsIcon } from '../pendingStallsHelpers';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
	paddingLeft: theme.spacing(2),
	paddingBottom: theme.spacing(2),
}));

interface Props {
	pollingPlace: PollingPlaceWithPendingStall;
	onClickPollingPlace: (pollingPlace: PollingPlaceWithPendingStall) => () => void;
}

export default function PendingStallsBoothCard(props: Props) {
	const { pollingPlace, onClickPollingPlace } = props;

	const countOfNewPendingStalls = pollingPlace.pending_stalls.filter((s) => s.triaged_on === null).length;
	const countOfEditedPendingStalls = pollingPlace.pending_stalls.filter((s) => s.triaged_on !== null).length;

	return (
		<Card variant="outlined">
			<StyledCardContent>
				<Box onClick={onClickPollingPlace(pollingPlace)} sx={{ cursor: 'pointer' }}>
					<Typography
						variant="h5"
						component="div"
						sx={{
							fontSize: 16,
							fontWeight: 500,
						}}
					>
						{pollingPlace.premises || pollingPlace.name}
					</Typography>

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{pollingPlace.address}
					</Typography>
				</Box>
			</StyledCardContent>

			<StyledCardActions>
				{countOfNewPendingStalls > 0 && (
					<Button
						size="small"
						variant="contained"
						disabled={true}
						sx={{
							color: 'white !important',
							backgroundColor: '#0389d1 !important',
						}}
					>
						{`${countOfNewPendingStalls} New ${pluralise('Sub', countOfNewPendingStalls)}`}
					</Button>
				)}

				{countOfEditedPendingStalls > 0 && (
					<Button
						size="small"
						variant="contained"
						disabled={true}
						sx={{
							color: 'white !important',
							backgroundColor: '#0389d1 !important',
						}}
					>
						{`${countOfEditedPendingStalls} New ${pluralise('Edit', countOfEditedPendingStalls)}`}
					</Button>
				)}

				<Box
					sx={{
						flex: 1,
						justifyContent: 'flex-start',
					}}
				/>

				{pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied === 0 && (
					<Button
						size="small"
						disabled={true}
						startIcon={<FiberNewOutlined />}
						sx={{
							color: `${blueGrey.A700} !important`,
							ml: '0px !important',
						}}
					>
						{`First ${pluralise('Sub', pollingPlace.pending_stalls.length)}`}
					</Button>
				)}

				{pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied > 0 && (
					<Button
						size="small"
						disabled={true}
						startIcon={getCountOfExistingStallsIcon(
							pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied,
						)}
						sx={{
							color: `${blueGrey.A700} !important`,
							ml: '0px !important',
						}}
					>
						{`Previous ${pluralise('Sub', pollingPlace.previous_subs.approved + pollingPlace.previous_subs.denied)}`}
					</Button>
				)}
			</StyledCardActions>
		</Card>
	);
}
