import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, FormControl, FormGroup, InputAdornment, MobileStepper, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../../app/forms/formHelpers';
import { stallOwnerFormValidationSchema } from '../../../app/forms/stallForm';
import { useAppSelector } from '../../../app/hooks/store';
import { Election } from '../../../app/services/elections';
import { Stall, StallFoodOptions, StallOwnerModifiableProps } from '../../../app/services/stalls';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import { getBaseURL } from '../../../app/utils';
import { selectActiveElections } from '../../elections/electionsSlice';
import { getPollingPlacePermalinkFromElectionAndPollingPlace } from '../../pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { appBarHeight, mobileStepperMinHeight } from '../addStallHelpers';
import { AddStallExistingSubmissionWarning } from './addStallExistingSubmissionWarning';
import AddStallFormFoodOptionsSelector from './addStallFormFoodOptionsSelector';
import AddStallFormPrivacyNotice from './addStallFormPrivacyNotice';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `100vh`,
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

interface Props {
	stall?: Stall;
	election: Election;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	isStallSaving: boolean;
	onDoneAdding?: (stall: StallOwnerModifiableProps) => void;
	onDoneEditing?: (stall: Stall) => void;
	onClickBack: () => void;
}

export default function AddStallFormForOwner(props: Props) {
	const { stall, election, pollingPlace, isStallSaving, onDoneAdding, onDoneEditing, onClickBack } = props;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<StallOwnerModifiableProps>({
		resolver: yupResolver(stallOwnerFormValidationSchema),
		defaultValues: {
			name: stall?.name || '',
			description: stall?.description || '',
			opening_hours: stall?.opening_hours || '',
			website: stall?.website || '',
			noms: stall?.noms || { bbq: true },
			email: stall?.email || 'keithamoss@gmail.com',
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
	// ######################
	// Form Management (End)
	// ######################

	return (
		<StyledInteractableBoxFullHeight>
			{pollingPlace !== undefined && pollingPlace?.stall !== null && (
				<AddStallExistingSubmissionWarning
					pollingPlaceLinkAbsolute={`${getBaseURL()}${getPollingPlacePermalinkFromElectionAndPollingPlace(election, pollingPlace)}`}
				/>
			)}

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
					<Typography variant="h6">Tell us about the stall</Typography>
				</Paper>

				<Box sx={{ width: '100%', p: 2 }}>
					{/* ######################
							Stall Details
					###################### */}
					<Typography gutterBottom variant="h6" component="div" sx={{ mb: 2 }}>
						Stall details
					</Typography>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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
					<Typography gutterBottom variant="h6" component="div" sx={{ mb: 2 }}>
						Your details
					</Typography>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
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
					backButton={
						<Button size="small" onClick={onClickBack} startIcon={<ArrowBackIcon />}>
							Back
						</Button>
					}
					nextButton={
						<LoadingButton
							loading={isStallSaving}
							loadingPosition="end"
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
		</StyledInteractableBoxFullHeight>
	);
}
