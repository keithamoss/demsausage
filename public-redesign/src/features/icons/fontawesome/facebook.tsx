import { SvgIcon } from '@mui/material';
import { PureComponent } from 'react';

const svg = (props: object) => (
	<SvgIcon {...props}>
		<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
			<path d="M448 80v352c0 26.5-21.5 48-48 48h-85.3V302.8h60.6l8.7-67.6h-69.3V192c0-19.6 5.4-32.9 33.5-32.9H384V98.7c-6.2-.8-27.4-2.7-52.2-2.7-51.6 0-87 31.5-87 89.4v49.9H184v67.6h60.9V480H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h352c26.5 0 48 21.5 48 48z" />
		</svg>
	</SvgIcon>
);

const FacebookIcon = new PureComponent(svg);
// FacebookIcon.displayName = 'FacebookIcon';
// FacebookIcon.muiName = 'SvgIcon';

export default FacebookIcon;
