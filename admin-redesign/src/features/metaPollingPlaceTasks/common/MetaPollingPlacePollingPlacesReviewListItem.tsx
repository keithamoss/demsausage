import { ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { DiffRedSXPropsNoStrikethrough, diffWordsAndFormat } from '../../../app/utils-diff';
import type {
	IMetaPollingPlace,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';

interface Props {
	pollingPlace: IPollingPlaceAttachedToMetaPollingPlace;
	metaPollingPlace: IMetaPollingPlace;
}

function MetaPollingPlacePollingPlacesReviewListItem(props: Props) {
	const { pollingPlace, metaPollingPlace } = props;

	return (
		<ListItem>
			{' '}
			<ListItemText
				sx={{
					'& .MuiListItemText-primary': {
						fontSize: 16,
						fontWeight: 500,
					},
				}}
				primary={diffWordsAndFormat(metaPollingPlace.premises, pollingPlace.premises)}
				secondary={
					<React.Fragment>
						<Typography component={'span'} sx={{ display: 'block' }}>
							{pollingPlace.address}
						</Typography>
						<Typography component={'span'} sx={{ display: 'block' }}>
							{pollingPlace.name}
						</Typography>
						<Typography
							component={'span'}
							sx={{
								display: 'block',
								'& .distance':
									pollingPlace.distance_from_meta_polling_place_metres > 0 ? DiffRedSXPropsNoStrikethrough : undefined,
							}}
						>
							Distance from Meta Polling Place:{' '}
							<span className="distance">{Math.round(pollingPlace.distance_from_meta_polling_place_metres)}m</span>
						</Typography>
						<Typography component={'span'} sx={{ display: 'block' }}>
							{pollingPlace.election_name}
						</Typography>
					</React.Fragment>
				}
			/>
		</ListItem>
	);
}

export default MetaPollingPlacePollingPlacesReviewListItem;
