import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { navigateToSearchDrawerRoot } from '../../../../app/routing/navigationHelpers';

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

interface Props {
	numberOfResults: number;
	onViewOnMap: () => void;
	children: JSX.Element[];
}

export default function PollingPlacesNearbySearchResultsContainer(props: Props) {
	const { numberOfResults, onViewOnMap, children } = props;

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const cameFromInternalNavigation = (location.state as LocationState)?.cameFromInternalNavigation === true;

	const onGoBack = useCallback(() => {
		// If we've arrived here by searching in the UI, we know we can just
		// go back and we'll remain within the search drawer interface.
		// In most cases, this should send them back to the list of Mapbox
		// place search results for them to choose a different place from
		// or to modify their search.
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to start a brand new search.
			navigateToSearchDrawerRoot(params, navigate);
		}
	}, [cameFromInternalNavigation, navigate, params]);

	return (
		<Box sx={{ width: '100%', marginTop: 1 }}>
			<Box
				sx={{
					width: '100%',
					marginBottom: 1,
					display: 'flex',
				}}
			>
				<Button
					size="small"
					sx={{
						flex: 1,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						color: 'black !important',
					}}
					disabled={true}
				>
					{numberOfResults} result{numberOfResults === 0 || numberOfResults > 1 ? 's' : ''} nearby
				</Button>

				<Button size="small" sx={{ mr: 1 }} startIcon={<MapIcon />} onClick={onViewOnMap} variant="contained">
					view on map
				</Button>

				<Button
					size="small"
					sx={{
						color: 'black !important',
					}}
					startIcon={<ArrowBackIcon />}
					onClick={onGoBack}
				>
					back
				</Button>
			</Box>

			{/* Handles not found and all other types of error */}
			{numberOfResults === 0 && (
				<Alert severity="info">
					<AlertTitle>No results found</AlertTitle>
					Sorry, we didn&lsquo;t find any polling places 😢
				</Alert>
			)}

			<Stack spacing={1}>{children}</Stack>
		</Box>
	);
}