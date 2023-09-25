import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';

import App from '../../App';
// import FeatureEditor from '../../features/features/featureEditor';
// import FeatureManager from '../../features/features/featureManager';
// import MapCreator from '../../features/maps/mapCreator';
// import MapEditor from '../../features/maps/mapEditor';
// import MapManager from '../../features/maps/mapsManager';
// import SchemaCreator from '../../features/schemas/schemaCreator';
// import SchemaDeleteManager from '../../features/schemas/schemaDeleteManager';
// // eslint-disable-next-line import/no-named-as-default
// import DebugView from '../../features/app/debugView';
// import SchemaEditorEntrypoint from '../../features/schemas/schemaEditor';
// import SchemaManager from '../../features/schemas/schemaManager';
// import SearchManager from '../../features/search/searchManager';
// import SettingsManager from '../../features/settings/settingsManager';

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{
				path: ':election_name',
				element: <App />,
			},
			// {
			// 	path: 'MapManager',
			// 	element: <MapManager />,
			// },
			// {
			// 	path: 'MapManager/Create',
			// 	element: <MapCreator />,
			// },
			// {
			// 	path: 'MapManager/Edit/:mapId',
			// 	element: <MapEditor />,
			// },
			// {
			// 	path: 'SchemaManager',
			// 	element: <SchemaManager />,
			// },
			// {
			// 	path: 'SchemaManager/Create',
			// 	element: <SchemaCreator />,
			// },
			// {
			// 	path: 'SchemaManager/Edit/:schemaId',
			// 	element: <SchemaEditorEntrypoint />,
			// },
			// {
			// 	path: 'SchemaManager/Delete/:schemaId',
			// 	element: <SchemaDeleteManager />,
			// },
			// {
			// 	path: 'FeatureManager',
			// 	element: <FeatureManager />,
			// },
			// {
			// 	path: 'FeatureManager/Edit/:featureId',
			// 	element: <FeatureEditor />,
			// },
			// {
			// 	path: 'SearchManager',
			// 	element: <SearchManager />,
			// },
			// {
			// 	path: 'SettingsManager',
			// 	element: <SettingsManager />,
			// },
		],
	},
]);
