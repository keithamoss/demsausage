import * as yup from 'yup';
import { ObjectSchema } from 'yup';
import { StallFoodOptions, StallOwnerModifiableProps, StallTipOffModifiableProps } from '../services/stalls';
import { booleanTrueOrUndefined } from './yupValidation';

export const stallNomsFieldFormValidationSchema: ObjectSchema<StallFoodOptions> = yup
	.object({
		bbq: booleanTrueOrUndefined,
		cake: booleanTrueOrUndefined,
		vego: booleanTrueOrUndefined,
		halal: booleanTrueOrUndefined,
		bacon_and_eggs: booleanTrueOrUndefined,
		coffee: booleanTrueOrUndefined,
		free_text: yup.string().optional(),
	})
	.required()
	.test('not-empty', 'One or more food option must be selected', (value) => Object.keys(value).length >= 1);

export const stallOwnerFormValidationSchema: ObjectSchema<StallOwnerModifiableProps> = yup
	.object({
		name: yup.string().required(),
		description: yup.string().required(),
		opening_hours: yup.string().optional(),
		website: yup.string().url().optional(),
		noms: stallNomsFieldFormValidationSchema,
		email: yup.string().email().required(),
	})
	.required();

export const stallFormTipOffValidationSchema: ObjectSchema<StallTipOffModifiableProps> = yup
	.object({
		noms: stallNomsFieldFormValidationSchema,
		email: yup.string().email().required(),
	})
	.required();
