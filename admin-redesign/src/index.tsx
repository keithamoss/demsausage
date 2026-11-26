import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProvider, NotificationsProvider } from '@toolpad/core';
import 'dayjs/locale/en-au';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routing/routes';
import { authApi } from './app/services/auth';
import { store } from './app/store';
import { theme } from './app/ui/theme';
// import "./browserstack";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const container = document.getElementById('root')!;
const root = createRoot(container);

// store.dispatch(electionsApi.endpoints.getElections.initiate());
store.dispatch(authApi.endpoints.checkLoginStatus.initiate());

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<AppProvider theme={theme}>
				<NotificationsProvider
					slotProps={{
						snackbar: {
							anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
						},
					}}
				>
					<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-au">
						<HelmetProvider>
							<CssBaseline />
							<RouterProvider
								router={router}
								future={{
									// Disabled because the drawer backdrop can get stuck and block clicks after navigation:
									// https://github.com/mui/material-ui/issues/32286
									// MUI 9.3.1 includes a fix for stuck exit transitions:
									// https://github.com/mui/material-ui/releases/tag/v9.3.1
									// Re-enable this flag after upgrading MUI and verifying the drawer works.
									v7_startTransition: false,
								}}
							/>
						</HelmetProvider>
					</LocalizationProvider>
				</NotificationsProvider>
			</AppProvider>
		</Provider>
	</React.StrictMode>,
);
