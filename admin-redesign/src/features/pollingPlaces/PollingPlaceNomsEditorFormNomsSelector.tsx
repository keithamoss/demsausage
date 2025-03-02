import {
	Avatar,
	Checkbox,
	FormControl,
	FormGroup,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Typography,
} from '@mui/material';
import * as React from 'react';
import { type Control, Controller } from 'react-hook-form';
import { FormFieldValidationError, FormFieldValidationErrorMessageOnly } from '../../app/forms/formHelpers';
import type { StallFoodOptions, StallFoodOptionsErrors } from '../../app/services/stalls';
import TextFieldWithPasteAdornment from '../../app/ui/textFieldWithPasteAdornment';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import { getAllFoodsAvailableOnStalls, standaloneIconSize, supportingIcons } from '../icons/iconHelpers';
import type { IPollingPlaceStallModifiableProps } from './pollingPlacesInterfaces';

interface Props {
	foodOptions: StallFoodOptions;
	onChange: (foodOptions: StallFoodOptions) => void;
	allowPasteOnTextFields: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	control: Control<IPollingPlaceStallModifiableProps, any>;
	errors: StallFoodOptionsErrors | undefined;
}

export default function PollingPlaceNomsEditorFormNomsSelector(props: Props) {
	const { foodOptions, onChange, allowPasteOnTextFields, control, errors } = props;

	const isRedCrossOfShameChosen = foodOptions[supportingIcons.red_cross.value as keyof StallFoodOptions] === true;

	// ######################
	// Food Options
	// ######################
	const onClickFoodOption = (foodOptionName: keyof StallFoodOptions) => () => onToggleFoodOption(foodOptionName);

	const onToggleFoodOption = (foodOptionName: keyof StallFoodOptions) => {
		if (foodOptions[foodOptionName] === undefined) {
			return onChange({ ...foodOptions, [foodOptionName]: true });
		}

		const { [foodOptionName]: foodOptionNameValue, ...rest } = foodOptions;
		return onChange(rest);
	};

	const onPasteFreeTextNomsFromClipboard = (pastedText: string) => onChange({ ...foodOptions, free_text: pastedText });
	// ######################
	// Food Options (End)
	// ######################

	return (
		<React.Fragment>
			<Typography
				gutterBottom
				variant="h6"
				component="div"
				sx={{ mt: 0, mb: 0, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
			>
				What&apos;s on offer?
			</Typography>

			<FormControl fullWidth={true} component="fieldset" variant="outlined">
				<FormGroup>
					<List
						dense
						sx={{
							width: '100%',
							pt: 0,
							pb: 0,
							// marginBottom: 1,
							// bgcolor: 'background.paper',
						}}
					>
						{isRedCrossOfShameChosen === false && (
							<React.Fragment>
								{getAllFoodsAvailableOnStalls().map((option) => {
									const labelId = `checkbox-list-secondary-label-${option.value}`;
									return (
										<ListItem
											key={option.value}
											secondaryAction={
												<Checkbox
													value={option.value}
													checked={foodOptions[option.value as keyof StallFoodOptions] === true}
													onChange={onClickFoodOption(option.value as keyof StallFoodOptions)}
													edge="end"
													inputProps={{ 'aria-labelledby': labelId }}
												/>
											}
											disablePadding
										>
											<ListItemButton
												onClick={onClickFoodOption(option.value as keyof StallFoodOptions)}
												sx={{ pl: 0 }}
											>
												<ListItemAvatar>
													<Avatar
														alt={option.value}
														sx={{ backgroundColor: 'transparent', '& svg': standaloneIconSize }}
													>
														{option.icon.react}
													</Avatar>
												</ListItemAvatar>
												<ListItemText id={labelId} primary={option.label} />
											</ListItemButton>
										</ListItem>
									);
								})}

								<ListItem
									secondaryAction={
										<Checkbox
											value={supportingIcons.yellow_minus.value}
											checked={foodOptions[supportingIcons.yellow_minus.value as keyof StallFoodOptions] === true}
											onChange={onClickFoodOption(supportingIcons.yellow_minus.value as keyof StallFoodOptions)}
											edge="end"
											inputProps={{ 'aria-labelledby': 'checkbox-list-secondary-label-run-out' }}
										/>
									}
									disablePadding
								>
									<ListItemButton
										onClick={onClickFoodOption(supportingIcons.yellow_minus.value as keyof StallFoodOptions)}
										sx={{ pl: 0 }}
									>
										<ListItemAvatar>
											<Avatar
												alt={supportingIcons.yellow_minus.value}
												sx={{ backgroundColor: 'transparent', '& svg': standaloneIconSize }}
											>
												{supportingIcons.yellow_minus.icon.react}
											</Avatar>
										</ListItemAvatar>
										<ListItemText
											id={'checkbox-list-secondary-label-run-out'}
											primary={supportingIcons.yellow_minus.label}
										/>
									</ListItemButton>
								</ListItem>
							</React.Fragment>
						)}

						<ListItem
							secondaryAction={
								<Checkbox
									value={supportingIcons.red_cross.value}
									checked={isRedCrossOfShameChosen}
									onChange={onClickFoodOption(supportingIcons.red_cross.value as keyof StallFoodOptions)}
									edge="end"
									inputProps={{ 'aria-labelledby': 'checkbox-list-secondary-label-red-cross-of-shame' }}
								/>
							}
							disablePadding
						>
							<ListItemButton
								onClick={onClickFoodOption(supportingIcons.red_cross.value as keyof StallFoodOptions)}
								sx={{ pl: 0 }}
							>
								<ListItemAvatar>
									<Avatar
										alt={supportingIcons.red_cross.value}
										sx={{ backgroundColor: 'transparent', '& svg': standaloneIconSize }}
									>
										{supportingIcons.red_cross.icon.react}
									</Avatar>
								</ListItemAvatar>
								<ListItemText
									id={'checkbox-list-secondary-label-red-cross-of-shame'}
									primary={supportingIcons.red_cross.label}
								/>
							</ListItemButton>
						</ListItem>
					</List>
				</FormGroup>
			</FormControl>

			{isRedCrossOfShameChosen === false && (
				<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
					<FormGroup>
						<Controller
							name="noms.free_text"
							control={control}
							render={({ field }) => (
								<TextFieldWithPasteAdornment
									{...field}
									value={field.value || ''}
									label="Anything else?"
									helperText="e.g. There's also yummy gluten free sausage rolls, cold drinks, and pony rides!"
									onPasteFromClipboard={onPasteFreeTextNomsFromClipboard}
									pastingDisabled={allowPasteOnTextFields === false}
									sx={{ mt: 1 }}
								/>
							)}
						/>
					</FormGroup>

					{errors !== undefined && errors.free_text !== undefined && (
						<FormFieldValidationError error={errors.free_text} />
					)}
				</FormControl>
			)}

			{errors !== undefined && errors.message !== undefined && (
				<FormFieldValidationErrorMessageOnly message={errors.message} sx={{ mb: 2 }} />
			)}

			{errors !== undefined && errors.root !== undefined && <FormFieldValidationError error={errors.root} />}
		</React.Fragment>
	);
}
