// https://github.com/captbaritone/raven-for-redux/issues/93#issuecomment-435854873

import * as Sentry from '@sentry/browser';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { Event } from '@sentry/types'
import { Action, Dispatch, MiddlewareAPI } from 'redux';
import { IStore } from './modules/reducer';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
const sentry = (store: MiddlewareAPI<IStore>) => {
	Sentry.addGlobalEventProcessor((event) => {
		const stateCopy = JSON.parse(JSON.stringify(store.getState()));
		if ('map' in stateCopy && 'geojson' in stateCopy.map) {
			stateCopy.map.geojson = Object.keys(stateCopy.map.geojson);
		}

		return {
			...event,
			extra: {
				...event.extra,
				'redux:state': stateCopy,
			},
		};
	});

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore-next-line
	return (next: Dispatch<IStore>) => (action: Action) => {
		Sentry.addBreadcrumb({
			category: 'redux-action',
			message: action.type,
		});

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		return next(action);
	};
};

export default sentry;
