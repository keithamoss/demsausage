import AccessibleForwardIcon from '@mui/icons-material/AccessibleForward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { blueGrey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { IconsFlexboxHorizontalSummaryRow } from '../../icons/iconHelpers';
import type { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { getNomsIconsForPollingPlace } from '../searchBarHelpers';

interface Props {
	pollingPlace: IPollingPlace;
	onChoosePollingPlaceLabel: string;
	onChoosePollingPlace: (pollingPlace: IPollingPlace) => void;
}

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
}));

export default function SearchResultsPollingPlaceCard(props: Props) {
	const { pollingPlace, onChoosePollingPlaceLabel, onChoosePollingPlace } = props;

	const onClickPollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => () => {
			onChoosePollingPlace(pollingPlace);
		},
		[onChoosePollingPlace],
	);

	return (
		<React.Fragment>
			<Card variant="outlined">
				<StyledCardContent>
					{pollingPlace.stall !== null && (
						<IconsFlexboxHorizontalSummaryRow>
							{getNomsIconsForPollingPlace(pollingPlace, true, true)}
						</IconsFlexboxHorizontalSummaryRow>
					)}

					<Box onClick={onClickPollingPlace(pollingPlace)} sx={{ cursor: 'pointer' }}>
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
					</Box>
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
						onClick={onClickPollingPlace(pollingPlace)}
					>
						{onChoosePollingPlaceLabel}
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
			</Card>
		</React.Fragment>
	);
}
