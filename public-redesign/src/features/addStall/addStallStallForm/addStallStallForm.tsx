import { KeyboardArrowLeft, KeyboardArrowRight, Send } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllFoodsAvailableOnStalls } from '../../icons/iconHelpers';
import { useAppSelector } from '../../../app/hooks/store';
import { selectActiveElections } from '../../elections/electionsSlice';
import {
	removeLastComponentFromEndOfURLPath,
	removeLastTwoComponentsFromEndOfURLPath,
} from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

export default function AddStallStallForm(/*props: Props*/) {
	const params = useParams();
	const navigate = useNavigate();

	const urlStallOwnership = getStringParamOrEmptyString(params, 'stall_ownership');

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const handleNext = () => {
		// setActiveStep((prevActiveStep) => prevActiveStep + 1);
		navigate('/add-stall/submitted/');
	};

	const handleBack = () => {
		// setActiveStep((prevActiveStep) => prevActiveStep - 1);
		// navigate('/add-stall/stall-ownership/');

		// navigate(removeLastTwoComponentsFromEndOfURLPath(location.pathname));
		navigate(-1);
	};

	// @TODO See https://stackoverflow.com/questions/72811784/from-time-and-to-time-validation-in-react-dropdown-react-datepicker-hour
	// const [startTimeValue, setStartTimeValue] = React.useState<Moment | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
	const [startTimeValue, setStartTimeValue] = React.useState<any>(null);

	// const [endTimeValue, setEndTimeValue] = React.useState<Moment | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
	const [endTimeValue, setEndTimeValue] = React.useState<any>(null);

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
				<Typography variant="h6">Stall Info</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300, */ /*maxWidth: 400, */ width: '100%', p: 2 }}>
				{urlStallOwnership === 'owner' && (
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

						<TimePicker
							label="Start time"
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

						<Divider sx={{ mt: 3, mb: 3 }} />
					</React.Fragment>
				)}

				<Typography gutterBottom variant="h6" component="div">
					What&apos;s on offer?
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
					{getAllFoodsAvailableOnStalls().map((noms) => {
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
											sx={{ backgroundColor: 'transparent', '& svg': { width: 36, height: 36 } }}
											// src={`/static/images/avatar/${noms.value + 1}.jpg`}
										>
											{noms.icon.react}
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
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<EmailIcon />
							</InputAdornment>
						),
					}}
				/>
			</Box>

			<MobileStepper
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				position="bottom"
				activeStep={activeElections.length >= 2 ? 3 : 2}
				nextButton={
					<Button size="small" onClick={handleNext} disabled={false} endIcon={<SendIcon />}>
						Submit
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
