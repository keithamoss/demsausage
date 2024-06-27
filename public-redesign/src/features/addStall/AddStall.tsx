import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
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
	Step,
	StepContent,
	StepLabel,
	Stepper,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { getBaseURL } from '../../app/utils';
import AddStallIdentifyOwnership from './addStallIdentifyOwnership/addStallIdentifyOwnership';
import AddStallNomsAndStallDetailsForm from './addStallNomsAndStallDetailsForm/addStallNomsAndStallDetailsForm';
import AddStallSelectPollingPlace from './addStallSelectPollingPlace/addStallSelectPollingPlace';

const bottomNav = 56;

// interface Props {}

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

export default function AddStall(/*props: Props*/) {
	// const [sideDrawerOpen, setSideDrawerOpen] = React.useState(false);

	// const toggleSideDrawerOpen = (e: any) => {
	// 	setSideDrawerOpen(!sideDrawerOpen);
	// };

	const [activeStep, setActiveStep] = React.useState(0);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	//   const handleReset = () => {
	//     setActiveStep(0);
	//   };

	//   // TODO Vary if only one election is active
	//   const numberOfSteps = 5 - 1;

	const steps = [
		{
			label: 'Add a sausage sizzle or cake stall',
			description: ``,
		},
		{
			label: 'Where is the stall?',
			description: '',
		},
		{
			label: "Who's submitting?",
			description: ``,
		},
		{
			label: 'Tell us about the stall',
			description: ``,
		},
		{
			label: 'Stall submitted',
			description: ``,
		},
	];
	const maxSteps = steps.length;

	const theme = useTheme();
	//   const [activeStep, setActiveStep] = React.useState(0);
	//   const maxSteps = steps.length;

	//   const handleNext = () => {
	//     setActiveStep((prevActiveStep) => prevActiveStep + 1);
	//   };

	//   const handleBack = () => {
	//     setActiveStep((prevActiveStep) => prevActiveStep - 1);
	//   };

	const isStallOwner = true;

	const step1Content = (
		<React.Fragment>
			<Typography variant="body1" gutterBottom>
				Please complete the form below to add your stall to the map. Please do not submit entries that are offensive,
				political or do not relate to an election day stall. Please also make sure that you have authorisation to run
				your fundraising event at the polling place. All entries are moderated and subject to approval.
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
		</React.Fragment>
	);

	const step2Content = <AddStallSelectPollingPlace onDone={() => {}} />;

	const step3Content = <AddStallIdentifyOwnership onDone={() => {}} />;

	const step4Content = <AddStallNomsAndStallDetailsForm onDone={() => {}} />;

	return (
		<Root>
			<Helmet>
				<title>Add a sausage sizzle or cake stall to the map | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/add-stall/`} />
				<meta property="og:title" content="Add a sausage sizzle or cake stall to the map | Democracy Sausage" />
			</Helmet>

			<PageWrapper>
				{/* <div>
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            id dignissim justo. Nulla ut facilisis ligula. Interdum et malesuada
            fames ac ante ipsum primis in faucibus. Sed malesuada lobortis
            pretium
            <Button variant="contained" endIcon={<SendIcon />}>
              I'm running a stall
            </Button>
          </div>
          <Divider>
            <Chip label="OR" />
          </Divider>
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus
            id dignissim justo. Nulla ut facilisis ligula. Interdum et malesuada
            fames ac ante ipsum primis in faucibus. Sed malesuada lobortis
            pretium
            <Button variant="contained" endIcon={<SendIcon />}>
              I'm sending a tip-off about someone else's stall
            </Button>
          </div>
        </div> */}

				{/* <Typography variant="h5" gutterBottom>
          Victorian Election 2022
              </Typography> */}

				{/* <FormSection>
					<FormSectionHeader>There aren&apos;t any live elections at the moment</FormSectionHeader>
					<FormText>
						Thanks for your interest in submitting a stall, but there aren&apos;t any elections coming up that
						we&apos;re planning to cover. If you know of an election that you think we should cover, please get in touch
						with us at <a href="mailto:ausdemocracysausage@gmail.com">ausdemocracysausage@gmail.com</a> and we&apos;ll
						consider adding it.
					</FormText>
				</FormSection> */}

				<Box sx={{ /*maxWidth: 400, */ flexGrow: 1 /*, height: "70vh"*/ }}>
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
						<Typography variant="h6">{steps[activeStep].label}</Typography>
					</Paper>
					<Box sx={{ minHeight: 300, maxWidth: 400, width: '100%', p: 2 }}>
						{activeStep === 0 && step1Content}

						{activeStep === 1 && step2Content}

						{activeStep === 2 && step3Content}

						{activeStep === 3 && step4Content}

						{activeStep === 4 && <React.Fragment>Yay!</React.Fragment>}

						{/* {activeStep === 4 && (
              <React.Fragment>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      endIcon={<SendIcon />}
                    >
                      Submit Stall
                    </Button>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                  </div>
                </Box>
              </React.Fragment>
            )} */}
					</Box>

					<MobileStepper
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
					/>
				</Box>

				<Stepper activeStep={activeStep} orientation="vertical" sx={{ display: 'none' }}>
					<Step>
						<StepLabel>Add a sausage sizzle or cake stall</StepLabel>
						<StepContent>
							{step1Content}
							<Box sx={{ mb: 2 }}>
								<div>
									<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
										Continue
									</Button>
								</div>
							</Box>
						</StepContent>
					</Step>

					{/* <Step>
            <StepLabel
              optional={
                <Typography variant="caption">
                  Victorian Election 2022
                </Typography>
              }
            >
              Choose an election
            </StepLabel>
            <StepContent>
              <Typography>Foobar foobar foobar</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Continue
                  </Button>
                  <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step> */}

					<Step>
						<StepLabel optional={<Typography variant="caption">123 Fake Street, Fake Place</Typography>}>
							Where is the stall?
						</StepLabel>
						<StepContent>
							{step2Content}

							<Box sx={{ mb: 2 }}>
								<div>
									<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
										Continue
									</Button>
									<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
										Back
									</Button>
								</div>
							</Box>
						</StepContent>
					</Step>

					<Step>
						<StepLabel optional={<Typography variant="caption">My stall</Typography>}>Who&apos;s submitting?</StepLabel>
						<StepContent>
							{step3Content}
							<Box sx={{ mb: 2 }}>
								<div>
									<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
										Continue
									</Button>
									<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
										Back
									</Button>
								</div>
							</Box>
						</StepContent>
					</Step>

					<Step>
						<StepLabel optional={<Typography variant="caption">Last step</Typography>}>
							Tell us about the stall
						</StepLabel>
						<StepContent>
							{/* {isStallOwner === false && <div>Foobar</div>} */}
							<div>Foobar</div>

							{step3Content}

							<Box sx={{ mb: 2 }}>
								<div>
									<Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }} endIcon={<SendIcon />}>
										Submit Stall
									</Button>
									<Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
										Back
									</Button>
								</div>
							</Box>
						</StepContent>
					</Step>
				</Stepper>

				{/* {activeStep === numberOfSteps && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )} */}
			</PageWrapper>

			{/* <BottomBar /> */}
		</Root>
	);
}
