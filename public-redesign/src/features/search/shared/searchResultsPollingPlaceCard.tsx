import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { blueGrey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { getNomsIconsForPollingPlace } from '../searchBarHelpers';

interface Props {
	pollingPlace: IPollingPlace;
	onChoosePollingPlace?: (pollingPlace: IPollingPlace) => void;
}

const FlexboxIcons = styled('div')(() => ({
	flexGrow: 1,
	svg: {
		// paddingRight: '5px',
		// paddingBottom: '5px',
		width: '30px',
		height: '30px',
	},
}));

const StyledCard = styled(Card)(() => ({
	cursor: 'pointer',
}));

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
}));

export default function SearchResultsPollingPlaceCard(props: Props) {
	const { pollingPlace, onChoosePollingPlace } = props;

	const onClickPollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => () => {
			if (onChoosePollingPlace !== undefined) {
				onChoosePollingPlace(pollingPlace);
			}
		},
		[onChoosePollingPlace],
	);

	return (
		<React.Fragment>
			<StyledCard variant="outlined" onClick={onClickPollingPlace(pollingPlace)}>
				<StyledCardContent>
					{pollingPlace.stall !== null && (
						<FlexboxIcons>
							<FlexboxIcons>{getNomsIconsForPollingPlace(pollingPlace, true)}</FlexboxIcons>
						</FlexboxIcons>
					)}

					<Typography
						variant="h5"
						component="div"
						sx={{
							fontSize: 16,
							fontWeight: 500,
						}}
					>
						{pollingPlace.premises || pollingPlace.name}
					</Typography>

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{pollingPlace.address}
					</Typography>
				</StyledCardContent>

				<StyledCardActions>
					<Button
						size="small"
						startIcon={<ArrowForwardIcon />}
						sx={{
							flex: 1,
							justifyContent: 'flex-start',
							pl: 1,
						}}
					>
						Learn More
					</Button>

					<Button
						size="small"
						startIcon={<AccessibleForwardIcon />}
						disabled={true}
						sx={{ color: `${blueGrey.A700} !important` }}
					>
						{pollingPlace.wheelchair_access}
					</Button>
				</StyledCardActions>
			</StyledCard>
		</React.Fragment>
	);
}
