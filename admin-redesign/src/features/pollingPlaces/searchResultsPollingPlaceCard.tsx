import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useCallback } from 'react';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import { IconsFlexboxHorizontalSummaryRow } from '../icons/iconHelpers';
import { getNomsIconsBar } from './pollingPlaceSearchHelpers';
import type { IPollingPlace } from './pollingPlacesInterfaces';

interface Props {
	pollingPlace: IPollingPlace;
	searchTerm: string;
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
	const { pollingPlace, searchTerm, onChoosePollingPlaceLabel, onChoosePollingPlace } = props;

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
							{getNomsIconsBar(pollingPlace.stall.noms, true, true)}
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
							{parse(
								pollingPlace.premises || pollingPlace.name,
								match(pollingPlace.premises || pollingPlace.name, searchTerm, {
									insideWords: true,
								}),
							).map((part, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									style={{
										color: part.highlight ? mapaThemePrimaryPurple : undefined,
									}}
								>
									{part.text}
								</span>
							))}
						</Typography>

						<Typography color="text.secondary" sx={{ fontSize: 15 }}>
							{parse(
								pollingPlace.address,
								match(pollingPlace.address, searchTerm, {
									insideWords: true,
								}),
							).map((part, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									key={index}
									style={{
										fontWeight: part.highlight ? 500 : undefined,
										color: part.highlight ? mapaThemePrimaryPurple : undefined,
									}}
								>
									{part.text}
								</span>
							))}
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
				</StyledCardActions>
			</Card>
		</React.Fragment>
	);
}
