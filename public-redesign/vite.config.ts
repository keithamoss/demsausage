import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
// https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/
export default defineConfig(({ command, mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');

	return {
		build: {
			outDir: 'build',
		},
		plugins: [
			react(),
			viteTsconfigPaths(),
			checker({
				typescript: true,
			}),
			// Put the Sentry vite plugin after all other plugins
			sentryVitePlugin({
				org: env.VITE_SENTRY_ORGANISATION_NAME,
				project: env.VITE_SENTRY_PROJECT_NAME,

				// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
				// and need `project:releases` and `org:read` scopes
				authToken: env.VITE_SENTRY_AUTH_TOKEN,

				sourcemaps: {
					// Specify the directory containing build artifacts
					assets: './**',
					// Don't upload the source maps of dependencies
					ignore: ['./node_modules/**'],
				},
			}),
		],
	};
});
