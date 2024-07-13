import * as yup from 'yup';

export const booleanTrueOrUndefined = yup.boolean().test({
	// name: 'unused',
	// message: 'unused',
	test: (value) => value === true || value === undefined,
});
