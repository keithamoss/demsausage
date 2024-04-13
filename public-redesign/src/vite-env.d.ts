/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly BASE_URL: string;
	readonly DEV: boolean;
	readonly MODE: string;
	readonly PROD: boolean;
	readonly SSR: boolean;
	readonly VITE_ENVIRONMENT: 'DEVELOPMENT' | 'TEST' | 'PRODUCTION';
	readonly VITE_SITE_BASE_URL: string;
	readonly VITE_API_BASE_URL: string;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SENTRY_ORGANISATION_NAME: string;
	readonly VITE_SENTRY_PROJECT_NAME: string;
	readonly VITE_SENTRY_SITE_NAME: string;
	readonly VITE_SENTRY_AUTH_TOKEN: string;
	readonly VITE_MAPBOX_API_KEY_DEV: string;
	readonly VITE_MAPBOX_API_KEY_PROD: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
