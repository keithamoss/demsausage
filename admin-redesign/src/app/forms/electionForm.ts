import dayjs from 'dayjs';
import type { ObjectSchema } from 'yup';
import * as yup from 'yup';
import { eJurisdiction } from '../../features/icons/jurisdictionHelpers';
import type { ElectionModifiableProps } from '../services/elections';

export const electionFormValidationSchema: ObjectSchema<ElectionModifiableProps> = yup
	.object({
		name: yup.string().required(),
		short_name: yup.string().required(),
		election_day: yup
			.string()
			.required()
			.test('is-date', "This doesn't appear to be a valid date", (value) => dayjs(value).isValid())
			.transform((v) => dayjs(v).toISOString()),
		jurisdiction: yup.mixed<eJurisdiction>().oneOf(Object.values(eJurisdiction)).required(),
		geom: yup
			.object({
				type: yup.string().required(),
				coordinates: yup.array().min(1).required(),
			})
			.required(),
		// @TODO How is this set? Why not use jurisidiction?
		is_federal: yup.boolean().required(),
		is_hidden: yup.boolean().required(),
	})
	.required();
