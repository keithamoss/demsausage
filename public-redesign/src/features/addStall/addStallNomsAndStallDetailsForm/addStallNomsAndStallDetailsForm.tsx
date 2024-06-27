import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import {
	Avatar,
	Checkbox,
	Divider,
	InputAdornment,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	TextField,
	Typography,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import React, { useState } from 'react';
import { NomsOptionsAvailable } from '../../icons/noms';

interface Props {
	onDone: () => void;
}

export default function AddStallNomsAndStallDetailsForm(props: Props) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { onDone } = props;

	// const params = useParams();
	// const navigate = useNavigate();
	// const location = useLocation();

	const whoIsSubmitting = 'owner';

	// eslint-disable-next-line
	const [isStallOwner, setIsStallOwner] = useState<boolean | null>(false);

	// @TODO See https://stackoverflow.com/questions/72811784/from-time-and-to-time-validation-in-react-dropdown-react-datepicker-hour
	// const [startTimeValue, setStartTimeValue] = useState<Moment | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
	const [startTimeValue, setStartTimeValue] = useState<any>(null);

	// const [endTimeValue, setEndTimeValue] = useState<Moment | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
	const [endTimeValue, setEndTimeValue] = useState<any>(null);

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
				</React.Fragment>
			)}

			<Divider sx={{ mt: 3, mb: 3 }} />

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
}
