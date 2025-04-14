import { Card, CardContent, List, ListItem, ListItemButton, ListItemText, type SxProps } from '@mui/material';
import dayjs from 'dayjs';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	cardSxProps: SxProps;
}

function MetaPollingPlaceRemarks(props: Props) {
	const { metaPollingPlaceTaskJob, cardSxProps } = props;

	if (metaPollingPlaceTaskJob.remarks.length === 0) {
		return null;
	}

	return (
		<Card variant="outlined" sx={cardSxProps}>
			{/* <CardHeader
					avatar={
						<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} aria-label="recipe">
							{metaPollingPlace.polling_places.length}
						</Avatar>
					}
					title="Linked polling places"
					// subheader="September 14, 2016"
				/> */}

			<CardContent sx={{ pt: 0, pb: '0 !important' }}>
				<List disablePadding>
					{metaPollingPlaceTaskJob.remarks.map((remark) => (
						<ListItem key={remark.id} disablePadding>
							<ListItemButton>
								<ListItemText
									sx={{
										'& .MuiListItemText-primary': {
											fontSize: 16,
											fontWeight: 500,
											whiteSpace: 'pre-line',
										},
									}}
									primary={remark.text}
									secondary={`By ${remark.user} on ${dayjs(remark.created_on).format('D MMMM YYYY')} at ${dayjs(remark.created_on).format('HH:mm')}`}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceRemarks;
