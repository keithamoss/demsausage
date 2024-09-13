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
import { debounce } from 'lodash-es';
import * as React from 'react';
import { useMemo } from 'react';
import { FormFieldValidationErrorMessageOnly } from '../../../app/forms/formHelpers';
import { StallFoodOptions, StallFoodOptionsErrors } from '../../../app/services/stalls';
import TextFieldWithout1Password from '../../../app/ui/textFieldWithout1Password';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { getAllFoodsAvailableOnStalls, standaloneIconSize } from '../../icons/iconHelpers';

interface Props {
	foodOptions: StallFoodOptions;
	onChange: (foodOptions: StallFoodOptions) => void;
	errors: StallFoodOptionsErrors | undefined;
}

export default function AddStallFormFoodOptionsSelector(props: Props) {
	const { foodOptions, onChange, errors } = props;

	// ######################
	// Food Options
	// ######################
	const onClickFoodOption = (foodOptionName: keyof StallFoodOptions) => () => onToggleFoodOption(foodOptionName);

	const onToggleFoodOption = (foodOptionName: keyof StallFoodOptions) => {
		if (foodOptions[foodOptionName] === undefined) {
			return onChange({ ...foodOptions, [foodOptionName]: true });
		} else {
			const { [foodOptionName]: foodOptionNameValue, ...rest } = foodOptions;
			return onChange(rest);
		}
	};

	const onChangeFreeTextFoodOption = useMemo(
		() =>
			debounce((e: React.ChangeEvent<HTMLInputElement>) => {
				if (e.target.value.length >= 1) {
					return onChange({ ...foodOptions, free_text: e.target.value });
				} else {
					const { free_text, ...rest } = foodOptions;
					return onChange(rest);
				}
			}, 500),
		[foodOptions, onChange],
	);
	// ######################
	// Food Options (End)
	// ######################

	return (
		<React.Fragment>
			<Typography
				gutterBottom
				variant="h6"
				component="div"
				sx={{ mt: 1, mb: 0, borderTop: `3px solid ${mapaThemePrimaryGrey}` }}
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
							// marginBottom: 1,
							// bgcolor: 'background.paper',
						}}
					>
						{getAllFoodsAvailableOnStalls().map((option) => {
							const labelId = `checkbox-list-secondary-label-${option.value}`;
							return (
								<ListItem
									key={option.value}
									secondaryAction={
										<Checkbox
											value={option.value}
											checked={foodOptions[option.value as keyof StallFoodOptions] === true ? true : false}
											onChange={onClickFoodOption(option.value as keyof StallFoodOptions)}
											edge="end"
											inputProps={{ 'aria-labelledby': labelId }}
										/>
									}
									disablePadding
								>
									<ListItemButton onClick={onClickFoodOption(option.value as keyof StallFoodOptions)} sx={{ pl: 0 }}>
										<ListItemAvatar>
											<Avatar alt={option.value} sx={{ backgroundColor: 'transparent', '& svg': standaloneIconSize }}>
												{option.icon.react}
											</Avatar>
										</ListItemAvatar>
										<ListItemText id={labelId} primary={option.label} />
									</ListItemButton>
								</ListItem>
							);
						})}
					</List>
				</FormGroup>
			</FormControl>

			{/* We can't use <Controller /> here because `control` has a different type for the Owner and TipOff form */}
			<FormControl fullWidth={true} sx={{ mb: 2 }} component="fieldset" variant="outlined">
				<FormGroup>
					<TextFieldWithout1Password
						label="Anything else?"
						helperText="e.g. There's also yummy gluten free sausage rolls, cold drinks, and pony rides!"
						sx={{ mt: 1 }}
						onChange={onChangeFreeTextFoodOption}
					/>
				</FormGroup>
			</FormControl>

			{errors !== undefined && errors.message !== undefined && (
				<FormFieldValidationErrorMessageOnly message={errors.message} sx={{ mb: 2 }} />
			)}
		</React.Fragment>
	);
}
