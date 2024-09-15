// This must be the first line in src/index.js
import * as Sentry from '@sentry/browser';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import './index.css';
import './polyfills';
import { eAppEnv, getEnvironment } from './redux/modules/app';
import reducers, { IStore } from './redux/modules/reducer';
import sentry from './redux/sentry';
import reportWebVitals from './reportWebVitals';
import getRoutes from './routes';
import { AnalyticsMiddleware, fireAnalyticsTracking } from './shared/analytics/GoogleAnalytics';
import { APIClient } from './shared/api/APIClient';
import { rtkQueryErrorLogger, sausageApi } from './shared/api/APIClient-RTK';

// const Config: IConfig = require("Config") as any

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

if ('VITE_GOOGLE_ANALYTICS_UA' in import.meta.env) {
	Middleware.push(AnalyticsMiddleware as any);
}

const composeEnhancers = composeWithDevTools({
	// Specify name here, actionsBlacklist, actionsCreators and other options if needed
});
const store: Store<IStore> = createStore(
	reducers,
	composeEnhancers(
		// @TODO
		// responsiveStoreEnhancer,
		applyMiddleware(
			thunkMiddleware.withExtraArgument(new APIClient()),
			sausageApi.middleware,
			rtkQueryErrorLogger,
			...Middleware,
		),
	),
);

const history = syncHistoryWithStore(browserHistory as any, store);

ReactDOM.render(
	// Too much legacy code is broken for StrictMode to be useful
	// <React.StrictMode>
	<Provider store={store}>
		<Router
			history={history as any}
			onUpdate={'VITE_GOOGLE_ANALYTICS_UA' in import.meta.env ? fireAnalyticsTracking : undefined}
		>
			{getRoutes(store as any)}
		</Router>
	</Provider>,
	// </React.StrictMode>
	document.getElementById('root'),
);
// registerServiceWorker()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
