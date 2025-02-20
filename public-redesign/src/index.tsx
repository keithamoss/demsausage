import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routing/routes';
import { electionsApi } from './app/services/elections';
import { store } from './app/store';
import { theme } from './app/ui/theme';
// import "./browserstack";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const container = document.getElementById('root')!;
const root = createRoot(container);

store.dispatch(electionsApi.endpoints.getElections.initiate());

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<HelmetProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<RouterProvider router={router} />
					</ThemeProvider>
				</HelmetProvider>
			</LocalizationProvider>
		</Provider>
	</React.StrictMode>,
);
