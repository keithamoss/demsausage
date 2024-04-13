import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
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
import * as React from 'react';
import { Election } from '../../app/services/elections';
import { NomsOptionsAvailable } from '../icons/noms';
import SearchBar from '../map/searchBar/searchBar';

const bottomNav = 56;

interface Props {}

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

export default function AddStall(props: Props) {
	const [sideDrawerOpen, setSideDrawerOpen] = React.useState(false);
	const toggleSideDrawerOpen = (e: any) => {
		setSideDrawerOpen(!sideDrawerOpen);
	};

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

	// eslint-disable-next-line
	const [isStallOwner, setIsStallOwner] = React.useState<boolean | null>(false);

	// @TODO See https://stackoverflow.com/questions/72811784/from-time-and-to-time-validation-in-react-dropdown-react-datepicker-hour
	// const [startTimeValue, setStartTimeValue] = React.useState<Moment | null>(null);
	const [startTimeValue, setStartTimeValue] = React.useState<any | null>(null);

	// const [endTimeValue, setEndTimeValue] = React.useState<Moment | null>(null);
	const [endTimeValue, setEndTimeValue] = React.useState<any | null>(null);

	//   const times = [
	//     "00:00",
	//     "00:30",
	//     "1:00",
	//     "1:30",
	//     "2:00",
	//     "2:30",
	//     "3:00",
	//     "3:30",
	//     "4:00",
	//     "4:30",
	//     "5:00",
	//     "5:30",
	//     "6:00",
	//     "6:30",
	//     "7:00",
	//     "7:30",
	//     "8:00",
	//     "8:30",
	//     "9:00",
	//     "9:30",
	//     "10:00",
	//     "10:30",
	//     "11:00",
	//     "11:30",
	//     "12:00",
	//   ];

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

	const [whoIsSubmitting, setWhoIsSubmitting] = React.useState<string>();
	const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) =>
		setWhoIsSubmitting(value);

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

	const step2Content = (
		<React.Fragment>
			<Typography>Foobar foobar foobar</Typography>
			<br />
			<SearchBar
				//   onSearch={toggleUserHasSearched}
				//   filterOpen={filterOpen}
				// onToggleFilter={toggleFilter}
				// onSearch={() => {}}
				// filterOpen={false}
				election={{} as Election}
				onToggleFilter={() => {}}
				onClick={() => () => {}}
				// isMapFiltered={false}
				enableFiltering={false}
				// styleProps={{}}
			/>

			{/* <Box sx={{ mb: 2 }}>
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
  </Box> */}
		</React.Fragment>
	);

	const step3Content = (
		<React.Fragment>
			<Typography>Foobar foobar foobar</Typography>
			<FormControl>
				{/* <FormLabel id="demo-radio-buttons-group-label">
    Gender
  </FormLabel> */}
				<RadioGroup
					aria-labelledby="demo-radio-buttons-group-label"
					name="radio-buttons-group"
					onChange={onChangeWhoIsSubmitting}
				>
					<FormControlLabel value="owner" control={<Radio />} label="I'm involved in running this stall" />
					<FormControlLabel value="tip_off" control={<Radio />} label="I'm sending a tip-off about a stall I've seen" />
				</RadioGroup>
			</FormControl>
			{/* <Box sx={{ mb: 2 }}>
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
  </Box> */}
		</React.Fragment>
	);

	const step4Content = (
		<React.Fragment>
			<Typography gutterBottom variant="h6" component="div">
				Stall details
			</Typography>

			<TextField
				label="What is the stall called? (Required)"
				helperText="e.g. Smith Hill Primary School Sausage Sizzle"
				fullWidth
				sx={{ mb: 2 }}
				variant="filled"
				required
			/>

			<TextField
				label="Describe the stall"
				helperText="Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp"
				fullWidth
				sx={{ mb: 2 }}
				variant="filled"
			/>

			{/* <TextField
  label="When will the stall be open?"
  helperText="e.g. 8AM - 2PM"
  fullWidth
  sx={{ mb: 2 }}
  />
  
  <TextField
  id="standard-select-currency"
  select
  label="Start time"
  defaultValue="8:00"
  helperText="Please select your opening hours"
  variant="standard"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <AccessTimeIcon />
      </InputAdornment>
    ),
  }}
  >
  {times.map((option) => (
    <MenuItem key={option} value={option}>
      {option}
    </MenuItem>
  ))}
  </TextField>
  
  <TextField
  id="standard-select-currency"
  select
  value="AM"
  //   label="Start time"
  // defaultValue="EUR"
  //   helperText="Please select your opening hours"
  variant="standard"
  //   InputProps={{
  //     startAdornment: (
  //       <InputAdornment position="start">
  //         <AccessTimeIcon />
  //       </InputAdornment>
  //     ),
  //   }}
  >
  <MenuItem value="AM">AM</MenuItem>
  <MenuItem>PM</MenuItem>
  </TextField>
  <br />
  <br />
  
  <Select
  labelId="demo-simple-select-helper-label"
  id="demo-simple-select-helper"
  value="8:00"
  label="Start time"
  //   onChange={handleChange}
  sx={{ mb: 4 }}
  >
  {times.map((option) => (
    <MenuItem key={option} value={option}>
      {option}
    </MenuItem>
  ))}
  </Select>
  
  <Select
  labelId="demo-simple-select-helper-label"
  id="demo-simple-select-helper"
  value={"AM"}
  label="Start time am/pm"
  //   onChange={handleChange}
  sx={{ mb: 4 }}
  >
  <MenuItem value="AM">AM</MenuItem>
  <MenuItem>PM</MenuItem>
  </Select> */}

			{whoIsSubmitting === 'owner' && (
				<React.Fragment>
					{' '}
					<TimePicker
						label="Start time"
						value={startTimeValue}
						onChange={setStartTimeValue}
						// renderInput={(params: unknown) => (
						// 	<TextField
						// 		{...params}
						// 		fullWidth
						// 		variant="filled"
						// 		InputProps={{
						// 			startAdornment: (
						// 				<InputAdornment position="start">
						// 					<AccessTimeIcon />
						// 				</InputAdornment>
						// 			),
						// 		}}
						// 	/>
						// )}
					/>
					<br />
					<br />
					<TimePicker
						label="End time"
						value={endTimeValue}
						onChange={setEndTimeValue}
						// renderInput={(params) => (
						// 	<TextField
						// 		{...params}
						// 		fullWidth
						// 		variant="filled"
						// 		InputProps={{
						// 			startAdornment: (
						// 				<InputAdornment position="start">
						// 					<AccessTimeIcon />
						// 				</InputAdornment>
						// 			),
						// 		}}
						// 	/>
						// )}
					/>
					<br />
					<br />
					<TextField
						label="Website or social media page link"
						helperText="We'll include a link to your site as part of your stall's information"
						fullWidth
						variant="filled"
						// sx={{ mb: 2 }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<LinkIcon />
								</InputAdornment>
							),
						}}
					/>
				</React.Fragment>
			)}

			<Divider sx={{ mt: 3, mb: 3 }} />

			<Typography gutterBottom variant="h6" component="div">
				What's on offer?
			</Typography>
			<Typography gutterBottom variant="subtitle1" component="div">
				Foobar foobar foobar
			</Typography>

			<List
				dense
				sx={{
					width: '100%',
					pt: 0,
					// marginBottom: 1,
					/*maxWidth: 360, */
					//   bgcolor: "background.paper",
				}}
			>
				{Object.values(NomsOptionsAvailable).map((noms) => {
					const labelId = `checkbox-list-secondary-label-${noms.value}`;
					return (
						<ListItem
							key={noms.value}
							secondaryAction={
								<Checkbox
									edge="end"
									// onChange={handleToggle(noms.value, noms.label)}
									// checked={checked.indexOf(noms.value) !== -1}
									inputProps={{ 'aria-labelledby': labelId }}
								/>
							}
							disablePadding
						>
							<ListItemButton>
								<ListItemAvatar>
									<Avatar
										alt={`Avatar n°${noms.value + 1}`}
										sx={{ backgroundColor: 'transparent' }}
										// src={`/static/images/avatar/${noms.value + 1}.jpg`}
									>
										{noms.icon}
									</Avatar>
								</ListItemAvatar>
								<ListItemText id={labelId} primary={noms.label} />
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>

			<TextField
				label="Anything else?"
				helperText="e.g. We also have yummy gluten free sausage rolls, cold drinks, and pony rides!"
				fullWidth
				variant="filled"
				sx={{ mt: 1 }}
			/>

			<Divider sx={{ mt: 3, mb: 3 }} />

			<Typography gutterBottom variant="h6" component="div">
				Your details
			</Typography>
			<Typography gutterBottom variant="subtitle1" component="div">
				Foobar foobar foobar
			</Typography>

			<TextField
				label="What's your email address?"
				helperText="So we can let you know when we've added the stall to the map"
				fullWidth
				variant="filled"
				// sx={{ mb: 2 }}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<EmailIcon />
						</InputAdornment>
					),
				}}
			/>

			{/* <Box sx={{ mb: 2 }}>
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
  </Box> */}
		</React.Fragment>
	);

	return (
		<Root>
			{/* <Helmet>
            <title>Democracy Sausage | FAQs and About Us</title>
  
            {/* Open Graph / Facebook / Twitter *}
            <meta property="og:url" content={`${getBaseURL()}/about`} />
            <meta property="og:title" content="Democracy Sausage | FAQs and About Us" />
          </Helmet> */}

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
						<StepLabel optional={<Typography variant="caption">My stall</Typography>}>Who's submitting?</StepLabel>
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
							{isStallOwner === false && <div>Foobar</div>}

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
