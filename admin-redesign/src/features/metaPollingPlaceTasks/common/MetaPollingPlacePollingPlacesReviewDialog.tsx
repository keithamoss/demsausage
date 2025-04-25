import { CallSplit, Close, GppGood, MoveDown } from '@mui/icons-material';
import {
	AppBar,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Pagination,
	Stack,
	Toolbar,
	Typography,
} from '@mui/material';
import type {
	IMetaPollingPlace,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlacePollingPlacesReviewListItem from './MetaPollingPlacePollingPlacesReviewListItem';
import MetaPollingPlaceSummaryCard from './MetaPollingPlaceSummaryCard';

interface Props {
	pollingPlace: IPollingPlaceAttachedToMetaPollingPlace;
	metaPollingPlace: IMetaPollingPlace;
	metaPollingPlaces: IMetaPollingPlace[];
	onKeep: (pollingPlaceId: number) => () => void;
	onMove: (pollingPlaceId: number, metaPollingPlaceId: number) => () => void;
	onSplit: (pollingPlaceId: number) => () => void;
	pagePosition: number;
	totalPages: number;
	onClose: () => void;
}

function MetaPollingPlacePollingPlacesReviewDialog(props: Props) {
	const {
		pollingPlace,
		metaPollingPlace,
		metaPollingPlaces,
		onKeep,
		onMove,
		onSplit,
		pagePosition,
		totalPages,
		onClose,
	} = props;

	return (
		<Dialog open={true} fullWidth onClose={onClose}>
			<AppBar sx={{ position: 'relative', backgroundColor: 'inherit', color: 'inherit' }} elevation={0}>
				<Toolbar>
					<Typography sx={{ flex: 1 }} variant="h6" component="div">
						Review Polling Place
					</Typography>

					<IconButton edge="start" onClick={onClose} color="inherit">
						<Close />
					</IconButton>
				</Toolbar>
			</AppBar>

			<DialogContent sx={{ pt: 0, pb: 1 }}>
				<MetaPollingPlacePollingPlacesReviewListItem pollingPlace={pollingPlace} metaPollingPlace={metaPollingPlace} />

				<Typography sx={{ mt: 1, mb: 1 }} variant="subtitle2" component="div">
					Linked to meta polling place
				</Typography>

				<MetaPollingPlaceSummaryCard metaPollingPlace={metaPollingPlace} />
			</DialogContent>

			<DialogActions>
				<Stack flexGrow={1} spacing={1}>
					<Button
						disabled={false}
						size="small"
						onClick={onKeep(pollingPlace.id)}
						variant="outlined"
						startIcon={<GppGood />}
					>
						Keep in {metaPollingPlace.premises}
					</Button>

					{metaPollingPlaces
						.filter((mpp) => mpp.id !== metaPollingPlace.id)
						.map((mpp) => (
							<Button
								key={mpp.id}
								disabled={false}
								size="small"
								onClick={onMove(pollingPlace.id, mpp.id)}
								variant="outlined"
								startIcon={<MoveDown />}
							>
								Move to {mpp.premises}
							</Button>
						))}

					<Button
						disabled={false}
						size="small"
						onClick={onSplit(pollingPlace.id)}
						variant="outlined"
						startIcon={<CallSplit />}
					>
						Split and create a new MPP
					</Button>

					<Pagination
						count={totalPages}
						page={pagePosition}
						siblingCount={0}
						disabled
						sx={{
							pt: 1,
							'& .MuiPagination-ul': { justifyContent: 'center' },
							'& .MuiPaginationItem-previousNext': { display: 'none' },
							'& button': { color: 'black !important', opacity: '1 !important' },
						}}
					/>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}

export default MetaPollingPlacePollingPlacesReviewDialog;
