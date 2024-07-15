import { yupResolver } from '@hookform/resolvers/yup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import {
	Box,
	Button,
	Divider,
	FormControl,
	FormGroup,
	InputAdornment,
	MobileStepper,
	Paper,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { isEmpty } from 'lodash-es';
import { useCallback } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../../app/forms/formHelpers';
import { stallFormTipOffValidationSchema } from '../../../app/forms/stallForm';
import { useAppSelector } from '../../../app/hooks/store';
import { Election } from '../../../app/services/elections';
import { Stall, StallFoodOptions, StallTipOffModifiableProps } from '../../../app/services/stalls';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import { getBaseURL } from '../../../app/utils';
import { selectActiveElections } from '../../elections/electionsSlice';
import { getPollingPlacePermalinkFromElectionAndPollingPlace } from '../../pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { AddStallExistingSubmissionWarning } from './addStallExistingSubmissionWarning';
import AddStallFormFoodOptionsSelector from './addStallFormFoodOptionsSelector';
import AddStallFormPrivacyNotice from './addStallFormPrivacyNotice';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

interface Props {
	stall?: Stall;
	election: Election;
	pollingPlace?: IPollingPlace; // Only defined if election.polling_places_loaded === true
	isStallSaving: boolean;
	onDoneAdding?: (stall: StallTipOffModifiableProps) => void;
	onDoneEditing?: (stall: Stall) => void;
	onClickBack: () => void;
}

export default function AddStallFormForTipOff(props: Props) {
	const { stall, election, pollingPlace, isStallSaving, onDoneAdding, onDoneEditing, onClickBack } = props;

	const activeElections = useAppSelector((state) => selectActiveElections(state));

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<StallTipOffModifiableProps>({
		resolver: yupResolver(stallFormTipOffValidationSchema),
		defaultValues: {
			noms: stall?.noms || { bbq: true },
			email: stall?.email || 'keithamoss@gmail.com',
		},
	});

	const { noms } = watch();

	// ######################
	// Food Options
	// ######################
	const onFoodOptionChange = useCallback((foodOptions: StallFoodOptions) => setValue('noms', foodOptions), [setValue]);
	// ######################
	// Food Options (End)
	// ######################

	// ######################
	// Form Management
	// ######################
	const onDoneWithForm: SubmitHandler<StallTipOffModifiableProps> = useCallback(
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
					<Typography variant="h6">Stall Info</Typography>
				</Paper>

				<Box sx={{ width: '100%', p: 2 }}>
					<AddStallFormFoodOptionsSelector foodOptions={noms} onChange={onFoodOptionChange} errors={errors.noms} />

					<Divider sx={{ mt: 3, mb: 3 }} />

					{/* ######################
							Your Details
					###################### */}
					<Typography gutterBottom variant="h6" component="div">
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

					<Divider sx={{ mt: 3, mb: 3 }} />

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
