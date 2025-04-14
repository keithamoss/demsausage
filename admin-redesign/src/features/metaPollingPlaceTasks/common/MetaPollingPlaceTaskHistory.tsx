import { Card, CardContent, List, ListItem, ListItemButton, ListItemText, type SxProps } from '@mui/material';
import dayjs from 'dayjs';
import type { IMetaPollingPlaceTaskJob } from '../interfaces/metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlaceTaskJob: IMetaPollingPlaceTaskJob;
	cardSxProps: SxProps;
}

function MetaPollingPlaceTaskHistory(props: Props) {
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
					{metaPollingPlaceTaskJob.history.map((item) => (
						<ListItem key={item.history_id} disablePadding>
							<ListItemButton>
								<ListItemText
									sx={{
										'& .MuiListItemText-primary': {
											fontSize: 16,
											fontWeight: 500,
										},
									}}
									primary={item.history_type === '+' ? 'Created' : item.status}
									secondary={`By ${item.history_user} on ${dayjs(item.history_date).format('D MMMM YYYY')} at ${dayjs(item.history_date).format('HH:mm')}`}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceTaskHistory;
