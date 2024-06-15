import * as Sentry from '@sentry/browser';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// import { AnalyticsMiddleware, fireAnalyticsTracking } from "./shared/analytics/GoogleAnalytics"
import thunkMiddleware from 'redux-thunk';
import './index.css';
import './polyfills';
// if ("GOOGLE_ANALYTICS_UA" in Config) {
//     Middleware.push(AnalyticsMiddleware as any)
// }
import { eAppEnv, getEnvironment } from './redux/modules/app';
import reducers, { IStore } from './redux/modules/reducer';
import sentry from './redux/sentry';
import getRoutes from './routes';
import { APIClient } from './shared/api/APIClient';
// const Config: IConfig = require("Config") as any

// declare var DEVELOPMENT: boolean
const Middleware: Array<any> = [];

// This should be run as soon as possible
if (getEnvironment() !== eAppEnv.DEVELOPMENT) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: `${import.meta.env.VITE_ENVIRONMENT}-ADMIN`.toUpperCase(),
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		site: import.meta.env.VITE_SENTRY_SITE_NAME,
		attachStacktrace: true,
	});
	Middleware.push(sentry);
}

const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});
const store: Store<IStore> = createStore(
	reducers,
	composeEnhancers(
		// @TODO
		// responsiveStoreEnhancer,
		applyMiddleware(thunkMiddleware.withExtraArgument(new APIClient()), ...Middleware),
	),
);

const history = syncHistoryWithStore(browserHistory as any, store);

ReactDOM.render(
	// Too much legacy code is broken for StrictMode to be useful
	// <React.StrictMode>
	<Provider store={store}>
		{/* <Router history={history as any} onUpdate={"GOOGLE_ANALYTICS_UA" in Config ? fireAnalyticsTracking : () => {}}> */}
		<Router history={history as any}>{getRoutes(store as any)}</Router>
	</Provider>,
	// </React.StrictMode>
	document.getElementById('root'),
);
// registerServiceWorker()
