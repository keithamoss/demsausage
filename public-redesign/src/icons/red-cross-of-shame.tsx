import { createSvgIcon } from '@mui/material';

export default createSvgIcon(
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" version="1">
		<defs>
			<radialGradient id="a" gradientUnits="userSpaceOnUse" cy="15.163" cx="15.891" r="27.545">
				<stop offset="0" stopColor="#fff" />
				<stop offset="1" stopColor="#00f038" stopOpacity="0" />
			</radialGradient>
			<radialGradient
				id="b"
				gradientUnits="userSpaceOnUse"
				cy="16.847"
				cx="16.028"
				gradientTransform="matrix(.91888 .94532 -.71707 .69701 13.381 -10.047)"
				r="27.545"
			>
				<stop offset="0" stopColor="#ff9b9b" />
				<stop offset="1" stopColor="#f00000" />
			</radialGradient>
		</defs>
		<path
			d="M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z"
			transform="translate(4.496 4.3147) scale(.99849)"
			fill="url(#a)"
		/>
		<path
			d="M55.091 27.727a27.545 27.545 0 1 1-55.091 0 27.545 27.545 0 1 1 55.091 0z"
			transform="translate(4.496 4.3147) scale(.99849)"
			strokeLinejoin="round"
			stroke="#be0000"
			strokeLinecap="round"
			strokeWidth="2.5038"
			fill="url(#b)"
		/>
		<path
			d="M36.094 18.812c-1.798 1.551-3.145 4.37-4.532 5.844-2.631-2.177-3.818-6.236-6.656-7.375-3.44.919-8.904 4.136-4.875 7.625 2.058 3.043 6.195 5.747 7.157 8.906-1.468 3.79-4.292 6.616-7.032 9.376 1.34 4.675 7.755.524 10.344-1.75 2.065-4.634 3.568.898 5.499 2.891 1.541 6.222 9.801 4.403 10.521-.74-2.84-4.549-6.781-8.924-9.52-13.401 1.085-4.655 5.63-7.771 6.69-12.282-1.79-3.122-5.284.353-7.596.906z"
			fill="#fff"
		/>
	</svg>,
	'RedCrossofShameIcon',
);
