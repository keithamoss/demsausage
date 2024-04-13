import * as Sentry from '@sentry/react';
import { createBrowserRouter } from 'react-router-dom';
import App from '../../App';
import AboutPage from '../../features/aboutPage/AboutPage';
import Map from '../../features/map/map';

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
				path: ':election_name',
				element: <Map />,
			},
			{
				path: '',
				element: <Map />,
			},
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
