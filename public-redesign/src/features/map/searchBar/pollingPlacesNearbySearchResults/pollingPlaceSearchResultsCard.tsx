import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React from 'react';
import { IPollingPlace } from '../../../pollingPlaces/pollingPlacesInterfaces';
import { getNomsIconsForPollingPlace } from '../searchBarHelpers';

interface Props {
	pollingPlace: IPollingPlace;
	onChoosePollingPlace?: (pollingPlace: IPollingPlace) => void;
}

const FlexboxIcons = styled('div')(() => ({
	flexGrow: 1,
	svg: {
		paddingLeft: '5px',
		paddingRight: '5px',
		paddingBottom: '5px',
		width: '30px',
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

// @TODO
// - Where to put .name if not in the title of polling place?
// - How to handle Red Cross of Shame? How to phrase its tooltip?
// - How to handle no report?
// - How to handle a stall with no noms?
// - Check older elections

export default function PollingPlaceSearchResultsCard(props: Props) {
	const { pollingPlace, onChoosePollingPlace } = props;

	const onClickPollingPlace = (pollingPlace: IPollingPlace) => () => {
		if (onChoosePollingPlace !== undefined) {
			onChoosePollingPlace(pollingPlace);
		}
	};

	return (
		<React.Fragment>
			<StyledCard variant="outlined" onClick={onClickPollingPlace(pollingPlace)}>
				<StyledCardContent>
					{pollingPlace.stall !== null && (
						<FlexboxIcons>
							<FlexboxIcons>{getNomsIconsForPollingPlace(pollingPlace)}</FlexboxIcons>
						</FlexboxIcons>
					)}

					{/* {pollingPlace.stall === null && (
						<Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
							{pollingPlace.name}
						</Typography>
					)} */}

					<Typography
						variant="h5"
						component="div"
						sx={{
							fontSize: 16,
							fontWeight: 550,
							textTransform: 'uppercase',
						}}
					>
						{/* Gladstone Views, Gladstone Views Primary School */}
						{pollingPlace.premises}
					</Typography>
					{/* <Typography sx={{ mb: 1.5 }} color="text.secondary">
						Foobar
					</Typography> */}
					<Typography color="text.secondary">
						{/* Carrick Drive, Gladstone Park 3043 */}
						{pollingPlace.address}
					</Typography>
					{/* <Typography variant="body2">
						well meaning and kindly.
						<br />
						{'"a benevolent smile"'}
					</Typography> */}
				</StyledCardContent>
				<StyledCardActions>
					<Button size="small" startIcon={<UnfoldMoreIcon />}>
						Learn More
					</Button>
				</StyledCardActions>
			</StyledCard>
		</React.Fragment>
	);
}
