import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import {
	Avatar,
	Box,
	Button,
	Checkbox,
	Divider,
	FormControl,
	FormControlLabel,
	InputAdornment,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	MobileStepper,
	Paper,
	Radio,
	RadioGroup,
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import { styled, useTheme } from '@mui/material/styles';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Helmet } from 'react-helmet-async';
import { Election } from '../../app/services/elections';
import { getBaseURL } from '../../app/utils';
import SearchComponent from '../search/searchByAddressOrGPS/searchComponent';
import AddStallSelectPollingPlace from './addStallSelectPollingPlace/addStallSelectPollingPlace';
import AddStallStallForm from './addStallStallForm/addStallStallForm';
import AddStallWhoIsSubmitting from './addStallWhoIsSubmitting/addStallWhoIsSubmitting';
import AddStallSubmitted from './addStallSubmitted/addStallSubmitted';
import { useAppSelector } from '../../app/hooks/store';
import { selectActiveElections } from '../elections/electionsSlice';
import AddStallNoLiveElection from './addStallNoLiveElection/addStallNoLiveElection';
import AddStallSelectElection from './addStallSelectElection/addStallSelectElection';

const bottomNav = 56;

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	// Bg for light was grey[100]
	backgroundColor: theme.palette.mode === 'light' ? 'white' : theme.palette.background.default,
	paddingBottom: `${bottomNav}px`,
}));

const PageWrapper = styled('div')((/*{ theme }*/) => ({
	//   paddingLeft: theme.spacing(1),
	//   paddingRight: theme.spacing(1),
	'.MuiMobileStepper-positionStatic': {
		backgroundColor: grey[200],
	},
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
// function AddStallEntrypoint() {
// 	const activeElections = useAppSelector((state) => selectActiveElections(state));

// 	return <MapEntrypointLayer2 electionId={electionId} />;
// }

export default function AddStall() {
	const navigate = useNavigate();
	const location = useLocation();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	useEffect(() => {
		if (location.pathname === '/add-stall' || location.pathname === '/add-stall/') {
			if (activeElections.length >= 2) {
				// navigate('/add-stall/select-election/');
			} else if (activeElections.length === 1) {
				// navigate('/add-stall/select-polling-place/');
			}
		}
	}, [location, activeElections, navigate]);

	const [activeStep, setActiveStep] = React.useState(0);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	// eslint-disable-next-line
	// const [isStallOwner, setIsStallOwner] = React.useState<boolean | null>(false);

	// const steps = [
	// 	{
	// 		label: 'Add a sausage sizzle or cake stall',
	// 		description: ``,
	// 	},
	// 	{
	// 		label: 'Where is the stall?',
	// 		description: '',
	// 	},
	// 	{
	// 		label: "Who's submitting?",
	// 		description: ``,
	// 	},
	// 	{
	// 		label: 'Tell us about the stall',
	// 		description: ``,
	// 	},
	// 	{
	// 		label: 'Stall submitted',
	// 		description: ``,
	// 	},
	// ];

	const maxSteps = activeElections.length >= 2 ? 6 : 5;

	const theme = useTheme();

	return (
		<Root>
			<Helmet>
				<title>Add a sausage sizzle or cake stall | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/about/`} />
				<meta property="og:title" content="Add a sausage sizzle or cake stall | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				<Box sx={{ /*maxWidth: 400, */ flexGrow: 1 /*, height: "70vh"*/ }}>
					<Outlet />

					{/* {activeStep === 0 && (
						<React.Fragment>
							<Typography variant="body1" gutterBottom>
								Please complete the form below to add your stall to the map. Please do not submit entries that are
								offensive, political or do not relate to an election day stall. Please also make sure that you have
								authorisation to run your fundraising event at the polling place. All entries are moderated and subject
								to approval.
							</Typography>

							<List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
								<ListItemButton>
									<ListItemAvatar>
										<Avatar>
											<EmailIcon />
										</Avatar>
									</ListItemAvatar>
									<ListItemText
										primary="Having trouble submitting a stall?"
										secondary="ausdemocracysausage@gmail.com"
									/>
								</ListItemButton>
							</List>

							{activeElections.length === 0 ? (
								<AddStallNoLiveElection />
							) : activeElections.length >= 2 ? (
								<AddStallSelectElection />
							) : (
								<AddStallSelectPollingPlace />
							)}
						</React.Fragment>
					)} */}

					{/* {activeStep === 1 && (
						<React.Fragment>
							{activeElections.length >= 2 ? <AddStallSelectPollingPlace /> : <AddStallWhoIsSubmitting />}
						</React.Fragment>
					)}

					{activeStep === 2 && (
						<React.Fragment>
							{activeElections.length >= 2 ? <AddStallWhoIsSubmitting /> : <AddStallStallForm />}
						</React.Fragment>
					)}

					{activeStep === 3 && (
						<React.Fragment>
							{activeElections.length >= 2 ? <AddStallStallForm /> : <AddStallSubmitted />}
						</React.Fragment>
					)}

					{activeStep === 4 && activeElections.length >= 2 && <AddStallSubmitted />} */}

					{/* <MobileStepper
						variant="text"
						steps={maxSteps}
						position="bottom"
						activeStep={activeStep}
						nextButton={
							<Button
								size="small"
								onClick={handleNext}
								disabled={activeStep === maxSteps - 1}
								endIcon={
									theme.direction === 'rtl' ? (
										<KeyboardArrowLeft />
									) : activeStep === maxSteps - 1 ? (
										<SendIcon />
									) : (
										<KeyboardArrowRight />
									)
								}
							>
								{activeStep === maxSteps - 1 || activeStep === maxSteps - 2 ? 'Submit' : 'Next'}
							</Button>
						}
						backButton={
							<Button
								size="small"
								onClick={handleBack}
								disabled={activeStep === 0}
								startIcon={theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
							>
								Back
							</Button>
						}
					/> */}
				</Box>
			</PageWrapper>
		</Root>
	);
}
