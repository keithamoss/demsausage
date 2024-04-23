import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import AboutPage from '../../features/aboutPage/AboutPage';
import AddStall from '../../features/addStall/AddStall';
import DebugView from '../../features/debugView/debugView';
import Map from '../../features/map/map';
import PollingPlaceCardDrawer from '../../features/pollingPlaces/pollingPlaceCardDrawer';
import SearchDrawer from '../../features/searchDrawer/searchDrawer';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: 'about',
				element: <AboutPage />,
			},
			{
				path: 'add-stall',
				element: <AddStall />,
			},
			{
				path: 'debug',
				element: <DebugView />,
			},
			{
				path: '/:election_name/bounds/:bbox',
				element: <Map />,
			},
			{
				path: '/:election_name',
				element: <Map />,
				children: [
					{
						path: '/:election_name/search/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/location/:search_term/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/location/:search_term/:lon_lat/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/gps/:gps_lon_lat/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/by_ids/:polling_place_ids/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/',
						element: <PollingPlaceCardDrawer />,
					},
					// Occasionally some elections will have no premises names on polling places
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_state/',
						element: <PollingPlaceCardDrawer />,
					},
				],
			},
			{
				path: '',
				element: <Map />,
			},
		],
	},
]);
