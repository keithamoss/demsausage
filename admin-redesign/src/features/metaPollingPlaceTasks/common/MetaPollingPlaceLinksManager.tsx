import { yupResolver } from '@hookform/resolvers/yup';
import { AddLink, Delete, Save } from '@mui/icons-material';
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormGroup,
	FormHelperText,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	type SxProps,
} from '@mui/material';
import { useDialogs, useNotifications } from '@toolpad/core';
import { isEmpty } from 'lodash-es';
import React, { useCallback, useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../../app/forms/formHelpers';
import { metaPollingPlaceLinkFormValidationSchema } from '../../../app/forms/metaPollingPlaces/metaPollingPlaceLinksForm';
import {
	useAddLinkMutation,
	useDeleteLinkMutation,
	useEditLinkMutation,
} from '../../../app/services/metaPollingPlaceLinks';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';
import type { IMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type {
	IMetaPollingPlaceLink,
	IMetaPollingPlaceLinkModifiableProps,
} from '../interfaces/metaPollingPlaceLinksInterfaces';
import { IMetaPollingPlaceLinkType } from '../interfaces/metaPollingPlaceLinksInterfaces';
import MetaPollingPlaceLinksList from './MetaPollingPlaceLinksList';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlaceLinksManager(props: Props) {
	const { metaPollingPlace, cardSxProps } = props;

	const notifications = useNotifications();
	const dialogs = useDialogs();

	// ######################
	// Dialog Management
	// ######################
	const [isAddLinkDialogOpen, setIsAddLinkDialogOpen] = React.useState(false);

	const onClickOpenAddLinkDialog = () => {
		setIsAddLinkDialogOpen(true);
	};

	const onCloseAddLinkDialog = useCallback(() => {
		setIsAddLinkDialogOpen(false);
	}, []);
	// ######################
	// Dialog Management (End)
	// ######################

	// ######################
	// Add Link
	// ######################
	const [addLink, { isLoading: isAddLinkLoading, isSuccess: isAddLinkSuccessful }] = useAddLinkMutation();

	useEffect(() => {
		if (isAddLinkSuccessful === true) {
			onCloseAddLinkDialog();

			notifications.show('Link added', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isAddLinkSuccessful, onCloseAddLinkDialog, notifications.show]);
	// ######################
	// Add Link (End)
	// ######################

	// ######################
	// Manage Link (End)
	// ######################
	const [linkToManage, setLinkToManage] = React.useState<IMetaPollingPlaceLink | undefined>(undefined);

	useEffect(() => {
		if (linkToManage !== undefined) {
			setValue('type', linkToManage.type, { shouldDirty: true });
			setValue('url', linkToManage.url, { shouldDirty: true });
		} else {
			reset();
		}
	}, [linkToManage]);

	const onClickManage = useCallback((link: IMetaPollingPlaceLink) => () => setLinkToManage(link), []);

	const onCloseManageLinkDialog = useCallback(() => {
		setLinkToManage(undefined);
	}, []);
	// ######################
	// Manage Link (End)
	// ######################

	// ######################
	// Delete Link
	// ######################
	const [deleteLink, { isLoading: isDeleteLinkLoading, isSuccess: isDeleteLinkSuccessful }] = useDeleteLinkMutation();

	const onClickDelete = useCallback(async () => {
		if (linkToManage !== undefined) {
			const confirmed = await dialogs.confirm('Confirm link delete', {
				title: 'Are you sure?',
				okText: 'Go Ahead',
				cancelText: 'Cancel',
			});

			if (confirmed === false) {
				return;
			}

			deleteLink(linkToManage?.id);
		}
	}, [linkToManage, dialogs.confirm, deleteLink]);

	useEffect(() => {
		if (isDeleteLinkSuccessful === true) {
			setLinkToManage(undefined);

			notifications.show('Link deleted', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isDeleteLinkSuccessful, notifications.show]);
	// ######################
	// Delete Link (End)
	// ######################

	// ######################
	// Edit Link
	// ######################
	const [editLink, { isLoading: isEditLinkLoading, isSuccess: isEditLinkSuccessful }] = useEditLinkMutation();

	useEffect(() => {
		if (isEditLinkSuccessful === true) {
			setLinkToManage(undefined);

			notifications.show('Link edited', {
				severity: 'success',
				autoHideDuration: 3000,
			});
		}
	}, [isEditLinkSuccessful, notifications.show]);
	// ######################
	// Edit Link (End)
	// ######################

	// ######################
	// Form Management
	// ######################
	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
		reset,
	} = useForm<IMetaPollingPlaceLinkModifiableProps>({
		resolver: yupResolver(metaPollingPlaceLinkFormValidationSchema),
		defaultValues: {
			type: IMetaPollingPlaceLinkType.FACEBOOK,
			url: '',
		},
	});

	// @TODO Add some sort of basic domain validation?

	const { type } = watch();

	const onDoneWithForm: SubmitHandler<IMetaPollingPlaceLinkModifiableProps> = useCallback(
		(data) => {
			if (isEmpty(data) === false) {
				if (linkToManage === undefined) {
					addLink({ ...data, meta_polling_place_id: metaPollingPlace.id });
				} else {
					editLink({ link_id: linkToManage.id, ...data });
				}
			}
		},
		[linkToManage, addLink, metaPollingPlace.id, editLink],
	);

	const onClickSubmit = useCallback(() => handleSubmit(onDoneWithForm)(), [handleSubmit, onDoneWithForm]);
	// ######################
	// Form Management (End)
	// ######################

	// ######################
	// Paste To Field From Clipboard
	// ######################
	const onPasteLinkFromClipboard = (pastedText: string) => setValue('url', pastedText, { shouldDirty: true });
	// ######################
	// Paste To Field From Clipboard (End)
	// ######################

	return (
		<React.Fragment>
			<Card variant="outlined" sx={cardSxProps}>
				<CardContent>
					<MetaPollingPlaceLinksList metaPollingPlace={metaPollingPlace} onClickManage={onClickManage} />
				</CardContent>

				<CardActions sx={{ pl: 2, pb: 2, pr: 2 }}>
					<Button variant="outlined" startIcon={<AddLink />} onClick={onClickOpenAddLinkDialog}>
						Add Link
					</Button>
				</CardActions>
			</Card>

			<Dialog open={isAddLinkDialogOpen} onClose={onCloseAddLinkDialog}>
				<DialogTitle>Add Link</DialogTitle>

				<DialogContent>
					<form onSubmit={handleSubmit(onDoneWithForm)}>
						<FormControl fullWidth sx={{ mt: 1, mb: 3 }}>
							<FormGroup>
								<InputLabel>Link Type</InputLabel>

								{/* @TODO Add icons inside the MenuItems */}
								<Controller
									name="type"
									control={control}
									render={({ field }) => (
										<Select {...field} input={<OutlinedInput label="Link Type" />} value={type || ''}>
											{Object.entries(IMetaPollingPlaceLinkType).map(([, type]) => (
												<MenuItem key={type} value={type} sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
													{type}
												</MenuItem>
											))}
										</Select>
									)}
								/>

								{errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
							</FormGroup>
						</FormControl>

						<FormControl fullWidth={true} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="url"
									control={control}
									render={({ field }) => (
										<TextFieldWithPasteAdornment
											{...field}
											type="url"
											label="URL"
											onPasteFromClipboard={onPasteLinkFromClipboard}
										/>
									)}
								/>
							</FormGroup>

							{errors.url !== undefined && <FormFieldValidationError error={errors.url} />}
						</FormControl>
					</form>
				</DialogContent>

				<DialogActions>
					<Button disabled={isAddLinkLoading === true} size="small" onClick={onCloseAddLinkDialog}>
						Close
					</Button>

					<Button
						loading={isAddLinkLoading}
						loadingPosition="end"
						disabled={isDirty === false}
						size="small"
						onClick={onClickSubmit}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Add</span>
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={linkToManage !== undefined} onClose={onCloseManageLinkDialog}>
				<DialogTitle>Manage Link</DialogTitle>

				<DialogContent>
					<form onSubmit={handleSubmit(onDoneWithForm)}>
						<FormControl fullWidth sx={{ mt: 1, mb: 3 }}>
							<FormGroup>
								<InputLabel>Link Type</InputLabel>

								{/* @TODO Add icons inside the MenuItems */}
								<Controller
									name="type"
									control={control}
									render={({ field }) => (
										<Select {...field} input={<OutlinedInput label="Link Type" />} value={type || ''}>
											{Object.entries(IMetaPollingPlaceLinkType).map(([, type]) => (
												<MenuItem key={type} value={type} sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
													{type}
												</MenuItem>
											))}
										</Select>
									)}
								/>

								{errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
							</FormGroup>
						</FormControl>

						<FormControl fullWidth={true} component="fieldset" variant="outlined">
							<FormGroup>
								<Controller
									name="url"
									control={control}
									render={({ field }) => (
										<TextFieldWithPasteAdornment
											{...field}
											type="url"
											label="URL"
											onPasteFromClipboard={onPasteLinkFromClipboard}
										/>
									)}
								/>
							</FormGroup>

							{errors.url !== undefined && <FormFieldValidationError error={errors.url} />}
						</FormControl>
					</form>
				</DialogContent>

				<DialogActions>
					<Button disabled={isDeleteLinkLoading || isEditLinkLoading} size="small" onClick={onCloseManageLinkDialog}>
						Close
					</Button>

					<Button
						loading={isDeleteLinkLoading}
						loadingPosition="end"
						endIcon={<Delete />}
						size="small"
						onClick={onClickDelete}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Delete</span>
					</Button>

					<Button
						loading={isEditLinkLoading}
						loadingPosition="end"
						disabled={isDirty === false}
						endIcon={<Save />}
						size="small"
						onClick={onClickSubmit}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Save</span>
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}

export default MetaPollingPlaceLinksManager;
