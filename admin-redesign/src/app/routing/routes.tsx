import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import ErrorElement from '../../ErrorElement';
import NotFound from '../../NotFound';
import PendingStalls from '../../features/pendingStalls/PendingStalls';
import PollingPlaceChooser from '../../features/pollingPlaces/PollingPlaceChooser';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <ErrorElement />,
		children: [
			{
				path: '',
				element: <PendingStalls />,
				loader: () => ({
					name: 'Pending Stalls',
				}),
			},
			{
				path: '/polling-places',
				element: <PollingPlaceChooser />,
				loader: () => ({
					name: 'Polling Places',
				}),
				children: [
					{
						path: '/polling-places/:election_name/',
						element: <PollingPlaceChooser />,
					},
					// {
					// 	path: '/polling-places/:election_name/:polling_place_id/',
					// 	element: <AddStallSelectPollingPlace />,
					// },
				],
			},
		],
	},
	{
		path: '*',
		element: <NotFound />,
	},
]);
