import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Save, Star, StarBorder } from '@mui/icons-material';
import {
	Alert,
	AppBar,
	Button,
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
	Toolbar,
	Typography,
	styled,
} from '@mui/material';
import { isEmpty } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import {
	Controller,
	type SubmitHandler,
	type UseFormHandleSubmit,
	type UseFormSetValue,
	useForm,
} from 'react-hook-form';
import { FormFieldValidationError } from '../../app/forms/formHelpers';
import { pollingPlaceNomsFormValidationSchema } from '../../app/forms/pollingPlaceForm';
import type { PollingPlaceWithPendingStall, StallFoodOptions } from '../../app/services/stalls';
import TextFieldWithPasteAdornment from '../../app/ui/textFieldWithPasteAdornment';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import PollingPlaceNomsEditorFormNomsSelector from './PollingPlaceNomsEditorFormNomsSelector';
import { getNomsFormDefaultValues } from './pollingPlaceNomsEditorFormHelpers';
import type { IPollingPlace, IPollingPlaceStallModifiableProps } from './pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
}));

interface Props {
	pollingPlace: IPollingPlace | PollingPlaceWithPendingStall;
	onDoneCreatingOrEditing: (pollingPlaceId: number, stall: Partial<IPollingPlaceStallModifiableProps>) => void;
	isSaving: boolean;
	onDelete: (pollingPlaceId: number) => void;
	isDeleting: boolean;
	allowPasteOnTextFields: boolean;
	allowAppBarControl?: boolean;
	handleSubmitRef?: React.MutableRefObject<UseFormHandleSubmit<IPollingPlaceStallModifiableProps> | undefined>;
	setValueRef?: React.MutableRefObject<UseFormSetValue<IPollingPlaceStallModifiableProps> | undefined>;
	isDirtyRef?: React.MutableRefObject<boolean | undefined>;
}

export default function PollingPlaceNomsEditorForm(props: Props) {
	const {
		pollingPlace,
		onDoneCreatingOrEditing,
		isSaving,
		onDelete,
		isDeleting,
		allowPasteOnTextFields: allowPasteOnTextField,
		allowAppBarControl,
		handleSubmitRef,
		setValueRef,
		isDirtyRef,
	} = props;

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		trigger,
		formState: { errors, isDirty },
	} = useForm<IPollingPlaceStallModifiableProps>({
		resolver: yupResolver(pollingPlaceNomsFormValidationSchema),
		defaultValues: getNomsFormDefaultValues(pollingPlace),
	});

	if (handleSubmitRef !== undefined) {
		handleSubmitRef.current = handleSubmit;
	}
	if (setValueRef !== undefined) {
		setValueRef.current = setValue;
	}
	if (isDirtyRef !== undefined) {
		isDirtyRef.current = isDirty;
	}

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
		async (data) => {
			if (isEmpty(data) === false) {
				// Unlike most other components like this, there's no need to include pollingPlace.stall as the base here because we're doing a genuine PATCH request.

				// Ensures we remove 'free_text' from the list of noms when it's empty
				if (data.noms.free_text === '') {
					// biome-ignore lint/performance/noDelete: <explanation>
					delete data.noms.free_text;

					// Trigger form validation to warn if the noms are now empty
					if ((await trigger()) === false) {
						setIsErrorSnackbarShown(true);
					}
				}

				// Ensure we don't try and save a polling place with an empty noms.
				// If it's empty, the user can delete it instead.
				if (isEmpty(data.noms) === false) {
					onDoneCreatingOrEditing(pollingPlace.id, data);
				}
			}
		},
		[onDoneCreatingOrEditing, trigger, pollingPlace.id],
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

	// ######################
	// Paste To Field From Clipboard
	// ######################
	const onPasteNameFromClipboard = (pastedText: string) => setValue('name', pastedText, { shouldDirty: true });
	const onPasteDescriptionFromClipboard = (pastedText: string) =>
		setValue('description', pastedText, { shouldDirty: true });
	const onPasteOpeningHoursFromClipboard = (pastedText: string) =>
		setValue('opening_hours', pastedText, { shouldDirty: true });
	const onPasteWebsiteFromClipboard = (pastedText: string) => setValue('website', pastedText, { shouldDirty: true });
	const onPasteExtraInfoFromClipboard = (pastedText: string) =>
		setValue('extra_info', pastedText, { shouldDirty: true });
	// ######################
	// Paste To Field From Clipboard (End)
	// ######################

	return (
		<PageWrapper>
			<form onSubmit={handleSubmit(onDoneWithForm)}>
				<PollingPlaceNomsEditorFormNomsSelector
					foodOptions={noms}
					onChange={onFoodOptionChange}
					control={control}
					errors={errors.noms}
				/>

				{/* ######################
							Stall Details
					###################### */}
				<Typography
					gutterBottom
					variant="h6"
					component="div"
					sx={{ mt: 2, mb: 2, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
				>
					Stall details
				</Typography>

				<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
					<FormGroup>
						<Controller
							name="name"
							control={control}
							render={({ field }) => (
								<TextFieldWithPasteAdornment
									{...field}
									label="Stall name"
									helperText="e.g. Hillcrest Primary School Sausage Sizzle"
									onPasteFromClipboard={onPasteNameFromClipboard}
									pastingDisabled={allowPasteOnTextField === false}
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
								<TextFieldWithPasteAdornment
									{...field}
									label="Description"
									helperText="Who's running it and why you're running it e.g. The P&C is running the stall to raise funds for the Year 7 school camp"
									multiline
									onPasteFromClipboard={onPasteDescriptionFromClipboard}
									pastingDisabled={allowPasteOnTextField === false}
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
								<TextFieldWithPasteAdornment
									{...field}
									label="Opening hours"
									helperText="e.g. 8AM - 2PM"
									onPasteFromClipboard={onPasteOpeningHoursFromClipboard}
									pastingDisabled={allowPasteOnTextField === false}
								/>
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
								<TextFieldWithPasteAdornment
									{...field}
									label="Website or social media page link"
									helperText="We'll include a link to your site as part of your stall's information"
									onPasteFromClipboard={onPasteWebsiteFromClipboard}
									pastingDisabled={allowPasteOnTextField === false}
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
								<TextFieldWithPasteAdornment
									{...field}
									label="Extra information"
									helperText="Is there any other information to add that doesn't relate to what's on offer at the stall?"
									onPasteFromClipboard={onPasteExtraInfoFromClipboard}
									pastingDisabled={allowPasteOnTextField === false}
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
					sx={{ mt: 2, mb: 2, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
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

				<List
					component="div"
					disablePadding
					sx={{
						// A bit extra margin bottom here to allow for the presence of <AppBar> pinned at the bottom of the screen
						mb: 3,
					}}
				>
					<ListItemButton sx={{ pt: 0, pb: 0, pl: 4 }} onClick={onClickFavourite}>
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

				{allowAppBarControl !== false && (
					<AppBar position="fixed" color="transparent" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
						<Toolbar sx={{ justifyContent: 'flex-end' }}>
							<Button
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
							</Button>

							{pollingPlace.stall !== null && (
								<Button
									loading={isDeleting}
									loadingPosition="end"
									disabled={pollingPlace.stall === null}
									size="small"
									color="primary"
									endIcon={<Delete />}
									onClick={onClickDelete}
									sx={{ ml: 1 }}
								>
									{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
									<span>Delete</span>
								</Button>
							)}
						</Toolbar>
					</AppBar>
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
