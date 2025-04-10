import { GppBad, GppGood } from '@mui/icons-material';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	type SxProps,
	Typography,
} from '@mui/material';
import React from 'react';
import type { IMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlacePollingPlacesReviewList(props: Props) {
	const { metaPollingPlace, cardSxProps } = props;

	// @TODO Use red/green highlighting to diff against the MPP details?

	return (
		<Card variant="outlined" sx={cardSxProps}>
			<CardContent>
				<List disablePadding>
					{metaPollingPlace.polling_places.map((pollingPlace) => (
						<ListItem key={pollingPlace.id} disablePadding>
							<ListItemButton>
								<ListItemText
									sx={{
										'& .MuiListItemText-primary': {
											fontSize: 16,
											fontWeight: 500,
										},
									}}
									primary={pollingPlace.premises}
									secondary={
										<React.Fragment>
											<Typography component={'span'} sx={{ display: 'block' }}>
												{pollingPlace.address}
											</Typography>
											<Typography component={'span'} sx={{ display: 'block' }}>
												{pollingPlace.name}
											</Typography>
											<Typography component={'span'} sx={{ display: 'block' }}>
												{pollingPlace.election_name}
											</Typography>
										</React.Fragment>
									}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</CardContent>

			<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
				<Button variant="outlined" startIcon={<GppGood />}>
					Looks good!
				</Button>

				<Button variant="outlined" color="error" startIcon={<GppBad />}>
					Looks suss!
				</Button>
			</CardActions>
		</Card>
	);
}

export default MetaPollingPlacePollingPlacesReviewList;
