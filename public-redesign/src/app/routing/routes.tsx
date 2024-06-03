import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import ErrorElement from '../../ErrorElement';
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
		errorElement: <ErrorElement />,
		children: [
			{
				path: 'about',
				element: <AboutPage />,
				loader: () => ({
					name: 'About',
				}),
			},
			{
				path: 'add-stall',
				element: <AddStall />,
				loader: () => ({
					name: 'Add Stall',
				}),
			},
			{
				path: 'debug',
				element: <DebugView />,
			},
			{
				path: '/:election_name/:map_lat_lon_zoom?/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
			{
				path: '/:election_name/place/:search_term/m/:map_lat_lon_zoom/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
			{
				path: '/:election_name/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
			{
				path: '/:election_name/gps/:gps_lon_lat/m/:map_lat_lon_zoom/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
			{
				path: '/:election_name/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
			{
				path: '/:election_name/search/',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
				children: [
					{
						path: '/:election_name/search/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/place/:search_term/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/gps/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/gps/:gps_lon_lat/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
					{
						path: '/:election_name/search/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/',
						element: <SearchDrawer />,
					},
				],
			},
			{
				path: '/:election_name',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
				children: [
					// The more specific route needs to go first because otherwise it will match the [Name] + [State] route first when we don't have `/m?/:map_lat_lon_zoom` on the end (because those are both optional params)
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/m?/:map_lat_lon_zoom?/',
						element: <PollingPlaceCardDrawer />,
						handle: ['Foobar'],
					},
					// Occasionally some elections will have no premises names on polling places.
					{
						path: '/:election_name/polling_places/:polling_place_name/:polling_place_state/m?/:map_lat_lon_zoom?/',
						element: <PollingPlaceCardDrawer />,
					},
				],
			},
			{
				path: '',
				element: <Map />,
				loader: () => ({
					name: 'Map',
				}),
			},
		],
	},
]);
