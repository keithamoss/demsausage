import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, MobileStepper, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { Coordinate } from 'ol/coordinate';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import {
	navigateToAddStallRoot,
	navigateToAddStallSearchDrawerAndInitiateGPSSearch,
	navigateToAddStallSearchListOfPollingPlacesFromGPSSearch,
	navigateToAddStallSearchListOfPollingPlacesFromMapboxResults,
	navigateToAddStallSearchMapboxResults,
	navigateToAddStallSelectPollingPlace,
	navigateToAddStallWhoIsSubmitting,
} from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { selectActiveElections } from '../../elections/electionsSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { IMapboxGeocodingAPIResponseFeature } from '../../search/searchBarHelpers';
import SearchComponent from '../../search/searchByAddressOrGPS/searchComponent';
import AddStallIntroMessage from '../addStallIntroMessage';
import { getHiddenStepperButton } from '../addStallStallForm/addStallFormHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
function AddStallSelectPollingPlaceEntrypointLayer1() {
	const params = useParams();

	const urlElectionName = getStringParamOrEmptyString(params, 'election_name');
	const activeElections = useAppSelector((state) => selectActiveElections(state));
	const election = activeElections.find((e) => e.name_url_safe === urlElectionName);

	if (election === undefined) {
		return null;
	}

	return <AddStallSelectPollingPlace election={election} activeElections={activeElections} />;
}

interface Props {
	election: Election;
	activeElections: Election[];
}

function AddStallSelectPollingPlace(props: Props) {
	const { election, activeElections } = props;

	const params = useParams();
	const navigate = useNavigate();

	const onClickBack = useCallback(() => navigateToAddStallRoot(navigate), [navigate]);

	const onMapboxSearchTermChange = useCallback(
		(searchTerm: string) => navigateToAddStallSearchMapboxResults(params, navigate, searchTerm),
		[navigate, params],
	);

	const onChooseMapboxSearchResult = useCallback(
		(feature: IMapboxGeocodingAPIResponseFeature) =>
			navigateToAddStallSearchListOfPollingPlacesFromMapboxResults(
				params,
				navigate,
				feature.place_name,
				feature.geometry.coordinates.join(','),
			),
		[navigate, params],
	);

	const onGPSControlClicked = useCallback(
		() => navigateToAddStallSearchDrawerAndInitiateGPSSearch(params, navigate),
		[navigate, params],
	);

	const onGPSLocationAcquired = useCallback(
		(currentPosition: Coordinate) =>
			navigateToAddStallSearchListOfPollingPlacesFromGPSSearch(params, navigate, currentPosition.join(',')),
		[navigate, params],
	);

	const onChoosePollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => navigateToAddStallWhoIsSubmitting(params, navigate, pollingPlace),
		[navigate, params],
	);

	const onGoBackFromSearch = useCallback(
		() => navigateToAddStallSelectPollingPlace(params, navigate),
		[navigate, params],
	);

	const onDiscardSearch = useCallback(() => navigateToAddStallSelectPollingPlace(params, navigate), [navigate, params]);

	return (
		<StyledInteractableBoxFullHeight>
			{activeElections.length === 1 && <AddStallIntroMessage />}

			<Paper
				square
				elevation={0}
				sx={{
					display: 'flex',
					alignItems: 'center',
					height: 50,
					pl: 2,
					bgcolor: 'grey.200',
				}}
			>
				<Typography variant="h6">Where is your stall?</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<SearchComponent
					election={election}
					autoFocusSearchField={true}
					enableFiltering={false}
					enableViewOnMap={false}
					onMapboxSearchTermChange={onMapboxSearchTermChange}
					onGPSControlClicked={onGPSControlClicked}
					onGPSLocationAcquired={onGPSLocationAcquired}
					onChooseMapboxSearchResult={onChooseMapboxSearchResult}
					onChoosePollingPlace={onChoosePollingPlace}
					onGoBackFromSearch={onGoBackFromSearch}
					onDiscardSearch={onDiscardSearch}
				/>
			</Box>

			<MobileStepper
				position="bottom"
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				activeStep={activeElections.length >= 2 ? 1 : 0}
				backButton={
					activeElections.length === 1 ? (
						getHiddenStepperButton()
					) : (
						<Button size="small" onClick={onClickBack} startIcon={<ArrowBackIcon />}>
							Back
						</Button>
					)
				}
				nextButton={getHiddenStepperButton()}
			/>
		</StyledInteractableBoxFullHeight>
	);
}

export default AddStallSelectPollingPlaceEntrypointLayer1;
