import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import {
	Alert,
	Box,
	Button,
	FormControl,
	FormGroup,
	FormHelperText,
	InputAdornment,
	InputLabel,
	MenuItem,
	MobileStepper,
	OutlinedInput,
	Paper,
	Select,
	Snackbar,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../app/forms/formHelpers';
import { stallFormTipOffValidationSchema } from '../../app/forms/stallForm';
import { useAppSelector } from '../../app/hooks/store';
import {
	type IStallLocationInfo,
	type Stall,
	type StallFoodOptions,
	type StallTipOffModifiableProps,
	StallTipOffSource,
	getStallSourceDescription,
} from '../../app/services/stalls';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { appBarHeight, mapaThemePrimaryGrey } from '../../app/ui/theme';
import AddStallFormFoodOptionsSelector from '../addStall/addStallStallForm/addStallFormFoodOptionsSelector';
import AddStallFormPrivacyNotice from '../addStall/addStallStallForm/addStallFormPrivacyNotice';
import { selectActiveElections } from '../elections/electionsSlice';
import type { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { getHiddenStepperButton, getPollingPlaceFormHeading, mobileStepperMinHeight } from './stallFormHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: '100dvh',
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

interface Props {
	stall?: Stall;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	stallLocationInfo?: IStallLocationInfo; // Only defined if election.polling_places_loaded === false
	isStallSaving: boolean;
	onDoneAdding?: (stall: StallTipOffModifiableProps) => void;
	onDoneEditing?: (stall: Stall) => void;
	onClickBack?: () => void;
}

export default function StallTipOffForm(props: Props) {
	const { stall, pollingPlace, stallLocationInfo, isStallSaving, onDoneAdding, onDoneEditing, onClickBack } = props;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<StallTipOffModifiableProps>({
		resolver: yupResolver(stallFormTipOffValidationSchema),
		defaultValues: {
			noms: stall?.noms || {},
			email: stall?.email || '',
			tipoff_source: stall?.tipoff_source || undefined,
			tipoff_source_other: stall?.tipoff_source_other || '',
		},
	});

	const { noms, tipoff_source } = watch();

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
	const onDoneWithForm: SubmitHandler<StallTipOffModifiableProps> = useCallback(
		(data) => {
			if (isEmpty(data) === false) {
				if (data.tipoff_source !== StallTipOffSource.Other) {
					data.tipoff_source_other = '';
				}

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

				<Box
					sx={{
						width: '100%',
						p: 2,
						pt: 1, // Only pt 1 so we keep a consistent 16px with the spacing between sections as with AddStallFormForOwner
					}}
				>
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

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<InputLabel>Source</InputLabel>

							<Controller
								name="tipoff_source"
								control={control}
								render={({ field }) => (
									<Select
										{...field}
										input={<OutlinedInput label="Source" />}
										value={tipoff_source || ''}
										// Needed so that longer source labels get text-overflow: ellipsis properly applied when they're selected
										sx={{ width: '100%' }}
									>
										{Object.entries(StallTipOffSource).map(([, id]) => (
											<MenuItem key={id} value={id} sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
												{getStallSourceDescription(id)}
											</MenuItem>
										))}
									</Select>
								)}
							/>

							<FormHelperText>Let us know where you saw or heard about this stall</FormHelperText>
						</FormGroup>

						{errors.tipoff_source !== undefined && <FormFieldValidationError error={errors.tipoff_source} />}
					</FormControl>

					{tipoff_source === StallTipOffSource.Other && (
						<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="tipoff_source_other"
									control={control}
									render={({ field }) => (
										<TextFieldWithout1Password {...field} helperText="Where did you see or hear about the stall?" />
									)}
								/>
							</FormGroup>

							{errors.tipoff_source_other !== undefined && (
								<FormFieldValidationError error={errors.tipoff_source_other} />
							)}
						</FormControl>
					)}
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
