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
} from '@mui/material';
import * as React from 'react';
import { useMemo } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { FormFieldValidationError, FormFieldValidationErrorMessageOnly } from '../../../app/forms/formHelpers';
import type { StallFoodOptions } from '../../../app/services/stalls';
import TextFieldWithPasteAdornment from '../../../app/ui/textFieldWithPasteAdornment';
import { getAllFoodsAvailableOnStalls, standaloneIconSize, supportingIcons } from '../../icons/iconHelpers';
import type { IPollingPlaceNoms } from '../../pollingPlaces/pollingPlacesInterfaces';

interface Props {
	foodOptions: StallFoodOptions;
	onChange: (foodOptions: StallFoodOptions) => void;
	errors:
		| FieldErrors<{
				noms: IPollingPlaceNoms;
		  }>
		| undefined;
}

export default function MetaPollingPlacePollingPlaceNomsEditorFormNomsSelector(props: Props) {
	const { foodOptions, onChange, errors } = props;

	const isRedCrossOfShameChosen = foodOptions[supportingIcons.red_cross.value as keyof StallFoodOptions] === true;

	// ######################
	// !! Important !!
	// If you're updating this component, be sure to reflect all changes in PollingPlaceNomsEditorFormNomsSelector
	// ######################

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

	const inputFieldRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const onPasteFreeTextNomsFromClipboard = (pastedText: string) => {
		if (inputFieldRef.current !== null) {
			inputFieldRef.current.value = pastedText;
		}

		onChange({ ...foodOptions, free_text: pastedText });
	};

	// This is ugly! We're using a Controlled TextField because otherwise isDirty in MetaPollingPlaceTaskCrowdsourceFromFacebook was always true because free_text was being set to underfined and after the first render when using a regular <Control> wrapped RHF TextField.
	// No idea why, so here's the hacky workaround.
	// Longer-term, maybe we ditch RHF for this component altogether.
	const onChangeFreeTextFoodOption = useMemo(
		() => (e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.value.length >= 1) {
				return onChange({ ...foodOptions, free_text: e.target.value });
			}

			const { free_text, ...rest } = foodOptions;

			// Ensures we remove 'free_text' from the list of noms when it's empty
			return onChange(rest);
		},
		[foodOptions, onChange],
	);
	// ######################
	// Food Options (End)
	// ######################

	return (
		<React.Fragment>
			{/* <Typography
				gutterBottom
				variant="h6"
				component="div"
				sx={{ mt: 0, mb: 0, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
			>
				What&apos;s on offer?
			</Typography> */}

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
					<TextFieldWithPasteAdornment
						inputRef={inputFieldRef}
						value={foodOptions.free_text || ''}
						onChange={onChangeFreeTextFoodOption}
						label="Anything else?"
						helperText="e.g. There's also yummy gluten free sausage rolls, cold drinks, and pony rides!"
						onPasteFromClipboard={onPasteFreeTextNomsFromClipboard}
						sx={{ mt: 1 }}
					/>

					{errors !== undefined && errors.noms !== undefined && errors.noms.free_text !== undefined && (
						<FormFieldValidationError error={errors.noms.free_text} />
					)}
				</FormControl>
			)}

			{errors !== undefined && errors.noms !== undefined && errors.noms.message !== undefined && (
				<FormFieldValidationErrorMessageOnly message={errors.noms.message} sx={{ mb: 2 }} />
			)}

			{errors !== undefined && errors.noms !== undefined && errors.noms.root !== undefined && (
				<FormFieldValidationError error={errors.noms.root} />
			)}
		</React.Fragment>
	);
}
