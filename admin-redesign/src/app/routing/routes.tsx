import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import ErrorElement from '../../ErrorElement';
import NotFound from '../../NotFound';
import ElectionCreator from '../../features/elections/ElectionCreator';
import ElectionEditor from '../../features/elections/ElectionEditor';
import ElectionEditorControls from '../../features/elections/ElectionEditorControls';
import ElectionEditorLoadPollingPlaces from '../../features/elections/ElectionEditorLoadPollingPlaces';
import ElectionEditorStats from '../../features/elections/ElectionEditorStats';
import ElectionsManager from '../../features/elections/ElectionsManager';
import ElectionsManagerRoot from '../../features/elections/ElectionsManagerRoot';
import PendingStalls from '../../features/pendingStalls/list/PendingStalls';
import PendingStallsPollingPlace from '../../features/pendingStalls/pollingplace/PendingStallsPollingPlace';
import PollingPlaceChooser from '../../features/pollingPlaces/PollingPlaceChooser';
import PollingPlaceEditor from '../../features/pollingPlaces/PollingPlaceEditor';
import PollingPlaceNomsEditor from '../../features/pollingPlaces/PollingPlaceNomsEditor';
import PollingPlaceNomsHistory from '../../features/pollingPlaces/PollingPlaceNomsHistory';
import PollingPlaceStalls from '../../features/pollingPlaces/PollingPlaceStalls';

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
					name: 'Pending Submissions',
				}),
			},
			{
				path: '/pending_stalls/:polling_place_id/',
				element: <PendingStallsPollingPlace />,
				loader: () => ({
					name: 'Pending Submissions',
				}),
			},
			{
				path: '/polling-places',
				element: <PollingPlaceEditor />,
				loader: () => ({
					name: 'Polling Places',
				}),
				children: [
					// Root page: Redirects to the current default election
					{
						path: '/polling-places/:election_name?/',
						element: <PollingPlaceChooser />,
					},
					// Polling place search interface
					{
						path: '/polling-places/:election_name/search/:search_term/',
						element: <PollingPlaceChooser />,
					},
					// ############################
					// Polling Places Noms Editor
					// ############################
					{
						path: '/polling-places/:election_name/search/:search_term/:polling_place_id/',
						element: <PollingPlaceNomsEditor />,
					},
					{
						path: '/polling-places/:election_name/:polling_place_id/',
						element: <PollingPlaceNomsEditor />,
					},
					// ############################
					// Polling Places Noms History
					// ############################
					{
						path: '/polling-places/:election_name/search/:search_term/:polling_place_id/history/',
						element: <PollingPlaceNomsHistory />,
					},
					{
						path: '/polling-places/:election_name/:polling_place_id/history/',
						element: <PollingPlaceNomsHistory />,
					},
					// ############################
					// Polling Places Stalls
					// ############################
					{
						path: '/polling-places/:election_name/search/:search_term/:polling_place_id/stalls/',
						element: <PollingPlaceStalls />,
					},
					{
						path: '/polling-places/:election_name/:polling_place_id/stalls/',
						element: <PollingPlaceStalls />,
					},
				],
			},
			{
				path: '/elections',
				element: <ElectionsManagerRoot />,
				loader: () => ({
					name: 'Elections',
				}),
				children: [
					// Root page: Displays the lists of future, current, and past elections
					{
						path: '/elections/',
						element: <ElectionsManager />,
					},
					// Election creation
					{
						path: '/elections/create/',
						element: <ElectionCreator />,
					},
					// Election editing: Form
					{
						path: '/elections/edit/:election_name/',
						element: <ElectionEditor />,
					},
					// Election editing: Controls
					{
						path: '/elections/edit/:election_name/controls/',
						element: <ElectionEditorControls />,
					},
					// Election editing: Load Polling Places
					{
						path: '/elections/edit/:election_name/load_polling_places/',
						element: <ElectionEditorLoadPollingPlaces />,
					},
					// Election editing: Stats
					{
						path: '/elections/edit/:election_name/stats/',
						element: <ElectionEditorStats />,
					},
				],
			},
		],
	},
	{
		path: '*',
		element: <NotFound />,
	},
]);
