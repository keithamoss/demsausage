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
	DialogContentText,
	DialogTitle,
	MenuItem,
	Select,
	type SxProps,
} from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { metaPollingPlaceLinkFormValidationSchema } from '../../../app/forms/metaPollingPlaces/metaPollingPlaceLinksForm';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';
import type { IMetaPollingPlace, IMetaPollingPlaceLinkModifiableProps } from '../metaPollingPlaceTasksInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlaceLinksManager(props: Props) {
	const { metaPollingPlace, cardSxProps } = props;

	const [open, setOpen] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<IMetaPollingPlaceLinkModifiableProps>({
		resolver: yupResolver(metaPollingPlaceLinkFormValidationSchema),
		defaultValues: {
			type: undefined,
			url: '',
		},
	});

	// ######################
	// Paste To Field From Clipboard
	// ######################
	const onPasteNameFromClipboard = (pastedText: string) => setValue('url', pastedText, { shouldDirty: true });
	// ######################
	// Paste To Field From Clipboard (End)
	// ######################

	return (
		<React.Fragment>
			<Card variant="outlined" sx={cardSxProps}>
				<CardContent>Foobar</CardContent>

				<CardActions>
					<Button variant="outlined" startIcon={<AddLink />} onClick={handleClickOpen}>
						Add Link
					</Button>
				</CardActions>
			</Card>

			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Subscribe</DialogTitle>

				<DialogContent>
					<DialogContentText>
						To subscribe to this website, please enter your email address here. We will send updates occasionally.
					</DialogContentText>

					<Select
						labelId="demo-simple-select-label"
						id="demo-simple-select"
						// value={10}
						value=""
						label="Age"
						// onChange={handleChange}
					>
						<MenuItem value={10}>Ten</MenuItem>
						<MenuItem value={20}>Twenty</MenuItem>
						<MenuItem value={30}>Thirty</MenuItem>
					</Select>

					<TextFieldWithPasteAdornment
						autoFocus
						required
						margin="dense"
						id="name"
						name="email"
						label="Email Address"
						type="email"
						fullWidth
						variant="standard"
						// label="Stall name"
						helperText="e.g. Hillcrest Primary School Sausage Sizzle"
						onPasteFromClipboard={onPasteNameFromClipboard}
					/>
				</DialogContent>

				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit">Subscribe</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}

export default MetaPollingPlaceLinksManager;
