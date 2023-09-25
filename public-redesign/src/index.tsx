import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/routing/routes';
import { electionsApi } from './app/services/elections';
import { store } from './app/store';
import { theme } from './app/ui/theme';
// import './index.css';
// import "./browserstack";

const container = document.getElementById('root')!;
const root = createRoot(container);

store.dispatch(electionsApi.endpoints.getElections.initiate());

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<RouterProvider router={router} />
			</ThemeProvider>
		</Provider>
	</React.StrictMode>,
);
