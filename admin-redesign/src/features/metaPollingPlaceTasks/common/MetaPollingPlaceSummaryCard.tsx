import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import type { IMetaPollingPlace, IMetaPollingPlaceNearbyToTask } from '../interfaces/metaPollingPlaceInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace | IMetaPollingPlaceNearbyToTask;
}

function MetaPollingPlaceSummaryCard(props: Props) {
	const { metaPollingPlace } = props;

	const theme = useTheme();

	return (
		<Card variant="outlined">
			<CardContent sx={{ pb: `${theme.spacing(2)} !important` }}>
				<Box>
					<Typography
						variant="h5"
						component="div"
						sx={{
							fontSize: 16,
							fontWeight: 500,
						}}
					>
						{metaPollingPlace.premises || 'NO_PREMISES'}
					</Typography>

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{/* {metaPollingPlace.address_1} */}
						{metaPollingPlace.jurisdiction}
					</Typography>

					{'distance_from_task_mpp_metres' in metaPollingPlace && (
						<Typography color="text.secondary" sx={{ fontSize: 15 }}>
							Distance from Task Meta Polling Place: {Math.round(metaPollingPlace.distance_from_task_mpp_metres)}m
						</Typography>
					)}
				</Box>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceSummaryCard;
