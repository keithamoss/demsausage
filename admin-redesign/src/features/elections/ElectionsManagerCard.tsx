import {
	Avatar,
	Box,
	Card,
	CardContent,
	LinearProgress,
	type LinearProgressProps,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
	useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Election } from '../../app/services/elections';
import { getJurisdictionCrestStandaloneReact } from '../icons/jurisdictionHelpers';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center' }}>
			<Box sx={{ width: '100%', mr: 1 }}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box sx={{ minWidth: 35 }}>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>{`${Math.round(props.value)}%`}</Typography>
			</Box>
		</Box>
	);
}

interface Props {
	election: Election;
	onChooseElection: (e: Election) => void;
}

export default function ElectionsManagerCard(props: Props) {
	const { election, onChooseElection } = props;

	const theme = useTheme();

	return (
		<Card key={election.id} variant="outlined">
			<CardContent sx={{ pl: 0, pb: `${theme.spacing(2)} !important` }}>
				<List disablePadding>
					<ListItem sx={{ pt: 0, pb: 0 }} onClick={() => onChooseElection(election)}>
						<ListItemAvatar sx={{ minWidth: 36 }}>
							<Avatar
								sx={{
									backgroundColor: 'transparent',
									'& svg': {
										width: 36,
									},
								}}
							>
								{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
							</Avatar>
						</ListItemAvatar>

						<ListItemButton sx={{ pt: 0 }}>
							<ListItemText
								primary={election.name}
								secondary={dayjs(election.election_day).format('dddd DD MMMM YYYY')}
							/>
						</ListItemButton>
					</ListItem>
				</List>

				{election.stats.total > 0 && (
					<Box sx={{ pt: 1, pb: 0, pl: 2, width: '100%' }}>
						<LinearProgressWithLabel value={(election.stats.with_data / election.stats.total) * 100} />
					</Box>
				)}
			</CardContent>
		</Card>
	);
}
