import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	Alert,
	Box,
	Button,
	FormControl,
	FormGroup,
	InputAdornment,
	MobileStepper,
	Paper,
	Snackbar,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../app/forms/formHelpers';
import { stallOwnerFormValidationSchema } from '../../app/forms/stallForm';
import { useAppSelector } from '../../app/hooks/store';
import { IStallLocationInfo, Stall, StallFoodOptions, StallOwnerModifiableProps } from '../../app/services/stalls';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { appBarHeight, mapaThemePrimaryGrey } from '../../app/ui/theme';
import AddStallFormFoodOptionsSelector from '../addStall/addStallStallForm/addStallFormFoodOptionsSelector';
import AddStallFormPrivacyNotice from '../addStall/addStallStallForm/addStallFormPrivacyNotice';
import { selectActiveElections } from '../elections/electionsSlice';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { getHiddenStepperButton, getPollingPlaceFormHeading, mobileStepperMinHeight } from './stallFormHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100dvh`,
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

interface Props {
	stall?: Stall;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	stallLocationInfo?: IStallLocationInfo; // Only defined if election.polling_places_loaded === false
	isStallSaving: boolean;
	onDoneAdding?: (stall: StallOwnerModifiableProps) => void;
	onDoneEditing?: (stall: Stall) => void;
	onClickBack?: () => void;
}

export default function StallOwnerForm(props: Props) {
	const { stall, pollingPlace, stallLocationInfo, isStallSaving, onDoneAdding, onDoneEditing, onClickBack } = props;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<StallOwnerModifiableProps>({
		resolver: yupResolver(stallOwnerFormValidationSchema),
		defaultValues: {
			name: stall?.name || '',
			description: stall?.description || '',
			opening_hours: stall?.opening_hours || '',
			website: stall?.website || '',
			// noms: stall?.noms || { bbq: true },
			noms: stall?.noms || {},
			// email: stall?.email || 'keithamoss@gmail.com',
			email: stall?.email || '',
		},
	});

	const { noms } = watch();

	// ######################
	// Food Options
	// ######################
	const onFoodOptionChange = useCallback(
		(foodOptions: StallFoodOptions) => setValue('noms', foodOptions, { shouldDirty: true }),
		[setValue],
	);
	// ######################
	// Food Options (End)
	// ######################

	// ######################
	// Form Management
	// ######################
	const onDoneWithForm: SubmitHandler<StallOwnerModifiableProps> = useCallback(
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
					<Typography variant="h6">Tell us about the stall</Typography>
				</Paper>

				<Box sx={{ width: '100%', p: 2 }}>
					{/* ######################
							Stall Details
					###################### */}
					<Typography
						gutterBottom
						variant="h6"
						component="div"
						sx={{ mb: 2, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
					>
						Stall details
					</Typography>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										label="Stall name (required)"
										helperText="e.g. Smith Hill Primary School Sausage Sizzle"
									/>
								)}
							/>
						</FormGroup>

						{errors.name !== undefined && <FormFieldValidationError error={errors.name} />}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="description"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										label="Description (required)"
										helperText="Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp"
										multiline
									/>
								)}
							/>
						</FormGroup>

						{errors.description !== undefined && <FormFieldValidationError error={errors.description} />}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="opening_hours"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password {...field} label="Opening hours" helperText="e.g. 8AM - 2PM" />
								)}
							/>
						</FormGroup>

						{errors.opening_hours !== undefined && <FormFieldValidationError error={errors.opening_hours} />}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="website"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										label="Website or social media page link"
										helperText="We'll include a link to your site as part of your stall's information"
									/>
								)}
							/>
						</FormGroup>

						{errors.website !== undefined && <FormFieldValidationError error={errors.website} />}
					</FormControl>
					{/* ######################
							Stall Details (End)
					###################### */}

					<AddStallFormFoodOptionsSelector foodOptions={noms} onChange={onFoodOptionChange} errors={errors.noms} />

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
										helperText="So we can let you know when we've added the stall to the map"
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
						<LoadingButton
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
						</LoadingButton>
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
