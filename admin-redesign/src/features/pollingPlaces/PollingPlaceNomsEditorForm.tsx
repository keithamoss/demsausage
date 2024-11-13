import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowBack, Delete, History, Save, Star, StarBorder } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogActions,
	DialogTitle,
	FormControl,
	FormGroup,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Snackbar,
	Typography,
	styled,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../app/forms/formHelpers';
import { pollingPlaceNomsFormValidationSchema } from '../../app/forms/pollingPlaceForm';
import type { StallFoodOptions } from '../../app/services/stalls';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import PollingPlaceNomsEditorFormNomsSelector from './PollingPlaceNomsEditorFormNomsSelector';
import { getPollingPlaceNameForFormHeading } from './pollingPlaceFormHelpers';
import type { IPollingPlace, IPollingPlaceStallModifiableProps } from './pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(1),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	paddingBottom: `${theme.spacing(2)} !important`,
}));

interface Props {
	pollingPlace: IPollingPlace;
	onClickBack: () => void;
	onDoneCreatingOrEditing: (pollingPlaceId: number, stall: Partial<IPollingPlaceStallModifiableProps>) => void;
	isSaving: boolean;
	onDelete: (pollingPlaceId: number) => void;
	isDeleting: boolean;
}

export default function PollingPlaceNomsEditorForm(props: Props) {
	const { pollingPlace, onClickBack, onDoneCreatingOrEditing, isSaving, onDelete, isDeleting } = props;

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<IPollingPlaceStallModifiableProps>({
		resolver: yupResolver(pollingPlaceNomsFormValidationSchema),
		defaultValues: {
			noms: pollingPlace.stall?.noms || {},
			name: pollingPlace.stall?.name || '',
			description: pollingPlace.stall?.description || '',
			opening_hours: pollingPlace.stall?.opening_hours || '',
			website: pollingPlace.stall?.website || '',
			extra_info: pollingPlace.stall?.extra_info || '',
			source: pollingPlace.stall?.source || '',
			favourited: pollingPlace.stall?.favourited || false,
		},
	});

	const { noms, favourited } = watch();

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
	// Favouriting
	// ######################
	const onClickFavourite = useCallback(
		() => setValue('favourited', !favourited, { shouldDirty: true }),
		[setValue, favourited],
	);
	// ######################
	// Favouriting (End)
	// ######################

	// ######################
	// Form Management
	// ######################
	const onDoneWithForm: SubmitHandler<IPollingPlaceStallModifiableProps> = useCallback(
		(data) => {
			if (isEmpty(data) === false) {
				// Unlike most other components like this, there's no need to include pollingPlace.stall as the base here because we're doing a genuine PATCH request.
				onDoneCreatingOrEditing(pollingPlace.id, data);
			}
		},
		[onDoneCreatingOrEditing, pollingPlace.id /*, pollingPlace.stall*/],
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

	// ######################
	// Delete Polling Place Noms
	// ######################
	const [isDeleteConfirmDialogShown, setIsDeleteConfirmDialogShown] = useState(false);

	const onClickDelete = useCallback(() => setIsDeleteConfirmDialogShown(true), []);

	const onConfirmDelete = useCallback(() => {
		onDelete(pollingPlace.id);
		setIsDeleteConfirmDialogShown(false);
	}, [onDelete, pollingPlace.id]);

	const onCancelDelete = useCallback(() => setIsDeleteConfirmDialogShown(false), []);
	// ######################
	// Delete Polling Place Noms (End)
	// ######################

	return (
		<PageWrapper>
			<form onSubmit={handleSubmit(onDoneWithForm)}>
				<Card variant="outlined">
					<StyledCardContent>
						<Box>
							<Typography
								variant="h5"
								component="div"
								sx={{
									fontSize: 16,
									fontWeight: 500,
								}}
							>
								{getPollingPlaceNameForFormHeading(pollingPlace)}
							</Typography>

							<Typography color="text.secondary" sx={{ fontSize: 15 }}>
								{pollingPlace.address}
							</Typography>
						</Box>
					</StyledCardContent>
				</Card>

				<Button size="small" onClick={onClickBack} startIcon={<ArrowBack />}>
					Back
				</Button>

				<Button size="small" onClick={() => {}} startIcon={<History />}>
					History
				</Button>

				<Box sx={{ width: '100%', p: 2 }}>
					<PollingPlaceNomsEditorFormNomsSelector
						foodOptions={noms}
						onChange={onFoodOptionChange}
						errors={errors.noms}
					/>

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

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="extra_info"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										label="Extra information"
										helperText="Is there any other information to add that doesn't relate to what's on offer at the stall?"
									/>
								)}
							/>
						</FormGroup>

						{errors.extra_info !== undefined && <FormFieldValidationError error={errors.extra_info} />}
					</FormControl>
					{/* ######################
							Stall Details (End)
					###################### */}

					{/* ######################
							Metadata
					###################### */}
					<Typography
						gutterBottom
						variant="h6"
						component="div"
						sx={{ mt: 1, mb: 2, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
					>
						Metadata
					</Typography>

					<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="source"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password
										{...field}
										label="Source of the report"
										helperText="Where did this report come frm? (e.g. Twitter, Facebook, School Newsletter)"
									/>
								)}
							/>
						</FormGroup>

						{errors.source !== undefined && <FormFieldValidationError error={errors.source} />}
					</FormControl>

					<List component="div" disablePadding>
						<ListItemButton sx={{ pt: 0, pl: 4 }} onClick={onClickFavourite}>
							<ListItemIcon>{favourited === false ? <StarBorder /> : <Star color="primary" />}</ListItemIcon>

							<ListItemText
								primary="Favourite this polling place"
								secondary="This adds the polling place to the list of booths we can feature on social media."
							/>
						</ListItemButton>
					</List>
					{/* ######################
							Metadata (End)
					###################### */}
				</Box>

				<LoadingButton
					loading={isSaving}
					loadingPosition="end"
					disabled={isDirty === false}
					size="small"
					color="primary"
					endIcon={<Save />}
					onClick={onClickSubmit}
				>
					{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
					<span>Save</span>
				</LoadingButton>

				{pollingPlace.stall !== null && (
					<LoadingButton
						loading={isDeleting}
						loadingPosition="end"
						disabled={pollingPlace.stall === null}
						size="small"
						color="primary"
						endIcon={<Delete />}
						onClick={onClickDelete}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Delete</span>
					</LoadingButton>
				)}
			</form>

			{isDeleteConfirmDialogShown === true && (
				<Dialog open={true} onClose={onCancelDelete} fullWidth>
					<DialogTitle>Delete polling place noms?</DialogTitle>
					<DialogActions>
						<Button onClick={onCancelDelete}>No</Button>
						<Button onClick={onConfirmDelete}>Yes</Button>
					</DialogActions>
				</Dialog>
			)}

			<Snackbar open={isErrorSnackbarShown} autoHideDuration={6000} onClose={onSnackbarClose}>
				<Alert severity="error" variant="standard" sx={{ width: '100%' }}>
					One or more fields have errors.
				</Alert>
			</Snackbar>
		</PageWrapper>
	);
}
