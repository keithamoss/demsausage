import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	Avatar,
	Box,
	Button,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	MobileStepper,
	Paper,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import {
	navigateToAddStallForm,
	navigateToAddStallSelectPollingPlace,
} from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { StallSubmitterType } from '../../../app/services/stalls';
import StallSubmitterTypeOwner from '../../../assets/stalls/submit_mystall.svg?react';
import StallSubmitterTypeTipOff from '../../../assets/stalls/submit_tipoff.svg?react';
import { selectActiveElections } from '../../elections/electionsSlice';
import { appBarHeight, mobileStepperMinHeight } from '../addStallHelpers';
import { getHiddenStepperButton } from '../addStallStallForm/addStallFormHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100dvh`,
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

interface LocationState {
	cameFromInternalNavigation?: boolean;
}

export default function AddStallWhoIsSubmitting() {
	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const urlPollingPlacePremises = getStringParamOrEmptyString(params, 'polling_place_premises').replaceAll('_', ' ');
	const urlPollingPlaceName = getStringParamOrEmptyString(params, 'polling_place_name').replaceAll('_', ' ');

	const cameFromInternalNavigation = (location.state as LocationState)?.cameFromInternalNavigation === true;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const onClickBack = useCallback(() => {
		// If we've arrived here from elsewhere in the add stall interface,
		// we know we can just go back and we'll remain within it.
		// In most cases, this should send them back to the list of
		// polling place search results for them to choose a different place from.
		//
		// Note that we can't just go back by constructing the URL from our URL params
		// here, because the URL on this page is:
		// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/submitter/:submitter_type/
		// and the URL on the page before this is:
		// /add-stall/:election_name/search/place/:search_term/:place_lon_lat/
		if (cameFromInternalNavigation === true) {
			navigate(-1);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to the start of selecting a polling place.
			navigateToAddStallSelectPollingPlace(params, navigate);
		}
	}, [cameFromInternalNavigation, navigate, params]);

	const onChooseStallOwner = useCallback(
		() => navigateToAddStallForm(params, navigate, StallSubmitterType.Owner),
		[navigate, params],
	);

	const onChooseStallTipOff = useCallback(
		() => navigateToAddStallForm(params, navigate, StallSubmitterType.TipOff),
		[navigate, params],
	);

	return (
		<StyledInteractableBoxFullHeight>
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
				<Typography variant="h6">{urlPollingPlacePremises || urlPollingPlaceName}</Typography>
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
				<Typography variant="h6">Who&apos;s submitting?</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<List
					// This ensures the padding here matches whats on AddStallStallCreatorForm
					sx={{
						pt: 0,
						'& .MuiListItemButton-root:first-of-type': {
							pt: 0,
						},
					}}
				>
					<ListItemButton sx={{ marginBottom: 0 }} onClick={onChooseStallOwner}>
						<ListItemAvatar>
							<Avatar sx={{ backgroundColor: 'transparent' }}>
								<StallSubmitterTypeOwner style={{ width: 28, height: 28 }} />
							</Avatar>
						</ListItemAvatar>

						<ListItemText primary="I'm involved in running this stall" />
					</ListItemButton>

					<ListItemButton onClick={onChooseStallTipOff}>
						<ListItemAvatar>
							<Avatar sx={{ backgroundColor: 'transparent' }}>
								<StallSubmitterTypeTipOff style={{ width: 28, height: 28 }} />
							</Avatar>
						</ListItemAvatar>

						<ListItemText primary="I've seen or heard about a stall" />
					</ListItemButton>
				</List>
			</Box>

			<MobileStepper
				position="bottom"
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				activeStep={activeElections.length >= 2 ? 2 : 1}
				backButton={
					<Button size="small" onClick={onClickBack} startIcon={<ArrowBackIcon />}>
						Back
					</Button>
				}
				nextButton={getHiddenStepperButton()}
			/>
		</StyledInteractableBoxFullHeight>
	);
}
