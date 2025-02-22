import { Construction } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, AppBar, IconButton, Paper, Toolbar, Typography } from '@mui/material';
import { DialogWithTransition } from '../../../app/ui/dialog';

interface Props {
	onClose: () => void;
}

function PendingStallPollingPlaceHistory(props: Props) {
	const { onClose } = props;

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<CloseIcon />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Polling Place History
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ m: 3 }}>
				<Alert severity="warning" icon={<Construction />}>
					<AlertTitle>under_construction.gif</AlertTitle>
					This page will contain a timeline of events relating to the polling place.
				</Alert>
			</Paper>
		</DialogWithTransition>
	);
}

export default PendingStallPollingPlaceHistory;
