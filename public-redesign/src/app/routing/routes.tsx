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
				path: '/:election_name/:map_lat_lon_zoom?/',
				element: <Map />,
			},
			{
				path: '/:election_name/place/:search_term/:map_lat_lon_zoom?/',
				element: <Map />,
			},
			{
				path: '/:election_name/place/:search_term/:lon_lat/:map_lat_lon_zoom?/',
				element: <Map />,
			},
			{
				path: '/:election_name/gps/:gps_lon_lat/:map_lat_lon_zoom?/',
				element: <Map />,
			},
			{
				path: '/:election_name/by_ids/:polling_place_ids/:map_lat_lon_zoom?/',
				element: <Map />,
			},
			{
				path: '/:election_name',
				element: <Map />,
				children: [
					{
						path: '/:election_name/search/:map_lat_lon_zoom?/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/location/:search_term/:map_lat_lon_zoom?/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/location/:search_term/:lon_lat/:map_lat_lon_zoom?/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/gps/:gps_lon_lat/:map_lat_lon_zoom?/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/by_ids/:polling_place_ids/:map_lat_lon_zoom?/',
						element: <SearchDrawer />,
					},
				],
			},
			{
				path: '/:election_name',
				element: <Map />,
				children: [
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/:map_lat_lon_zoom?/',
						element: <PollingPlaceCardDrawer />,
					},
					// Occasionally some elections will have no premises names on polling places
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_state/:map_lat_lon_zoom?/',
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
