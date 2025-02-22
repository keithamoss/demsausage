import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AppProvider } from '@toolpad/core';
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
				<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-au">
					<HelmetProvider>
						<CssBaseline />
						<RouterProvider router={router} />
					</HelmetProvider>
				</LocalizationProvider>
			</AppProvider>
		</Provider>
	</React.StrictMode>,
);
