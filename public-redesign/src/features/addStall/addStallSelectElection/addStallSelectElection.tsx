import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
import { Helmet } from 'react-helmet-async';
import { useAppSelector } from '../../../app/hooks/store';
import { selectActiveElections } from '../../elections/electionsSlice';
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import { Election } from '../../../app/services/elections';
import { getJurisdictionCrestStandaloneReact } from '../../icons/jurisdictionHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

export default function AddStallSelectElection(/*props: Props*/) {
	const navigate = useNavigate();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	// const handleNext = () => {
	// 	// setActiveStep((prevActiveStep) => prevActiveStep + 1);
	// 	if (selectedElection !== undefined) {
	// 		navigate(`/add-stall/${selectedElection.name_url_safe}`);
	// 	}
	// };

	// const [selectedElection, setSelectdElection] = React.useState<Election | undefined>();
	// const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) => {
	// 	setSelectdElection(activeElections.find((e) => e.id === Number.parseInt(value)));
	// };

	const onClick = (election: Election) => navigate(`/add-stall/${election.name_url_safe}`);

	// console.log(selectedElection);

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
				<Typography variant="h6">Add Stall</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300,*/ /*maxWidth: 400, */ width: '100%', p: 2 }}>
				<Typography variant="body1" gutterBottom>
					Please complete the form below to add your stall to the map. Please do not submit entries that are offensive,
					political or do not relate to an election day stall. Please also make sure that you have authorisation to run
					your fundraising event at the polling place. All entries are moderated and subject to approval.
				</Typography>

				<List
					sx={
						{
							/*width: '100%', */
							/*maxWidth: 360,*/
							/*bgcolor: 'background.paper'*/
						}
					}
				>
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
				<Typography variant="h6">Select Election</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300, maxWidth: 400,*/ width: '100%', p: 2 }}>
				<List>
					{activeElections.map((election) => (
						<ListItem key={election.id} onClick={() => onClick(election)}>
							<ListItemAvatar>
								<Avatar
									sx={{
										width: 58,
										height: 58,
										marginRight: 2,
										backgroundColor: 'transparent',
										// backgroundColor: election.id === electionId ? mapaThemePrimaryPurple : undefined,
										// backgroundColor: election.id === electionId ? undefined : 'transparent',
										'& svg': {
											width: 50,
										},
									}}
								>
									{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
								</Avatar>
							</ListItemAvatar>

							<ListItemButton /*onClick={onClickElection(election)}*/>
								<ListItemText
									sx={{
										'& .MuiListItemText-primary': {
											// Polling Place Address: 15px 400 rgba(0, 0, 0, 0.6)
											// color="text.secondary"
											fontSize: 15,
											fontWeight: 700,
											// color: mapaThemePrimaryGrey,
											color: 'rgba(0, 0, 0, 0.6)',
										},
									}}
									primary={election.name}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>

				{/* <FormControl>
					<RadioGroup
						aria-labelledby="demo-radio-buttons-group-label"
						name="radio-buttons-group"
						onChange={onChangeWhoIsSubmitting}
					>
						{activeElections.map((e) => (
							<FormControlLabel key={e.id} value={e.id} control={<Radio />} label={e.name} />
						))}
					</RadioGroup>
				</FormControl> */}
			</Box>

			<MobileStepper
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				position="bottom"
				activeStep={0}
				nextButton={
					<Button
						size="small"
						// onClick={handleNext}
						disabled={true}
						// disabled={selectedElection === undefined}
						endIcon={<ArrowForwardIcon />}
					>
						Next
					</Button>
				}
				backButton={
					<Button
						size="small"
						// onClick={handleBack}
						disabled={true}
						style={{ color: 'white' }}
						startIcon={<ArrowBackIcon />}
					>
						Back
					</Button>
				}
			/>
		</StyledInteractableBoxFullHeight>
	);
}
