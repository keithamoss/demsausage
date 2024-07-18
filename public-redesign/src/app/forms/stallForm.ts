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
		// Yup's inbuilt URL validation doesn't allow us to have a valid URL or blank, so here's the easiest workaround
		website: yup.lazy((value) =>
			!value
				? yup.string().optional()
				: yup
						.string()
						// Yup's regex doesn't allow for URLs wihout the proctol, so this is our pragmatic fix that doesn't involve trying to have a regex that validates URLs. Abandon hope all ye who embark upon that task.
						.transform((value: string) =>
							// In this day and age, let's just assume everything that's likely to be a website link for a stall supports https and tack it on the start
							value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`,
						)
						.url(),
		),
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
