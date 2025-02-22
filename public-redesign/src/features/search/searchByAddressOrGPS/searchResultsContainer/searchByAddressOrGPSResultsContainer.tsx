import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapIcon from '@mui/icons-material/Map';
import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

interface Props {
	numberOfResults: number;
	isFiltered: boolean;
	isSearchingByGPS: boolean;
	pollingPlacesLoaded: boolean;
	enableViewOnMap: boolean;
	onViewOnMap: () => void;
	onGoBackFromSearch: () => void;
	children: JSX.Element[];
}

export default function SearchByAddressOrGPSResultsContainer(props: Props) {
	const {
		numberOfResults,
		isFiltered,
		isSearchingByGPS,
		pollingPlacesLoaded,
		enableViewOnMap,
		onViewOnMap,
		onGoBackFromSearch,
		children,
	} = props;

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
			onGoBackFromSearch();
		}
	}, [cameFromInternalNavigation, navigate, onGoBackFromSearch]);

	return (
		<Box sx={{ width: '100%', marginTop: 1 }}>
			<Box
				sx={{
					width: '100%',
					// Matches the padding on the root <Box> in SearchBar
					marginBottom: 1.5,
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

				{enableViewOnMap === true && (
					<Button size="small" sx={{ mr: 1 }} startIcon={<MapIcon />} onClick={onViewOnMap} variant="outlined">
						view on map
					</Button>
				)}

				<Button size="small" startIcon={<ArrowBackIcon />} onClick={onGoBack} variant="outlined">
					back
				</Button>
			</Box>

			{pollingPlacesLoaded === false && (
				<Alert
					severity="warning"
					sx={{
						mb: 1,
						// The banner's colour at 50% opacity
						backgroundColor: 'rgba(249, 205, 95, 0.5)',
						color: 'rgba(0, 0, 0, 0.87)',
						'& svg': {
							// The primary colour on the sausage icon
							// color: '#ff9000',
						},
					}}
				>
					<AlertTitle>We don&apos;t have the official list of polling places yet</AlertTitle>
					So for now, we&apos;re listing stall locations based on reports from the community.
				</Alert>
			)}

			{/* Handles not found and all other types of error */}
			{numberOfResults === 0 && (
				<Alert severity="info">
					<AlertTitle>No results found</AlertTitle>
					{isSearchingByGPS === true
						? "Sorry, we couldn't find any polling places close to your GPS location 😢"
						: isFiltered === true
							? "Sorry, we couldn't find any polling places that match your filter criteria 😢"
							: "Sorry, we couldn't find any polling places 😢"}
				</Alert>
			)}

			<Stack spacing={1}>{children}</Stack>
		</Box>
	);
}
