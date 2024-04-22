import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import debounce from 'lodash-es/debounce';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { saveStateToLocalStorage } from './app/localStorage';
import { router } from './app/routing/routes';
import { electionsApi } from './app/services/elections';
import { store } from './app/store';
import { theme } from './app/ui/theme';
// import "./browserstack";

const container = document.getElementById('root')!;
const root = createRoot(container);

store.dispatch(electionsApi.endpoints.getElections.initiate());

store.subscribe(
	// subscribe() gets called for all changes to state, so lets
	// debounce for better performance because we don't really
	// care about synching state quite that accurately.
	debounce(() => {
		saveStateToLocalStorage(store.getState());
	}, 2000),
);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<RouterProvider router={router} />
				</ThemeProvider>
			</LocalizationProvider>
		</Provider>
	</React.StrictMode>,
);
