import { createTheme } from '@mui/material';

export const mapaThemePrimaryPurple = '#6740b4';

export const mapaThemePrimaryGrey = '#4D4D4D';
export const mapaThemePrimaryGreen = '#699222';
export const mapaThemeSecondaryBlue = '#226992';
export const mapaThemeSecondaryBlueRGB = '34, 105, 146';
export const demSausageThemeWarningPurple = '#922269';

export const defaultAppMapColour = '#f7f7f7';

export const defaultAppBarColour = mapaThemePrimaryGreen;

export const defaultNakedDialogColour = '#FFFFFF';

export const defaultNakedNonFullScreenDialogColour = mapaThemePrimaryGreen;

export const theme = createTheme({
	palette: {
		primary: {
			main: mapaThemePrimaryPurple,
		},
		secondary: {
			main: mapaThemePrimaryPurple,
		},
		error: {
			main: demSausageThemeWarningPurple,
		},
	},
});

export const getThemeColour = () => {
	const el = document.querySelector("meta[name='theme-color']");
	return el?.getAttribute('content') || defaultAppMapColour;
};

export const setThemeColour = (themeColour: string) => {
	const el = document.querySelector("meta[name='theme-color']");
	if (el !== null) {
		el.setAttribute('content', themeColour);
	}
};

export const appBarHeight = 48;
