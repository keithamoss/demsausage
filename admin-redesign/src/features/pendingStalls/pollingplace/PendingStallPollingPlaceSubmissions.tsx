import CloseIcon from '@mui/icons-material/Close';
import { AppBar, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import { DialogWithTransition } from '../../../app/ui/dialog';
import PollingPlaceStallsList from '../../pollingPlaces/PollingPlaceStallsList';

interface Props {
	electionId: number;
	pollingPlaceId: number;
	onClose: () => void;
}

function PendingStallPollingPlaceSubmissions(props: Props) {
	const { electionId, pollingPlaceId, onClose } = props;

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<CloseIcon />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Polling Place Submisisons
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ p: 2 }}>
				<PollingPlaceStallsList pollingPlaceId={pollingPlaceId} />
			</Paper>
		</DialogWithTransition>
	);
}

export default PendingStallPollingPlaceSubmissions;
