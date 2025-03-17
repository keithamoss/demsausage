import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	FormControl,
	FormGroup,
	InputAdornment,
	ListItem,
	ListItemIcon,
	ListItemText,
	MobileStepper,
	Paper,
	Snackbar,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../app/forms/formHelpers';
import { stallFormTipOffRedCrossOfShameValidationSchema } from '../../app/forms/stallForm';
import { useAppSelector } from '../../app/hooks/store';
import type { Election } from '../../app/services/elections';
import {
	type IStallLocationInfo,
	type Stall,
	type StallTipOffRedCrossOfShameModifiableProps,
	StallTipOffSource,
} from '../../app/services/stalls';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { appBarHeight, mapaThemePrimaryGrey } from '../../app/ui/theme';
import AddStallFormPrivacyNotice from '../addStall/addStallStallForm/addStallFormPrivacyNotice';
import { isItTimeForElectionDaySpecialTipOffs } from '../elections/electionHelpers';
import { selectActiveElections } from '../elections/electionsSlice';
import { supportingIcons } from '../icons/iconHelpers';
import type { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { getHiddenStepperButton, getPollingPlaceFormHeading, mobileStepperMinHeight } from './stallFormHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: '100dvh',
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	'& .MuiListItemText-primary': {
		color: mapaThemePrimaryGrey,
		fontWeight: 700,
	},
}));

interface Props {
	election: Election;
	stall?: Stall;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	stallLocationInfo?: IStallLocationInfo; // Only defined if election.polling_places_loaded === false
	isStallSaving: boolean;
	onDoneAdding?: (stall: StallTipOffRedCrossOfShameModifiableProps) => void;
	onDoneEditing?: (stall: Stall) => void;
	onClickBack?: () => void;
}

export default function StallTipOffFormRedCrossOfShame(props: Props) {
	const { election, stall, pollingPlace, stallLocationInfo, isStallSaving, onDoneAdding, onDoneEditing, onClickBack } =
		props;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<StallTipOffRedCrossOfShameModifiableProps>({
		resolver: yupResolver(stallFormTipOffRedCrossOfShameValidationSchema),
		defaultValues: {
			noms: { nothing: true },
			email: stall?.email || '',
			tipoff_source: StallTipOffSource.Other,
			tipoff_source_other: stall?.tipoff_source_other || '',
		},
	});

	// ######################
	// Form Management
	// ######################
	const onDoneWithForm: SubmitHandler<StallTipOffRedCrossOfShameModifiableProps> = useCallback(
		(data) => {
			if (isEmpty(data) === false) {
				if (stall === undefined && onDoneAdding !== undefined) {
					onDoneAdding({ ...data });
				} else if (stall !== undefined && onDoneEditing !== undefined) {
					onDoneEditing({
						...stall,
						...data,
					});
				}
			}
		},
		[onDoneAdding, onDoneEditing, stall],
	);

	const onClickSubmit = useCallback(() => handleSubmit(onDoneWithForm)(), [handleSubmit, onDoneWithForm]);

	useEffect(() => {
		if (JSON.stringify(errors) !== '{}') {
			setIsErrorSnackbarShown(true);
		}
	}, [errors]);

	const [isErrorSnackbarShown, setIsErrorSnackbarShown] = useState(false);

	const onSnackbarClose = useCallback(() => setIsErrorSnackbarShown(false), []);
	// ######################
	// Form Management (End)
	// ######################

	return (
		<StyledInteractableBoxFullHeight>
			<form onSubmit={handleSubmit(onDoneWithForm)}>
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
					<Typography variant="h6">{getPollingPlaceFormHeading(stall, pollingPlace, stallLocationInfo)}</Typography>
				</Paper>

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
					<Typography variant="h6">There&apos;s no stall here!</Typography>
				</Paper>

				<Box
					sx={{
						width: '100%',
						p: 2,
						pt: 1, // Only pt 1 so we keep a consistent 16px with the spacing between sections as with AddStallFormForOwner
					}}
				>
					<Alert severity="info">
						<AlertTitle>Guidelines for reporting</AlertTitle>
						It&apos;s important to remember that not all stalls are up and running by 8AM on election day. Please take
						care in reporting a lack of a stall while it&apos;s still early in the day.
					</Alert>

					<StyledListItem disableGutters sx={{ mt: 1 }}>
						<StyledListItemIcon
							sx={{
								'& svg': {
									// 10px larger than the standard MUI SvgIcon size of 24px
									// to account for the padding around our 'circle' icons.
									width: 34,
									height: 34,
									position: 'relative',
									top: '-5px',
									left: '-5px',
								},
							}}
						>
							{supportingIcons.red_cross.icon.react}
						</StyledListItemIcon>

						<StyledListItemText primary="Sausageless!" secondary="We're sorry to hear that there's no stall here." />
					</StyledListItem>

					{isItTimeForElectionDaySpecialTipOffs(election) === false && (
						<Alert icon={'🤔'} severity="warning">
							<AlertTitle>It's a bit early in the day yet</AlertTitle>
							Sometimes stalls don't setup until a bit after polls open. Are you certain there's not going to be
							anything here?
						</Alert>
					)}

					{/* ######################
							Your Details
					###################### */}
					<Typography
						gutterBottom
						variant="h6"
						component="div"
						sx={{ mt: 1, mb: 2, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
					>
						Your details
					</Typography>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										type="email"
										label="Email address"
										helperText="So we can let you know when we've updated the stall on the map"
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<EmailIcon />
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</FormGroup>

						{errors.email !== undefined && <FormFieldValidationError error={errors.email} />}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="tipoff_source_other"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										helperText="Where did you see or hear about this booth not having any stalls?"
									/>
								)}
							/>
						</FormGroup>

						{errors.tipoff_source_other !== undefined && (
							<FormFieldValidationError error={errors.tipoff_source_other} />
						)}
					</FormControl>
					{/* ######################
							Your Details (End)
					###################### */}

					<AddStallFormPrivacyNotice />
				</Box>

				<MobileStepper
					position="bottom"
					variant="text"
					steps={activeElections.length >= 2 ? 4 : 3}
					activeStep={activeElections.length >= 2 ? 3 : 2}
					sx={{
						// Stall Editing doesn't have any steps, so let's hide that indicator
						color: stall !== undefined ? 'transparent' : undefined,
					}}
					backButton={
						stall === undefined ? (
							<Button size="small" onClick={onClickBack} startIcon={<ArrowBackIcon />}>
								Back
							</Button>
						) : (
							// Stall Editing doesn't need a 'Back' button
							getHiddenStepperButton()
						)
					}
					nextButton={
						<Button
							loading={isStallSaving}
							loadingPosition="end"
							disabled={isDirty === false}
							size="small"
							color="primary"
							endIcon={<SendIcon />}
							onClick={onClickSubmit}
						>
							{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
							<span>Submit</span>
						</Button>
					}
				/>
			</form>

			<Snackbar open={isErrorSnackbarShown} autoHideDuration={6000} onClose={onSnackbarClose}>
				<Alert severity="error" variant="standard" sx={{ width: '100%' }}>
					One or more fields have errors.
				</Alert>
			</Snackbar>
		</StyledInteractableBoxFullHeight>
	);
}
