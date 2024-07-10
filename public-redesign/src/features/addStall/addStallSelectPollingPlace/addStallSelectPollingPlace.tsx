import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmailIcon from '@mui/icons-material/Email';
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
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { navigateToAddStallPollingPlace } from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { selectActiveElections } from '../../elections/electionsSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import SearchComponent from '../../search/searchByAddressOrGPS/searchComponent';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

export default function AddStallSelectPollingPlace(/*props: Props*/) {
	const params = useParams();
	const navigate = useNavigate();

	const urlElectionName = getStringParamOrEmptyString(params, 'election_name');

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const election = activeElections.find((e) => e.name_url_safe === urlElectionName);

	const handleNext = () => {
		// setActiveStep((prevActiveStep) => prevActiveStep + 1);
		// navigate('/add-stall/stall-ownership/');
	};

	const handleBack = () => {
		// setActiveStep((prevActiveStep) => prevActiveStep - 1);

		navigate('/add-stall/');
		// navigate(-1);

		// navigate(`/add-stall/${urlElectionName}/`);

		// if (activeElections.length >= 2) {
		// 	navigate('/add-stall/');
		// } else {
		// 	navigate('/add-stall/');
		// }
	};

	// const [whoIsSubmitting, setWhoIsSubmitting] = React.useState<string>();
	// const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) =>
	// 	setWhoIsSubmitting(value);

	if (activeElections.length === 0) {
		return null;
	}

	if (election === undefined) {
		return null;
	}

	return (
		<StyledInteractableBoxFullHeight>
			{activeElections.length === 1 && (
				<React.Fragment>
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
						<Typography variant="h6">Add Stall</Typography>
					</Paper>

					<Box sx={{ minHeight: 300, maxWidth: 400, width: '100%', p: 2 }}>
						<Typography variant="body1" gutterBottom>
							Please complete the form below to add your stall to the map. Please do not submit entries that are
							offensive, political or do not relate to an election day stall. Please also make sure that you have
							authorisation to run your fundraising event at the polling place. All entries are moderated and subject to
							approval.
						</Typography>

						<List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar>
										<EmailIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary="Having trouble submitting a stall?" secondary="ausdemocracysausage@gmail.com" />
							</ListItemButton>
						</List>
					</Box>
				</React.Fragment>
			)}

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
				<Typography variant="h6">Selecting polling place</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300,*/ /*maxWidth: 400, */ width: '100%', p: 2 }}>
				<React.Fragment>
					<Typography>Foobar foobar foobar</Typography>
					<br />
					<SearchComponent
						election={election}
						autoFocusSearchField={true}
						enableFiltering={false}
						enableViewOnMap={false}
						onChoosePollingPlace={(pollingPlace: IPollingPlace) =>
							navigateToAddStallPollingPlace(params, navigate, pollingPlace)
						}
					/>{' '}
				</React.Fragment>
			</Box>

			<MobileStepper
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				position="bottom"
				activeStep={activeElections.length >= 2 ? 1 : 0}
				nextButton={
					<Button size="small" onClick={handleNext} disabled={true} endIcon={<ArrowForwardIcon />}>
						Next
					</Button>
				}
				backButton={
					<Button size="small" onClick={handleBack} disabled={false} startIcon={<ArrowBackIcon />}>
						Back
					</Button>
				}
			/>
		</StyledInteractableBoxFullHeight>
	);
}
