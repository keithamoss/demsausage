import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { NavigationType, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router-dom';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppSelector } from '../../../app/hooks/store';
import { selectActiveElections } from '../../elections/electionsSlice';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100dvh`,
}));

export default function AddStallSubmitted(/*props: Props*/) {
	const navigate = useNavigate();

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const [whoIsSubmitting, setWhoIsSubmitting] = React.useState<string>();
	const onChangeWhoIsSubmitting = (input: React.ChangeEvent<HTMLInputElement>, value: string) =>
		setWhoIsSubmitting(value);

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
				<Typography variant="h6">Submitted!</Typography>
			</Paper>

			<Box sx={{ minHeight: 300, maxWidth: 400, width: '100%', p: 2 }}>
				<React.Fragment>Yay, et cetera...</React.Fragment>
			</Box>
		</StyledInteractableBoxFullHeight>
	);
}
