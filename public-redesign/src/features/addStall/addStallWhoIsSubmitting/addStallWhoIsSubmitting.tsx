import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StallOwnershipMyStall from '../../../../public/assets/stalls/submit_mystall.svg?react';
import StallOwnershipTipOff from '../../../../public/assets/stalls/submit_tipoff.svg?react';
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
import { useAppSelector } from '../../../app/hooks/store';
import { selectActiveElections } from '../../elections/electionsSlice';
import {
	addComponentToEndOfURLPath,
	removeLastComponentFromEndOfURLPath,
} from '../../../app/routing/navigationHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

export default function AddStallWhoIsSubmitting(/*props: Props*/) {
	const navigate = useNavigate();
	const location = useLocation();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	// const handleNext = () => {
	// 	// setActiveStep((prevActiveStep) => prevActiveStep + 1);
	// 	// navigate('/add-stall/stall-details/');

	// 	if (stallOwnership !== undefined) {
	// 		navigate(addComponentToEndOfURLPath(location.pathname, `owner/${stallOwnership}`));
	// 	}
	// };

	const handleBack = () => {
		// setActiveStep((prevActiveStep) => prevActiveStep - 1);

		// navigate(removeLastComponentFromEndOfURLPath(location.pathname));

		// @TODO What if we came directly here?
		navigate(-1);
	};

	// const [stallOwnership, setStallOwnership] = React.useState<string | undefined>();
	const onClick = (value: string) => {
		navigate(addComponentToEndOfURLPath(location.pathname, `owner/${value}`));
	};

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
				<Typography variant="h6">Who's submitting?</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300,*/ /*maxWidth: 400, */ width: '100%', p: 2 }}>
				<React.Fragment>
					<Typography>Foobar foobar foobar</Typography>

					<List
						sx={
							{
								/*width: '100%', */
								/*maxWidth: 360,*/
								/*bgcolor: 'background.paper'*/
							}
						}
					>
						<ListItemButton sx={{ /*bgcolor: 'background.paper',*/ marginBottom: 0 }} onClick={() => onClick('owner')}>
							<ListItemAvatar>
								<Avatar sx={{ backgroundColor: 'transparent' }}>
									<StallOwnershipMyStall style={{ width: 28, height: 28 }} />
								</Avatar>
							</ListItemAvatar>

							<ListItemText primary="I'm involved in running this stall" />
						</ListItemButton>

						<ListItemButton
							sx={
								{
									/*bgcolor: 'background.paper'*/
								}
							}
							onClick={() => onClick('tipoff')}
						>
							<ListItemAvatar>
								<Avatar sx={{ backgroundColor: 'transparent' }}>
									<StallOwnershipTipOff style={{ width: 28, height: 28 }} />
								</Avatar>
							</ListItemAvatar>

							<ListItemText primary="I'm sending a tip-off about a stall I've seen" />
						</ListItemButton>
					</List>

					{/* <FormControl>
						<RadioGroup
							aria-labelledby="demo-radio-buttons-group-label"
							name="radio-buttons-group"
							onChange={onChangeWhoIsSubmitting}
						>
							<FormControlLabel value="owner" control={<Radio />} label="I'm involved in running this stall" />
							<FormControlLabel
								value="tip_off"
								control={<Radio />}
								label="I'm sending a tip-off about a stall I've seen"
							/>
						</RadioGroup>
					</FormControl> */}
				</React.Fragment>
			</Box>

			<MobileStepper
				variant="text"
				steps={activeElections.length >= 2 ? 4 : 3}
				position="bottom"
				activeStep={activeElections.length >= 2 ? 2 : 1}
				nextButton={
					<Button
						size="small"
						// onClick={handleNext}
						disabled={true}
						// disabled={stallOwnership === undefined}
						endIcon={<ArrowForwardIcon />}
					>
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
