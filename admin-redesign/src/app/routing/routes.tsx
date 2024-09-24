import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import ErrorElement from '../../ErrorElement';
import NotFound from '../../NotFound';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <ErrorElement />,
		children: [
			// {
			// 	path: '',
			// 	element: <Map />,
			// 	loader: () => ({
			// 		name: 'Map',
			// 	}),
			// },
		],
	},
	{
		path: '*',
		element: <NotFound />,
	},
]);
