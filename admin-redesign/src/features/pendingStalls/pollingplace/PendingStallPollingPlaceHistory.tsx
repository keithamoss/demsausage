import CloseIcon from '@mui/icons-material/Close';
import {
	Alert,
	AlertTitle,
	AppBar,
	IconButton,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useGetPollingPlaceHistoryByIdQuery } from '../../../app/services/pollingPlaces';
import { DialogWithTransition } from '../../../app/ui/dialog';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { getPollingPlaceHistoryEventIcon } from './pendingStallsPollingPlaceHelpers';

interface Props {
	pollingPlaceId: number;
	onClose: () => void;
}

function PendingStallPollingPlaceHistory(props: Props) {
	const { pollingPlaceId, onClose } = props;

	const {
		data: pollingPlaceHistory,
		isFetching: isFetchingPollingPlaceHistory,
		isSuccess: isSuccessFetchingPollingPlaceHistory,
	} = useGetPollingPlaceHistoryByIdQuery(pollingPlaceId);

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

			{isFetchingPollingPlaceHistory === true && <LinearProgress color="secondary" />}

			<Paper elevation={0} sx={{ p: 2, pt: 0 }}>
				{isFetchingPollingPlaceHistory === false &&
					isSuccessFetchingPollingPlaceHistory === true &&
					pollingPlaceHistory.length === 0 && (
						<Alert severity="info">
							<AlertTitle>No history found</AlertTitle>
							There haven&apos;t been any changes made to this polling place. Ever.
						</Alert>
					)}

				{isFetchingPollingPlaceHistory === false &&
					isSuccessFetchingPollingPlaceHistory === true &&
					pollingPlaceHistory.length > 0 && (
						<List>
							{pollingPlaceHistory?.map((item) => {
								const HistoryEventTypeIcon = getPollingPlaceHistoryEventIcon(item.type);

								return (
									<ListItem key={item.id}>
										<ListItemIcon>
											<HistoryEventTypeIcon sx={{ color: mapaThemePrimaryGrey }} />
										</ListItemIcon>

										<ListItemText
											primary={item.message}
											secondary={`${dayjs(item.timestamp).format('D MMMM YYYY')} at ${dayjs(item.timestamp).format('HH:mm')}`}
										/>
									</ListItem>
								);
							})}
						</List>
					)}
			</Paper>
		</DialogWithTransition>
	);
}

export default PendingStallPollingPlaceHistory;
