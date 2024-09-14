import { TextField, TextFieldProps } from '@mui/material';
import { ForwardedRef, forwardRef } from 'react';

const TextFieldWithout1Password = (props: TextFieldProps, ref: ForwardedRef<HTMLDivElement>) => (
	<TextField ref={ref} inputProps={{ ...props?.inputProps, 'data-1p-ignore': true }} {...props} />
);

export default forwardRef(TextFieldWithout1Password);
