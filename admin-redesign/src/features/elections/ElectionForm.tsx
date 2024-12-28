import { yupResolver } from '@hookform/resolvers/yup';
import { Save } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import { AppBar, FormControl, FormGroup, FormHelperText, Paper, Toolbar } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { electionFormValidationSchema } from '../../app/forms/electionForm';
import type { Election, ElectionModifiableProps, NewElection } from '../../app/services/elections';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';

interface Props {
	election?: Election;
	isElectionSaving: boolean;
	onDoneAdding?: (election: NewElection) => void;
	onDoneEditing?: (election: Election) => void;
}

function ElectionForm(props: Props) {
	const { election, isElectionSaving, onDoneAdding, onDoneEditing } = props;

	const {
		watch,
		setValue,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<ElectionModifiableProps>({
		resolver: yupResolver(electionFormValidationSchema),
		defaultValues: {
			name: election?.name || '',
		},
	});

	// const { hero_icon, default_symbology, available_schema_ids } = watch();

	// ######################
	// Form Management
	// ######################
	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onDoneWithForm: SubmitHandler<ElectionModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			if (election === undefined && onDoneAdding !== undefined) {
				const electionData: NewElection = { ...data };
				onDoneAdding(electionData);
			} else if (election !== undefined && onDoneEditing !== undefined) {
				const electionData: Election = {
					...election,
					...data,
				};
				onDoneEditing(electionData);
			}
		}
	};
	// ######################
	// Form Management (End)
	// ######################

	return (
		<React.Fragment>
			<form onSubmit={handleSubmit(onDoneWithForm)}>
				<Paper elevation={0} sx={{ m: 3 }}>
					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => <TextFieldWithout1Password {...field} label="Name" />}
							/>
						</FormGroup>

						{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
					</FormControl>
				</Paper>
			</form>

			<AppBar position="fixed" color="transparent" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
				<Toolbar>
					<LoadingButton
						loading={isElectionSaving}
						loadingPosition="end"
						disabled={isDirty === false}
						size="small"
						color="primary"
						endIcon={<Save />}
						onClick={onClickSave}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>Save</span>
					</LoadingButton>
				</Toolbar>
			</AppBar>
		</React.Fragment>
	);
}

export default ElectionForm;
