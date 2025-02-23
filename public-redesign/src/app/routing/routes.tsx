import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import ErrorElement from '../../ErrorElement';
import NotFound from '../../NotFound';
import AboutPage from '../../features/aboutPage/AboutPage';
import AddStall from '../../features/addStall/AddStall';
import AddStallSelectElection from '../../features/addStall/addStallSelectElection/addStallSelectElection';
import AddStallSelectPollingPlace from '../../features/addStall/addStallSelectPollingPlace/addStallSelectPollingPlace';
import AddStallStallCreatorForm from '../../features/addStall/addStallStallForm/addStallStallCreatorForm';
import AddStallSubmitted from '../../features/addStall/addStallSubmitted/addStallSubmitted';
import AddStallSubmitterType from '../../features/addStall/addStallSubmitterType/addStallSubmitterType';
import DebugView from '../../features/debugView/debugView';
import EditStall from '../../features/editStall/EditStall';
import EditStallStallEditorForm from '../../features/editStall/editStallStallForm/editStallStallEditorForm';
import EditStallSubmitted from '../../features/editStall/editStallSubmitted/editStallSubmitted';
import EmbedBuilder from '../../features/embedBuilder/EmbedBuilder';
import ElectionsList from '../../features/map/layersSelector/electionsList';
import DemSausageMap from '../../features/map/map';
import MediaPage from '../../features/mediaPage/MediaPage';
import PollingPlaceCardDrawer from '../../features/pollingPlaces/pollingPlaceCardDrawer';
import Sausagelytics from '../../features/sausagelytics/Sausagelytics';
import SearchDrawer from '../../features/search/searchDrawer';
import StallPermalink from '../../features/stalls/stallPermalink';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6(createBrowserRouter);

export const router = sentryCreateBrowserRouter(
	[
		{
			path: '/',
			element: <App />,
			errorElement: <ErrorElement />,
			children: [
				{
					path: '/elections',
					element: <ElectionsList />,
					loader: () => ({
						name: 'Elections',
					}),
				},
				{
					path: '/sausagelytics/:election_name?/',
					element: <Sausagelytics />,
					loader: () => ({
						name: 'Stats',
					}),
				},
				{
					path: '/embed',
					element: <EmbedBuilder />,
					loader: () => ({
						name: 'Embed The Map',
					}),
				},
				{
					path: '/about',
					element: <AboutPage />,
					loader: () => ({
						name: 'About and FAQs',
					}),
				},
				{
					path: '/media',
					element: <MediaPage />,
					loader: () => ({
						name: 'Media',
					}),
				},
				{
					path: '/add-stall',
					element: <AddStall />,
					loader: () => ({
						name: 'Add Stall',
					}),
					children: [
						{
							path: '/add-stall',
							element: <AddStallSelectElection />,
						},
						{
							path: '/add-stall/:election_name/',
							element: <AddStallSelectPollingPlace />,
						},
						{
							path: '/add-stall/:election_name/search/place/:search_term/',
							element: <AddStallSelectPollingPlace />,
						},
						{
							path: '/add-stall/:election_name/search/place/:search_term/:place_lon_lat/',
							element: <AddStallSelectPollingPlace />,
						},
						{
							path: '/add-stall/:election_name/search/gps/',
							element: <AddStallSelectPollingPlace />,
						},
						{
							path: '/add-stall/:election_name/search/gps/:gps_lon_lat/',
							element: <AddStallSelectPollingPlace />,
						},
						// ############################
						// Polling Places
						// ############################
						{
							path: '/add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/',
							element: <AddStallSubmitterType />,
						},
						// Occasionally some elections will have no premises names on polling places.
						{
							path: '/add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/',
							element: <AddStallSubmitterType />,
						},
						{
							path: '/add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/submitter/:submitter_type/',
							element: <AddStallStallCreatorForm />,
						},
						// Occasionally some elections will have no premises names on polling places.
						{
							path: '/add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/submitter/:submitter_type/',
							element: <AddStallStallCreatorForm />,
						},
						// ############################
						// Polling Places (End)
						// ############################

						// ############################
						// Polling Place Location Lookup
						// ############################
						{
							path: '/add-stall/:election_name/location/:location_name/:location_address/:location_state/:location_lon_lat/',
							element: <AddStallSubmitterType />,
						},
						{
							path: '/add-stall/:election_name/location/:location_name/:location_address/:location_state/:location_lon_lat/submitter/:submitter_type/',
							element: <AddStallStallCreatorForm />,
						},
						// ############################
						// Polling Place Location Lookup (End)
						// ############################
						{
							path: '/add-stall/:election_name/submitted/',
							element: <AddStallSubmitted />,
						},
					],
				},
				{
					path: '/edit-stall',
					element: <EditStall />,
					loader: () => ({
						name: 'Edit Stall',
					}),
					children: [
						{
							path: '/edit-stall/:election_name/',
							element: <EditStallStallEditorForm />,
						},
						{
							path: '/edit-stall/:election_name/submitted/',
							element: <EditStallSubmitted />,
						},
					],
				},
				{
					path: '/debug',
					element: <DebugView />,
				},
				{
					path: '/:election_name/m/:map_lat_lon_zoom?/',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
				{
					path: '/:election_name/place/:search_term/m/:map_lat_lon_zoom/',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
				{
					path: '/:election_name/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
				{
					path: '/:election_name/gps/:gps_lon_lat/m/:map_lat_lon_zoom/',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
				{
					path: '/:election_name/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
				{
					path: '/:election_name/search/',
					element: <DemSausageMap />,
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
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
					children: [
						// The more specific route needs to go first because otherwise it will match the [Name] + [State] route first when we don't have `/m?/:map_lat_lon_zoom` on the end (because those are both optional params)
						{
							path: '/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/m?/:map_lat_lon_zoom?/',
							element: <PollingPlaceCardDrawer />,
						},
						// Occasionally some elections will have no premises names on polling places.
						{
							path: '/:election_name/polling_places/:polling_place_name/:polling_place_state/m?/:map_lat_lon_zoom?/',
							element: <PollingPlaceCardDrawer />,
						},
					],
				},
				{
					path: '/:election_name/stalls/:stall_id/',
					element: <StallPermalink />,
				},
				{
					path: '',
					element: <DemSausageMap />,
					loader: () => ({
						name: 'Map',
					}),
				},
			],
		},
		{
			path: '*',
			element: <NotFound />,
		},
	],
	{
		future: {
			v7_relativeSplatPath: true,
		},
	},
);
