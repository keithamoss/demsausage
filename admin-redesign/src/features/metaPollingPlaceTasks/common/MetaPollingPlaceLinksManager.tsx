import { yupResolver } from '@hookform/resolvers/yup';
import { AddLink } from '@mui/icons-material';
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
import { isEmpty } from 'lodash-es';
import React, { useCallback, useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { FormFieldValidationError } from '../../../app/forms/formHelpers';
import { metaPollingPlaceLinkFormValidationSchema } from '../../../app/forms/metaPollingPlaces/metaPollingPlaceLinksForm';
import { useAddLinkMutation } from '../../../app/services/metaPollingPlaceLinks';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';
import type { IMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceLinkModifiableProps } from '../interfaces/metaPollingPlaceLinksInterfaces';
import { IMetaPollingPlaceLinkType } from '../interfaces/metaPollingPlaceLinksInterfaces';
import MetaPollingPlaceLinksList from './MetaPollingPlaceLinksList';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlaceLinksManager(props: Props) {
	const { metaPollingPlace, cardSxProps } = props;

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
		}
	}, [isAddLinkSuccessful, onCloseAddLinkDialog]);
	// ######################
	// Add Link (End)
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
				console.log(data);
				addLink({ ...data, meta_polling_place_id: metaPollingPlace.id });

				// if (stall === undefined && onDoneAdding !== undefined) {
				// 	onDoneAdding({ ...data });
				// } else if (stall !== undefined && onDoneEditing !== undefined) {
				// 	onDoneEditing({
				// 		...stall,
				// 		...data,
				// 	});
				// }
			}
		},
		[addLink, metaPollingPlace.id],
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
					<MetaPollingPlaceLinksList metaPollingPlace={metaPollingPlace} />
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
		</React.Fragment>
	);
}

export default MetaPollingPlaceLinksManager;
