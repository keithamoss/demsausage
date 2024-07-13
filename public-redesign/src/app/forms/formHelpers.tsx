import { Alert } from '@mui/material';
import { upperFirst } from 'lodash-es';
import { FieldError } from 'react-hook-form';

export const FormFieldValidationError = (props: { error: FieldError }) => (
	<Alert severity="error" sx={{ marginTop: 1 }}>
		{upperFirst(props.error.message)}
	</Alert>
);

export const FormFieldValidationErrorMessageOnly = (props: { message: string }) => (
	<Alert severity="error" sx={{ marginTop: 1 }}>
		{upperFirst(props.message)}
	</Alert>
);
