import * as ReactGA from 'react-ga';
import { isDevelopment } from '../../redux/modules/app';
import { IStore } from '../../redux/modules/reducer';

if ('VITE_GOOGLE_ANALYTICS_UA' in import.meta.env) {
	ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_UA!);
}

class GATracker {
	verbose: boolean;

	alwaysSend: boolean;

	constructor(verbose = false, alwaysSend = false) {
		this.verbose = verbose;
		this.alwaysSend = alwaysSend;
	}

	pageview(path: string) {
		if (isDevelopment() === false || this.alwaysSend === true) {
			ReactGA.set({ page: path });
			ReactGA.pageview(path);
		}

		if (this.verbose === true) {
			console.log('GATracker:pageview', path);
		}
	}

	// event(cfg: ReactGA.EventArgs) {
	event(cfg: any) {
		if (isDevelopment() === false || this.alwaysSend === true) {
			ReactGA.event(cfg);
		}

		if (this.verbose === true) {
			console.log('GATracker:event', cfg);
		}
	}
}

const gaTrack = new GATracker();

const AnalyticsMiddleware = (_store: IStore) => (next: Function) => (action: any) => {
	if ('meta' in action && 'analytics' in action.meta) {
		gaTrack.event({ ...action.meta.analytics, type: action.type });
	}

	const result = next(action);
	return result;
};

const fireAnalyticsTracking = () => {
	gaTrack.pageview(window.location.pathname + window.location.search);
};

export interface IAnalyticsMeta {
	category: string;
	type?: string;
	payload?: {
		[key: string]: any;
	};
}

export { AnalyticsMiddleware, fireAnalyticsTracking, gaTrack };
