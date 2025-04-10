import type { ObjectSchema } from 'yup';
import * as yup from 'yup';
import {
	type IMetaPollingPlaceLinkModifiableProps,
	IMetaPollingPlaceLinkType,
} from '../../../features/metaPollingPlaceTasks/metaPollingPlaceTasksInterfaces';

export const metaPollingPlaceLinkFormValidationSchema: ObjectSchema<IMetaPollingPlaceLinkModifiableProps> = yup
	.object({
		type: yup
			.mixed<IMetaPollingPlaceLinkType>()
			.oneOf(Object.values(IMetaPollingPlaceLinkType))
			.required('This is a required field, cheers!'),
		// Yup's inbuilt URL validation doesn't allow us to have a valid URL or blank, so here's the easiest workaround
		url: yup.lazy((value) =>
			yup
				.string()
				// Yup's regex doesn't allow for URLs wihout the proctol, so this is our pragmatic fix that doesn't involve trying to have a regex that validates URLs. Abandon hope all ye who embark upon that task.
				.transform((value: string) =>
					// In this day and age, let's just assume everything that's likely to be a website link for a stall supports https and tack it on the start
					value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`,
				)
				.url()
				.required(),
		),
	})
	.required();
