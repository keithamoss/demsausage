import type { ObjectSchema } from 'yup';
import * as yup from 'yup';
import type { IPollingPlaceStallModifiableProps } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import type { StallFoodOptions } from '../services/stalls';
import { booleanTrueOrUndefined, websiteURLOrEmptyString } from './yupValidation';

export const pollingPlaceNomsFieldFormValidationSchema: ObjectSchema<StallFoodOptions> = yup
	.object({
		bbq: booleanTrueOrUndefined,
		cake: booleanTrueOrUndefined,
		vego: booleanTrueOrUndefined,
		halal: booleanTrueOrUndefined,
		bacon_and_eggs: booleanTrueOrUndefined,
		coffee: booleanTrueOrUndefined,
		free_text: yup.string().optional(),
		// Note: These weren't being validated for the public Add Stall interface - is that because we have dedicated forms for those?
		run_out: booleanTrueOrUndefined,
		nothing: booleanTrueOrUndefined,
	})
	.required()
	.test('not-empty', 'One or more food options must be selected', (value) => Object.keys(value).length >= 1)
	.test(
		'red-cross-of-shame-is-solo',
		"'Red Cross of Shame' cannot be mixed with other types of noms",
		(value) => (value.nothing === true && Object.keys(value).length === 1) || value.nothing === undefined,
	)
	.test(
		'run-out-is-not-solo',
		"'Run Out' requires at least one other type of noms",
		(value) => (value.run_out === true && Object.keys(value).length >= 2) || value.run_out === undefined,
	);

export const pollingPlaceNomsFormValidationSchema: ObjectSchema<IPollingPlaceStallModifiableProps> = yup
	.object({
		noms: pollingPlaceNomsFieldFormValidationSchema,
		name: yup.string().optional().ensure(),
		// Note: We require descriptions when the public are submitting stalls, but keep it optional for the Admoin Site
		description: yup.string().optional().ensure(),
		opening_hours: yup.string().optional().ensure(),
		website: websiteURLOrEmptyString,
		extra_info: yup.string().optional().ensure(),
		source: yup.string().optional().ensure(),
		internal_notes: yup.string().optional().ensure(),
		favourited: yup.boolean().required(),
	})
	.required();
