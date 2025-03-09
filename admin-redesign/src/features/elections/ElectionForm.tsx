import { yupResolver } from '@hookform/resolvers/yup';
import {
	AppBar,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	InputLabel,
	ListItemIcon,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Paper,
	Select,
	Toolbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useNotifications } from '@toolpad/core';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { isEmpty } from 'lodash-es';
import React, { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { electionFormValidationSchema } from '../../app/forms/electionForm';
import type { Election, ElectionModifiableProps, NewElection } from '../../app/services/elections';
import TextFieldWithout1Password from '../../app/ui/textFieldWithout1Password';
import { theme } from '../../app/ui/theme';
import { eJurisdiction, getJurisdictionCrestCircleReact, jurisdictions } from '../icons/jurisdictionHelpers';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
	election?: Election;
	isElectionSaving: boolean;
	onDoneAdding?: (election: NewElection) => void;
	onDoneEditing?: (id: number, election: ElectionModifiableProps) => void;
	primaryFormButtonLabel: string;
	primaryFormButtonIcon: JSX.Element;
}

function ElectionForm(props: Props) {
	const { election, isElectionSaving, onDoneAdding, onDoneEditing, primaryFormButtonLabel, primaryFormButtonIcon } =
		props;

	const notifications = useNotifications();

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
			short_name: election?.short_name || '',
			election_day: election?.election_day || undefined,
			jurisdiction: election?.jurisdiction || undefined,
			is_federal: election?.is_federal || false,
			is_state: election?.is_state || false,
			is_hidden: election?.is_hidden || false,
		},
	});

	const { election_day, jurisdiction, geom, is_federal, is_state, is_hidden } = watch();

	useEffect(() => {
		if (jurisdiction !== undefined) {
			setValue('geom', jurisdictions[jurisdiction].geom, { shouldDirty: true });
		}
	}, [jurisdiction, setValue]);

	// ######################
	// Form Management
	// ######################
	const onClickSave = () => {
		handleSubmit(onDoneWithForm)();
	};

	const onDoneWithForm: SubmitHandler<ElectionModifiableProps> = (data) => {
		if (isEmpty(data) === false) {
			if (election === undefined && onDoneAdding !== undefined) {
				onDoneAdding(data);
			} else if (election !== undefined && onDoneEditing !== undefined) {
				onDoneEditing(election.id, data);
			}
		}
	};

	useEffect(() => {
		if (JSON.stringify(errors) !== '{}') {
			notifications.show('One or more fields have errors.', {
				severity: 'error',
				autoHideDuration: 6000,
			});
		}
	}, [errors, notifications.show]);
	// ######################
	// Form Management (End)
	// ######################

	return (
		<React.Fragment>
			<form onSubmit={handleSubmit(onDoneWithForm)}>
				<Paper elevation={0} sx={{ mt: 1 }}>
					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password {...field} label="The name of the election (e.g. Federal Election 2025)" />
								)}
							/>
						</FormGroup>

						{errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="short_name"
								control={control}
								render={({ field }) => (
									<TextFieldWithout1Password {...field} label="A short name for this election (e.g. FED 2025)" />
								)}
							/>
						</FormGroup>

						{errors.short_name && <FormHelperText error>{errors.short_name.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<Controller
								name="election_day"
								control={control}
								render={({ field }) => (
									<DatePicker
										{...field}
										timezone="Australia/Perth"
										value={election_day !== undefined ? dayjs(election_day) : null}
										label="What day is election day?"
									/>
								)}
							/>
						</FormGroup>

						{errors.election_day && <FormHelperText error>{errors.election_day.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth sx={{ mb: 2 }}>
						<FormGroup>
							<InputLabel>Jurisdiction</InputLabel>

							<Controller
								name="jurisdiction"
								control={control}
								render={({ field }) => (
									<Select {...field} input={<OutlinedInput label="Jurisdiction" />} value={jurisdiction || ''}>
										{Object.values(eJurisdiction).map((jurisdiction) => (
											<MenuItem key={jurisdiction} value={jurisdiction}>
												<div style={{ display: 'flex', alignItems: 'center' }}>
													<ListItemIcon sx={{ minWidth: 36 }}>
														{getJurisdictionCrestCircleReact(jurisdiction, {
															width: 36,
															height: 36,
															paddingRight: theme.spacing(1),
														})}
													</ListItemIcon>

													<ListItemText primary={jurisdictions[jurisdiction].name} />
												</div>
											</MenuItem>
										))}
									</Select>
								)}
							/>

							{errors.jurisdiction && <FormHelperText error>{errors.jurisdiction.message}</FormHelperText>}
						</FormGroup>
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<FormControlLabel
								control={
									<Controller
										name="is_federal"
										control={control}
										render={({ field }) => <Checkbox {...field} checked={is_federal === true} />}
									/>
								}
								label="Federal election"
							/>
						</FormGroup>

						{errors.is_federal && <FormHelperText error>{errors.is_federal.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<FormControlLabel
								control={
									<Controller
										name="is_state"
										control={control}
										render={({ field }) => <Checkbox {...field} checked={is_state === true} />}
									/>
								}
								label="State election"
							/>
						</FormGroup>

						{errors.is_state && <FormHelperText error>{errors.is_state.message}</FormHelperText>}
					</FormControl>

					<FormControl fullWidth={true} sx={{ mb: 3 }} component="fieldset" variant="outlined">
						<FormGroup>
							<FormControlLabel
								control={
									<Controller
										name="is_hidden"
										control={control}
										render={({ field }) => <Checkbox {...field} checked={is_hidden === true} />}
									/>
								}
								label="Hide election"
							/>
						</FormGroup>

						{errors.is_hidden && <FormHelperText error>{errors.is_hidden.message}</FormHelperText>}
					</FormControl>
				</Paper>
			</form>

			<AppBar position="fixed" color="transparent" sx={{ top: 'auto', bottom: 0, backgroundColor: 'white' }}>
				<Toolbar sx={{ justifyContent: 'flex-end' }}>
					<Button
						loading={isElectionSaving}
						loadingPosition="end"
						disabled={isDirty === false}
						size="small"
						color="primary"
						endIcon={primaryFormButtonIcon}
						onClick={onClickSave}
					>
						{/* See the note re browser crashes when translating pages: https://mui.com/material-ui/react-button/#loading-button */}
						<span>{primaryFormButtonLabel}</span>
					</Button>
				</Toolbar>
			</AppBar>
		</React.Fragment>
	);
}

export default ElectionForm;
