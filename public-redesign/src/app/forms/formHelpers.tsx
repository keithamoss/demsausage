import { Alert, SxProps, Theme } from '@mui/material';
import { upperFirst } from 'lodash-es';
import { FieldError } from 'react-hook-form';

export const FormFieldValidationError = (props: { error: FieldError }) => (
	<Alert severity="error" sx={{ marginTop: 1 }}>
		{upperFirst(props.error.message)}
	</Alert>
);

export const FormFieldValidationErrorMessageOnly = (props: { message: string; sx: SxProps<Theme> | undefined }) => (
	<Alert severity="error" sx={{ marginTop: 1, ...props.sx }}>
		{upperFirst(props.message)}
	</Alert>
);
