import * as yup from 'yup';

export const booleanTrueOrUndefined = yup.boolean().test({
	// name: 'unused',
	// message: 'unused',
	test: (value) => value === true || value === undefined,
});

// Yup's inbuilt URL validation doesn't allow us to have a valid URL or blank, so here's the easiest workaround
export const websiteURLOrEmptyString = yup.lazy((value) =>
	!value
		? yup.string().optional().ensure()
		: yup
				.string()
				// Yup's regex doesn't allow for URLs wihout the proctol, so this is our pragmatic fix that doesn't involve trying to have a regex that validates URLs. Abandon hope all ye who embark upon that task.
				.transform((value: string) =>
					// In this day and age, let's just assume everything that's likely to be a website link for a stall supports https and tack it on the start
					value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`,
				)
				.url()
				.ensure(),
);
