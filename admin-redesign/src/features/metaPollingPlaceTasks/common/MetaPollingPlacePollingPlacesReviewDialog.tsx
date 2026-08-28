import { CallSplit, Close, GppGood, MoveDown, Undo } from '@mui/icons-material';
import {
	AppBar,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Stack,
	Toolbar,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import type {
	IMetaPollingPlace,
	IMetaPollingPlaceNearbyToTask,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';
import { IMetaPollingPlaceStatus } from '../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlacePollingPlacesReviewListItem from './MetaPollingPlacePollingPlacesReviewListItem';
import MetaPollingPlaceSummaryCard from './MetaPollingPlaceSummaryCard';

interface Props {
	pollingPlace: IPollingPlaceAttachedToMetaPollingPlace;
	metaPollingPlace: IMetaPollingPlace;
	metaPollingPlaces: Array<IMetaPollingPlace | IMetaPollingPlaceNearbyToTask>;
	onKeep: (pollingPlaceId: number) => () => void;
	onMove: (pollingPlaceId: number, metaPollingPlaceId: number) => () => void;
	onSplit: (pollingPlaceId: number) => () => void;
	pagePosition: number;
	totalPages: number;
	onClose: () => void;
	canUndo?: boolean;
	onUndo?: () => void;
}

interface ActionLogEntry {
	key: number;
	label: string;
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
		canUndo,
		onUndo,
	} = props;

	const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);

	const logAndKeep = () => {
		setActionLog((prev) => [
			...prev,
			{
				key: pollingPlace.id,
				label: `Keep: MPP #${metaPollingPlace.id} (${metaPollingPlace.premises})`,
			},
		]);
		onKeep(pollingPlace.id)();
	};

	const logAndMove = (mpp: IMetaPollingPlace | IMetaPollingPlaceNearbyToTask) => () => {
		setActionLog((prev) => [
			...prev,
			{
				key: pollingPlace.id,
				label: `Move → MPP #${mpp.id} (${mpp.premises})`,
			},
		]);
		onMove(pollingPlace.id, mpp.id)();
	};

	const logAndSplit = () => {
		setActionLog((prev) => [
			...prev,
			{
				key: pollingPlace.id,
				label: `Split from MPP #${metaPollingPlace.id} (${metaPollingPlace.premises})`,
			},
		]);
		onSplit(pollingPlace.id)();
	};

	const handleUndo = () => {
		setActionLog((prev) => prev.slice(0, -1));
		onUndo?.();
	};

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
					{canUndo === true && (
						<Button size="small" onClick={handleUndo} variant="text" startIcon={<Undo />} color="warning">
							Undo last
						</Button>
					)}

					<Button disabled={false} size="small" onClick={logAndKeep} variant="outlined" startIcon={<GppGood />}>
						Keep in MPP #{metaPollingPlace.id} ({metaPollingPlace.premises || '(no premises name)'})
					</Button>

					{metaPollingPlaces
						.filter((mpp) => mpp.id !== metaPollingPlace.id)
						.map((mpp) => {
							const isDraft = mpp.status === IMetaPollingPlaceStatus.DRAFT;
							return (
								<Button
									key={mpp.id}
									disabled={false}
									size="small"
									onClick={logAndMove(mpp)}
									variant="outlined"
									color={isDraft ? 'warning' : 'primary'}
									startIcon={<MoveDown />}
									sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
								>
									<Box>
										<Typography variant="body2" fontWeight={500} component="span" sx={{ display: 'block' }}>
											Move → {mpp.premises || '(no premises name)'}
										</Typography>
										<Typography
											variant="caption"
											color={isDraft ? 'warning.main' : 'text.secondary'}
											component="span"
											sx={{ display: 'block' }}
										>
											MPP #{mpp.id} · {mpp.jurisdiction}
											{'distance_from_task_mpp_metres' in mpp
												? ` · ${Math.round(mpp.distance_from_task_mpp_metres)}m`
												: ''}
											{' · '}
											{mpp.polling_places.length} PP{mpp.polling_places.length !== 1 ? 's' : ''}
											{isDraft ? ' · ⚠ Draft MPP' : ''}
										</Typography>
									</Box>
								</Button>
							);
						})}

					<Button disabled={false} size="small" onClick={logAndSplit} variant="outlined" startIcon={<CallSplit />}>
						Split and create a new MPP
					</Button>

					{actionLog.length > 0 && (
						<Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ pt: 1 }}>
							{actionLog.map((entry, i) => (
								<Chip key={`${entry.key}-${i}`} label={entry.label} size="small" variant="outlined" />
							))}
						</Stack>
					)}

					<Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 1 }}>
						Polling place {pagePosition} of {totalPages}
					</Typography>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}

export default MetaPollingPlacePollingPlacesReviewDialog;
