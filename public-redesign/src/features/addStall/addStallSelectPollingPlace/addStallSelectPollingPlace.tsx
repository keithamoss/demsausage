import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
	Alert,
	AlertTitle,
	Avatar,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	MobileStepper,
	Paper,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import type { Coordinate } from 'ol/coordinate';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import {
	navigateToAddStallRoot,
	navigateToAddStallSearchDrawerAndInitiateGPSSearch,
	navigateToAddStallSearchListOfPollingPlacesFromGPSSearch,
	navigateToAddStallSearchListOfPollingPlacesFromMapboxResults,
	navigateToAddStallSearchMapboxResults,
	navigateToAddStallSelectPollingPlace,
	navigateToAddStallSubmitterType,
	navigateToAddStallSubmitterTypeFromMapboxFeature,
} from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import type { Election } from '../../../app/services/elections';
import { appBarHeight } from '../../../app/ui/theme';
import { getBaseURL } from '../../../app/utils';
import { selectActiveElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReact } from '../../icons/jurisdictionHelpers';
import { getPollingPlacePermalinkFromElectionAndPollingPlace } from '../../pollingPlaces/pollingPlaceHelpers';
import type { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import {
	type IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
	mapboxSearchTypesForElectionsWithoutPollingPlaces,
} from '../../search/searchBarHelpers';
import SearchComponent from '../../search/searchByAddressOrGPS/searchComponent';
import { getHiddenStepperButton, mobileStepperMinHeight } from '../../stalls/stallFormHelpers';
import AddStallIntroMessage from '../addStallIntroMessage';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100dvh`,
	paddingBottom: appBarHeight + mobileStepperMinHeight,
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

	const theme = useTheme();
	const isResponsiveFullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const onClickBack = useCallback(() => navigateToAddStallRoot(navigate), [navigate]);

	const onMapboxSearchTermChange = useCallback(
		(searchTerm: string) => navigateToAddStallSearchMapboxResults(params, navigate, searchTerm),
		[navigate, params],
	);

	const onChooseMapboxSearchResult = useCallback(
		(feature: IMapboxGeocodingAPIResponseFeature) => {
			if (election.polling_places_loaded === true) {
				navigateToAddStallSearchListOfPollingPlacesFromMapboxResults(
					params,
					navigate,
					feature.place_name,
					feature.geometry.coordinates.join(','),
				);
			} else {
				navigateToAddStallSubmitterTypeFromMapboxFeature(params, navigate, feature);
			}
		},
		[election.polling_places_loaded, navigate, params],
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

	const onGoBackFromSearch = useCallback(
		() => navigateToAddStallSelectPollingPlace(params, navigate),
		[navigate, params],
	);

	const onDiscardSearch = useCallback(() => navigateToAddStallSelectPollingPlace(params, navigate), [navigate, params]);

	// ######################
	// Selecting A Polling Place
	// ######################
	const onChoosePollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => {
			if (pollingPlace.stall === null) {
				navigateToAddStallSubmitterType(params, navigate, pollingPlace);
			} else {
				setSelectedPollingPlace(pollingPlace);
			}
		},
		[navigate, params],
	);

	const [selectedPollingPlace, setSelectedPollingPlace] = useState<IPollingPlace | undefined>(undefined);

	const onCloseDialog = useCallback(() => {
		setSelectedPollingPlace(undefined);
	}, []);

	const onChoosePollingPlaceAndContinue = useCallback(() => {
		if (selectedPollingPlace !== undefined) {
			navigateToAddStallSubmitterType(params, navigate, selectedPollingPlace);
		}
	}, [navigate, params, selectedPollingPlace]);
	// ######################
	// Selecting A Polling Place (End)
	// ######################

	return (
		<StyledInteractableBoxFullHeight>
			{activeElections.length === 1 && <AddStallIntroMessage election={election} />}

			<Dialog fullScreen={isResponsiveFullScreen} open={selectedPollingPlace !== undefined} onClose={onCloseDialog}>
				<DialogTitle>We&apos;ve already had a submission for this polling place</DialogTitle>

				<DialogContent>
					<Alert severity="info" icon={<EditIcon />} sx={{ mb: 2 }}>
						<AlertTitle>Would you like to edit it?</AlertTitle>
						If you submitted this stall previously and you&apos;d now like to make a change, check your inbox for the
						confirmation email we sent you. There&apos;s a link in there that will let you edit your stall.
					</Alert>

					<Alert severity="success" icon={<FiberNewIcon />}>
						<AlertTitle>Have another stall to add?</AlertTitle>
						If this wasn&apos;t submitted by you, or if you&apos;re running another stall at this booth, please review
						what&apos;s already here (just click &apos;Open Polling Place&apos; below) and consider if you still need to
						list your stall. If you do still want to send in your submission, just hit &apos;Continue&apos; below.
					</Alert>

					<List sx={{ display: 'none' }}>
						<ListItem>
							<ListItemAvatar>
								<Avatar
									sx={{
										width: 58,
										height: 58,
										marginRight: 2,
										// backgroundColor: 'transparent',
										'& svg': {
											width: 50,
										},
									}}
								>
									<EditIcon />
								</Avatar>
							</ListItemAvatar>

							<ListItemText
								primary="Would you like to edit it?"
								secondary="If this was you and you'd like to make a change, check your inbox for the
                  confirmation email we sent you. There's a link in there that will let you edit your stall."
							/>
						</ListItem>

						<ListItem>
							<ListItemAvatar>
								<Avatar
									sx={{
										width: 58,
										height: 58,
										marginRight: 2,
										// backgroundColor: 'transparent',
										'& svg': {
											width: 50,
										},
									}}
								>
									<FiberNewIcon />
								</Avatar>
							</ListItemAvatar>

							<ListItemText
								primary="Have another stall to add?"
								secondary="If this wasn't you, or if you're running another stall at this booth, please review what's already here and consider if you need to list your stall in addition to the existing
                  one. If you still want to add content, you can do so below."
							/>
						</ListItem>
					</List>
				</DialogContent>

				<DialogActions>
					<Button onClick={onCloseDialog}>Close</Button>
					{selectedPollingPlace !== undefined && (
						<Button
							startIcon={<OpenInNewIcon />}
							href={`${getBaseURL()}${getPollingPlacePermalinkFromElectionAndPollingPlace(election, selectedPollingPlace)}`}
							target="_blank"
						>
							Open Polling Place
						</Button>
					)}
					<Button onClick={onChoosePollingPlaceAndContinue}>Continue</Button>
				</DialogActions>
			</Dialog>

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
				<Avatar
					sx={{
						width: 36,
						height: 36,
						marginRight: 2,
						backgroundColor: 'transparent',
						'& svg': {
							width: 50,
						},
					}}
				>
					{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
				</Avatar>

				<Typography variant="h6">{election.name}</Typography>
			</Paper>

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
					mapboxSearchTypes={
						election.polling_places_loaded === false
							? mapboxSearchTypesForElectionsWithoutPollingPlaces
							: defaultMapboxSearchTypes
					}
					enableFiltering={false}
					enableViewOnMap={false}
					onMapboxSearchTermChange={onMapboxSearchTermChange}
					onChooseMapboxSearchResult={onChooseMapboxSearchResult}
					onGPSControlClicked={onGPSControlClicked}
					onGPSLocationAcquired={onGPSLocationAcquired}
					onChoosePollingPlaceLabel="Select Polling Place"
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
