/// <reference types="vite/client" />

declare module 'react-google-maps-loader';
declare module 'material-ui-chip-input';
declare module 'react-list';
declare module 'redux-form-material-ui';
declare module 'ol-react';
declare module 'dot-prop-immutable';
declare module 'react-cookie';
declare module 'react-svg';
declare module 'react-google-maps';
declare module 'react-string-replace';
declare module 'react-tiny-virtual-list';
declare module 'material-ui-bottom-sheet';
declare module 'material-ui-search-bar';
declare module 'material-ui-fullscreen-dialog';
declare module 'material-ui-responsive-drawer';
declare module 'redux-responsive';
declare module 'react-vis';

interface ImportMetaEnv {
	readonly BASE_URL: string;
	readonly DEV: boolean;
	readonly MODE: string;
	readonly PROD: boolean;
	readonly SSR: boolean;
	readonly VITE_ENVIRONMENT: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
	readonly VITE_SITE_BASE_URL: string;
	readonly VITE_API_BASE_URL: string;
	readonly VITE_PUBLIC_SITE_BASE_URL: string;
	readonly VITE_GOOGLE_MAPS_API_KEY: string;
	readonly VITE_GOOGLE_ANALYTICS_UA: string;
	readonly VITE_RAVEN_URL: string;
	readonly VITE_RAVEN_SITE_NAME: string;
	readonly VITE_SENTRY_ORGANISATION_NAME: string;
	readonly VITE_SENTRY_PROJECT_NAME: string;
	readonly VITE_SENTRY_AUTH_TOKEN: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
