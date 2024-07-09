import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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
import { Helmet } from 'react-helmet-async';

export default function AddStallNoLiveElection(/*props: Props*/) {
	return (
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
				<Typography variant="h6">No live election</Typography>
			</Paper>

			<Box sx={{ /*minHeight: 300,*/ /*maxWidth: 400, */ width: '100%', p: 2 }}></Box>
		</React.Fragment>
	);
}
