import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom';

if ('VITE_SENTRY_DSN' in import.meta.env === false) {
	throw new Error('VITE_SENTRY_DSN not found');
}

export const sentryInit = () => {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: `${import.meta.env.VITE_ENVIRONMENT}-PUBLIC`.toUpperCase(),
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		site: import.meta.env.VITE_SENTRY_SITE_NAME,
		attachStacktrace: true,
		integrations: [
			Sentry.reactRouterV6BrowserTracingIntegration({
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
				// stripBasename,
			}),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,

		// Or however deep you want your Redux state context to be
		normalizeDepth: 10,

		beforeSend(event) {
			if (event.exception) {
				Sentry.showReportDialog({ eventId: event.event_id });
			}

			return event;
		},
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return Sentry.createReduxEnhancer({
		// Optionally pass options listed below
	});
};
