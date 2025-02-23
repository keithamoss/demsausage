import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv, Plugin } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
// https://docs.sentry.io/platforms/javascript/guides/react/sourcemaps/uploading/vite/
export default defineConfig(({ command, mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');

	return {
		server: {
			allowedHosts: ["public.test.democracysausage.org"]
		},
		build: {
			outDir: 'build',
			sourcemap: true,
			rollupOptions: {
				output: {
					manualChunks(id: string) {
						// Creating a chunk for third-party packages
						if (id.includes('/node_modules/')) {
							return 'vendor';
						}
					},
				},
			},
		},
		plugins: [
			react(),
			svgr({
				svgrOptions: {
					ref: true,
				},
			}),
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
			// Silence a whole bunch of sourcemap-related warnings from MaterialUI
			// Ref: https://github.com/vitejs/vite/issues/15012#issuecomment-1825035992
			muteWarningsPlugin(warningsToIgnore),
		],
		// Resolve the randomly occuring error with "styled_default is not a function" from Popper.js
		// https://github.com/mui/material-ui/issues/36515
		// Solution found in:
		// https://github.com/mui/material-ui/issues/31835#issuecomment-1734474232
		// It only seems to need @mui/icons-material for some reason, but including the rest here
		// as that was part of the original solution.
		optimizeDeps: {
			include: [
				'@mui/material/Tooltip',
				'@mui/icons-material',
				// '@mui/material',
				// '@mui/system',
				// '@mui/x-date-pickers',
				// '@emotion/react',
				// '@emotion/styled',
			],
		},
	};
});

const warningsToIgnore = [['SOURCEMAP_ERROR', "Can't resolve original location of error"]];

const muteWarningsPlugin = (warningsToIgnore: string[][]): Plugin => {
	const mutedMessages = new Set();
	return {
		name: 'mute-warnings',
		enforce: 'pre',
		config: (userConfig) => ({
			build: {
				rollupOptions: {
					onwarn(warning, defaultHandler) {
						if (warning.code) {
							const muted = warningsToIgnore.find(
								([code, message]) => code == warning.code && warning.message.includes(message),
							);

							if (muted) {
								mutedMessages.add(muted.join());
								return;
							}
						}

						if (userConfig.build?.rollupOptions?.onwarn) {
							userConfig.build.rollupOptions.onwarn(warning, defaultHandler);
						} else {
							defaultHandler(warning);
						}
					},
				},
			},
		}),
		closeBundle() {
			const diff = warningsToIgnore.filter((x) => !mutedMessages.has(x.join()));
			if (diff.length > 0) {
				this.warn('Some of your muted warnings never appeared during the build process:');
				diff.forEach((m) => this.warn(`- ${m.join(': ')}`));
			}
		},
	};
};
