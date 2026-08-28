import { Box, Card, CardContent, Chip, Typography, useTheme } from '@mui/material';
import { type eJurisdiction, jurisdictions } from '../../icons/jurisdictionHelpers';
import {
	type IMetaPollingPlace,
	type IMetaPollingPlaceNearbyToTask,
	IMetaPollingPlaceStatus,
} from '../interfaces/metaPollingPlaceInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace | IMetaPollingPlaceNearbyToTask;
	roleLabel?: 'Task MPP' | 'Nearby candidate';
	showDuplicateNameWarning?: boolean;
}

function MetaPollingPlaceSummaryCard(props: Props) {
	const { metaPollingPlace, roleLabel, showDuplicateNameWarning = false } = props;

	const theme = useTheme();

	return (
		<Card variant="outlined">
			<CardContent sx={{ pb: `${theme.spacing(2)} !important` }}>
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
						<Typography
							variant="h5"
							component="div"
							sx={{
								fontSize: 16,
								fontWeight: 500,
								fontStyle: metaPollingPlace.premises ? 'normal' : 'italic',
							}}
						>
							{metaPollingPlace.premises || '(no premises name)'}
						</Typography>

						<Chip label={`MPP #${metaPollingPlace.id}`} size="small" />

						{!metaPollingPlace.premises && <Chip label="Missing premises" size="small" color="warning" />}

						{metaPollingPlace.status === IMetaPollingPlaceStatus.DRAFT && (
							<Chip label="Draft" size="small" color="warning" />
						)}

						{roleLabel !== undefined && <Chip label={roleLabel} size="small" variant="outlined" />}

						{showDuplicateNameWarning === true && <Chip label="Same-name nearby MPP" size="small" color="warning" />}
					</Box>

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{/* {metaPollingPlace.address_1} */}
						{jurisdictions[metaPollingPlace.jurisdiction?.toLowerCase() as eJurisdiction]?.name ??
							metaPollingPlace.jurisdiction}
					</Typography>

					{'distance_from_task_mpp_metres' in metaPollingPlace && (
						<Typography color="text.secondary" sx={{ fontSize: 15 }}>
							Distance from Task Meta Polling Place: {Math.round(metaPollingPlace.distance_from_task_mpp_metres)}m
						</Typography>
					)}

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{metaPollingPlace.polling_places.length} linked polling place
						{metaPollingPlace.polling_places.length !== 1 ? 's' : ''}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceSummaryCard;
